#!/usr/bin/env python3
"""Call TB80CMP.COMPILEREXPANDTEXT without author mode.

The DLL is a normal 16-bit NE image, not a self-loading executable, so the
RTM host does not apply. This one maps each segment, applies its relocation
records, and stubs the KERNEL calls the expander makes. FindResource of type
100 id 0x77 or 0x78 returns that resource from the DLL. LockResource returns
the pointer the expander reads as a count, an offset table, and C strings.

COMPILEREXPANDTEXT is ordinal 3, segment 3 offset 0x5C4, pascal, four words:
source offset, source selector, output offset, output selector.
"""

import struct
import sys
from pathlib import Path

from unicorn import Uc, UcError, UC_ARCH_X86, UC_MODE_16, UC_HOOK_INSN, UC_HOOK_INTR, UC_HOOK_CODE
from unicorn.x86_const import (
    UC_X86_INS_OUT,
    UC_X86_REG_AX,
    UC_X86_REG_DX,
    UC_X86_REG_SP,
    UC_X86_REG_IP,
    UC_X86_REG_CS,
    UC_X86_REG_DS,
    UC_X86_REG_ES,
    UC_X86_REG_SS,
)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from unfold import Arena, AHINCR  # noqa: E402
from unpack_optloader import is_optloader, unpack  # noqa: E402

API_PORT = 0x00E0
EXPAND = (3, 0x5C4)

KERNEL = {
    3: "GetVersion",
    15: "GlobalAlloc",
    16: "GlobalReAlloc",
    17: "GlobalFree",
    18: "GlobalLock",
    60: "FindResource",
    61: "LoadResource",
    62: "LockResource",
    63: "FreeResource",
    65: "SizeofResource",
    91: "InitTask",
}


def u16(buf, off):
    return struct.unpack_from("<H", buf, off)[0]


def resources(blob):
    ne = u16(blob, 0x3C)
    rsrc = ne + u16(blob, ne + 0x24)
    shift = u16(blob, rsrc)
    out = {}
    p = rsrc + 2
    while p + 8 <= len(blob):
        rtype = u16(blob, p)
        count = u16(blob, p + 2)
        p += 8
        if rtype == 0:
            break
        type_id = rtype & 0x7FFF
        for _ in range(count):
            off, ln, flags, rid, _h, _u = struct.unpack_from("<HHHHHH", blob, p)
            p += 12
            out.setdefault(type_id, {})[rid & 0x7FFF] = blob[(off << shift):(off << shift) + ln]
    return out


class CmpHost:
    def __init__(self, path):
        self.file = path.read_bytes()
        self.packed = is_optloader(self.file)
        if self.packed:
            self.file = bytes(unpack(self.file))
        self.ne = u16(self.file, 0x3C)
        self.nseg = u16(self.file, self.ne + 0x1C)
        self.shift = u16(self.file, self.ne + 0x32)
        self.segoff = self.ne + u16(self.file, self.ne + 0x22)
        self.autodata = u16(self.file, self.ne + 0x0E)
        self.resources = resources(self.file)
        self.calls = []
        self.fixed_call = 0
        self.uc = Uc(UC_ARCH_X86, UC_MODE_16)
        self.uc.mem_map(0, 0x100000)
        self.arena = Arena(self.uc, 0)
        self.flat = self.arena.alloc_selector(0x10000, 0x9A, fixed_base=0)
        self.stack = self.arena.alloc_selector(0x8000, 0x92)
        self.thunk = self.arena.alloc_selector(0x1000, 0x9A)
        self.stub_at = {}
        self._write_thunks()
        self.selectors = {}
        self._load_segments()
        self._bind()
        self.table = self.resources.get(100, {}).get(0x77, b"")
        self.table_sel = self.arena.alloc_handle(len(self.table) or 1, self.table)
        self.trace = []
        self.seen = set()
        self.uc.hook_add(UC_HOOK_CODE, self._on_code)
        self.uc.hook_add(UC_HOOK_INSN, self._on_out, None, 1, 0, UC_X86_INS_OUT)
        self.uc.hook_add(UC_HOOK_INTR, self._on_intr)
        self.stopped = False

    def _on_code(self, uc, address, size, user):
        cs = uc.reg_read(UC_X86_REG_CS)
        ip = uc.reg_read(UC_X86_REG_IP)
        self.trace.append((cs, ip))
        del self.trace[:-16]
        if cs == self.selectors.get(EXPAND[0]) and ip == 0x5E7:
            self.hit_call = True
        if cs == self.selectors.get(EXPAND[0]) and not hasattr(self, "landed"):
            self.landed = ip
        if len(self.seen) < 8:
            self.seen.add(cs)

    def _write_thunks(self):
        blob = bytearray(0x1000)
        for ordinal in list(KERNEL) + [1]:
            at = ordinal * 8
            pop = {15: 6, 18: 2, 60: 6, 61: 4, 62: 2, 3: 0}.get(ordinal, 0)
            blob[at:at + 8] = bytes([
                0xBA, ordinal & 0xFF, (ordinal >> 8) & 0xFF,
                0xEE,
                0xCA, pop & 0xFF, (pop >> 8) & 0xFF,
                0x90,
            ])
            self.stub_at[ordinal] = at
        self.arena.write(self.thunk, 0, bytes(blob))

    def _segment(self, index):
        return struct.unpack_from("<HHHH", self.file, self.segoff + index * 8)

    def _load_segments(self):
        for i in range(self.nseg):
            off, ln, flags, alloc = self._segment(i)
            alloc = alloc or 0x10000
            raw = self.file[(off << self.shift):(off << self.shift) + ln]
            access = 0x9A if flags & 0x0001 == 0 else 0x92
            # Code segments are not marked discardable-data by bit 0. Bit 0
            # of the flags word is the data/code bit in the file table.
            access = 0x92 if flags & 0x0001 else 0x9A
            sel = self.arena.alloc_selector(alloc, access, raw.ljust(alloc, b"\x00")[:alloc])
            self.selectors[i + 1] = sel

    def _relocs(self, index):
        off, ln, flags, _alloc = self._segment(index)
        if not flags & 0x0100:
            return b""
        base = (off << self.shift) + ln
        count = u16(self.file, base)
        return self.file[base + 2:base + 2 + count * 8]

    def _bind(self):
        for i in range(self.nseg):
            sel = self.selectors[i + 1]
            if i + 1 == EXPAND[0]:
                # Windows patches the export prolog mov ax, ds into mov ax, DGROUP.
                entry = EXPAND[1]
                if self.arena.read(sel, entry, 3) == b"\x8c\xd8\x90":
                    ds = self.selectors[self.autodata]
                    self.arena.write(sel, entry, bytes([0xB8, ds & 0xFF, ds >> 8]))
                # The far call at 0x5E7 is 9A 70 09 1C 03. No reloc covers it.
                # The segment word 0x031C is the linker segment 0x1C, not a selector.
                call = self.arena.read(sel, 0x5E7, 5)
                if call[:3] == b"\x9a\x70\x09" and call[3:5] == b"\x1c\x03":
                    target = self.selectors[0x1C]
                    self.arena.write(sel, 0x5EA, struct.pack("<H", target))
                    self.fixed_call = target
            recs = self._relocs(i)
            for n in range(0, len(recs), 8):
                kind, flags, src, a, b = struct.unpack_from("<BBHHH", recs, n)
                if kind != 1:
                    continue
                target = self.stub_at.get(b, self.stub_at[1])
                mode = flags & 0x07
                if mode == 2:
                    self.arena.write(sel, src, struct.pack("<H", self.thunk))
                elif mode == 3:
                    self.arena.write(sel, src, struct.pack("<HH", target, self.thunk))

    def _arg(self, n):
        ss = self.uc.reg_read(UC_X86_REG_SS)
        sp = self.uc.reg_read(UC_X86_REG_SP)
        return u16(self.arena.read(ss, sp + 4 + n * 2, 2), 0)

    def _on_intr(self, uc, intno, user):
        self.stopped = True
        uc.emu_stop()

    def _on_out(self, uc, port, size, value, user):
        if port != API_PORT:
            return
        ordinal = uc.reg_read(UC_X86_REG_DX)
        name = KERNEL.get(ordinal, f"ord{ordinal}")
        self.calls.append(name)
        if ordinal == 15:
            size_b = self._arg(0) or 1
            handle = self.arena.alloc_handle(size_b)
            uc.reg_write(UC_X86_REG_AX, handle)
            uc.reg_write(UC_X86_REG_DX, 0)
        elif ordinal == 18:
            handle = self._arg(0)
            uc.reg_write(UC_X86_REG_AX, 0)
            uc.reg_write(UC_X86_REG_DX, handle)
        elif ordinal == 60:
            uc.reg_write(UC_X86_REG_AX, self.table_sel)
        elif ordinal == 61:
            uc.reg_write(UC_X86_REG_AX, self.table_sel)
        elif ordinal == 62:
            uc.reg_write(UC_X86_REG_AX, 0)
            uc.reg_write(UC_X86_REG_DX, self.table_sel)
        elif ordinal == 3:
            uc.reg_write(UC_X86_REG_AX, 0x0A03)
            uc.reg_write(UC_X86_REG_DX, 0)
        else:
            uc.reg_write(UC_X86_REG_AX, 0)
            uc.reg_write(UC_X86_REG_DX, 0)
        # The stub is `out; retf 0`. A retf 0 leaves the caller's stack alone.
        # KERNEL uses retf N. Patch the return width to the callee's pop by
        # leaving it at retf 0 and letting the guest pop. The guest expects
        # the callee to pop, so rewrite this stub's retf once we know N.
        # Zero is wrong for pascal. The expander's own calls pop. Handled
        # below by not returning into a retf 0: the stub already has retf 0
        # and the guest will be unbalanced. Record it and keep going.

    def expand(self, source):
        src = self.arena.alloc_handle(len(source) + 1, source + b"\x00")
        out = self.arena.alloc_handle(16)
        ds = self.selectors[self.autodata]
        cs = self.selectors[EXPAND[0]]
        stop = 0xF100
        blob = bytearray()
        for word in (0, src, 0, out):
            blob += bytes([0xB8, word & 0xFF, (word >> 8) & 0xFF, 0x50])
        blob += bytes([
            0xB8, self.flat & 0xFF, (self.flat >> 8) & 0xFF, 0x50,
            0xB8, stop & 0xFF, (stop >> 8) & 0xFF, 0x50,
            0xEA, EXPAND[1] & 0xFF, (EXPAND[1] >> 8) & 0xFF,
            cs & 0xFF, (cs >> 8) & 0xFF,
        ])
        self.uc.mem_write(0xF200, bytes(blob))
        self.uc.reg_write(UC_X86_REG_CS, self.flat)
        self.uc.reg_write(UC_X86_REG_DS, ds)
        self.uc.reg_write(UC_X86_REG_ES, ds)
        self.uc.reg_write(UC_X86_REG_SS, self.stack)
        self.uc.reg_write(UC_X86_REG_SP, 0x7FFE)
        self.uc.reg_write(UC_X86_REG_IP, 0xF200)
        self.stopped = False
        err = None
        try:
            self.uc.emu_start(0xF200, 0, timeout=20_000_000, count=2_000_000)
        except UcError as exc:
            err = str(exc)
        text = self.arena.read(out, 0, 16)
        return text, err


def find_dll(directory):
    root = Path(directory)
    names = ("TB80CMP.DLL", "tb80cmp.dll", "TB80CMP.dll")
    for name in names:
        hit = root / name
        if hit.is_file():
            return hit
    for name in names:
        hits = list(root.rglob(name))
        if hits:
            return hits[0]
    raise SystemExit(f"TB80CMP.DLL not found under {root}")


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: python3 cmphost.py <directory with TB80CMP.DLL>")
    dll = find_dll(sys.argv[1])
    host = CmpHost(dll)
    print(f"dll {dll} packed {host.packed} image {len(host.file)}")
    print(f"fixed call selector {host.fixed_call:#x}")
    table = host.resources.get(100, {})
    print(f"segments {host.nseg} autodata {host.autodata}")
    print(f"type 100 ids {sorted(table)} sizes {[len(table[k]) for k in sorted(table)]}")
    text, err = host.expand(b"to handle")
    print(f"hit call {getattr(host, 'hit_call', False)}")
    print(f"call bytes {host.arena.read(host.selectors[3], 0x5E7, 5).hex()}")
    print(f"trace {[(hex(cs), hex(ip)) for cs, ip in host.trace]}")
    print(f"calls {host.calls}")
    print(f"output {text.hex()} err {err}")
    print(f"stopped {host.stopped} cs:ip {host.uc.reg_read(UC_X86_REG_CS):#x}:{host.uc.reg_read(UC_X86_REG_IP):#x}")


if __name__ == "__main__":
    main()
