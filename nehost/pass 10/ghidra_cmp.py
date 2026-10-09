#!/usr/bin/env python3
"""Make a Ghidra-loadable TB80CMP image from the packed or unpacked DLL.

Ghidra's NE loader sign-extends an entry-table segment byte. This script
unpacks OPTLOADER if needed, clears the self-loading flag, and rewrites an
entry segment byte above 127 to 1. CMP has no such byte. The existing
TB80CMP.DLL.noentry file is a copy of the unpacked image, not a patch.

Usage: python3 ghidra_cmp.py <directory with TB80CMP.DLL>
"""

import struct
import sys
from pathlib import Path

from unpack_optloader import is_optloader, unpack


def find_dll(directory):
    root = Path(directory)
    for name in ("TB80CMP.DLL", "tb80cmp.dll"):
        hit = root / name
        if hit.is_file():
            return hit
    raise SystemExit(f"TB80CMP.DLL not found in {root}")


def prepare(data):
    packed = is_optloader(data)
    image = bytearray(bytes(unpack(data)) if packed else data)
    ne = struct.unpack_from("<H", image, 0x3C)[0]
    flags = struct.unpack_from("<H", image, ne + 0x0C)[0]
    struct.pack_into("<H", image, ne + 0x0C, flags & ~0x0800)
    ent = ne + struct.unpack_from("<H", image, ne + 4)[0]
    elen = struct.unpack_from("<H", image, ne + 6)[0]
    i = ent
    rewritten = []
    while i < ent + elen:
        count = image[i]
        i += 1
        if count == 0:
            break
        seg = image[i]
        if seg >= 0x80 and seg != 0xFF:
            image[i] = 1
            rewritten.append(seg)
        i += 1
        if seg == 0:
            continue
        i += count * (6 if seg == 0xFF else 3)
    return bytes(image), packed, flags, rewritten


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: python3 ghidra_cmp.py <directory with TB80CMP.DLL>")
    dll = find_dll(sys.argv[1])
    image, packed, flags, rewritten = prepare(dll.read_bytes())
    out = dll.with_name("TB80CMP.ghidra.dll")
    out.write_bytes(image)
    print(f"source {dll} packed {packed} flags {flags:#x}")
    print(f"rewrote entry segments {rewritten or 'none'}")
    print(f"wrote {out} size {len(image)}")


if __name__ == "__main__":
    main()
