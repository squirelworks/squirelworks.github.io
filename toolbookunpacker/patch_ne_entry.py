# in order to get unpacked Toolbox 8.0 files into Ghidra... Needed to do some magic with Grok AI

#!/usr/bin/env python3
"""Write a zero bundle count at the start of an NE entry table.

Ghidra 12.1.4 ignores the entry-table length and reads until a count byte
of 0. A fixed bundle then uses that type byte as a signed segment index,
which throws Index -122 on these ToolBook DLLs. Zeroing the first count
byte makes the parser stop. Segments still load; export ordinals do not.

    python3 patch_ne_entry.py TB80W16.DLL TB80UTL.DLL TB80OLE.DLL TB80LNL.DLL TB80RCR.DLL
"""

from __future__ import annotations

import struct
import sys
from pathlib import Path

FIVE = ("TB80W16.DLL", "TB80UTL.DLL", "TB80OLE.DLL", "TB80LNL.DLL", "TB80RCR.DLL")


def patch(path: Path) -> Path:
    data = bytearray(path.read_bytes())
    if data[:2] != b"MZ":
        raise SystemExit(f"{path.name} is not an MZ file")
    lfanew = struct.unpack_from("<I", data, 0x3C)[0]
    if lfanew + 8 > len(data) or data[lfanew:lfanew + 2] != b"NE":
        raise SystemExit(f"{path.name} has no NE header at 0x{lfanew:x}")
    entry_off, entry_len = struct.unpack_from("<HH", data, lfanew + 4)
    entry_at = lfanew + entry_off
    if not 0 <= entry_at < len(data):
        raise SystemExit(f"{path.name}: entry table offset 0x{entry_at:x} is past end of file")
    print(
        f"{path.name}: NE at 0x{lfanew:x}, entry table at 0x{entry_at:x} "
        f"(offset 0x{entry_off:x}, length 0x{entry_len:x}), first byte was 0x{data[entry_at]:02x}"
    )
    data[entry_at] = 0
    struct.pack_into("<H", data, lfanew + 6, 0)
    out = path.with_name(path.name + ".noentry")
    out.write_bytes(data)
    print(f"wrote {out}")
    return out


def main() -> int:
    names = sys.argv[1:] or list(FIVE)
    missing = [n for n in names if not Path(n).is_file()]
    if missing:
        raise SystemExit("not in this directory: " + ", ".join(missing))
    for name in names:
        patch(Path(name))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
