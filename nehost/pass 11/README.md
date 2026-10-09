# NE self-load host

`unfold.py` is the Win16 scaffold for the ToolBook OPTLOADER binaries. It is not a book runtime. It loads segment 1 of a self-loading NE image, enters 16-bit protected mode, and calls `BootApp` at segment 1 offset `0x169`. The stub unpacks itself, resolves twelve KERNEL ordinals, and calls `LoadAppSeg` for every preload segment. Each segment it materializes is written out.

The host answers only the calls the loader actually makes:

- `AllocCStoDSAlias`, `__AHINCR`
- `GlobalAlloc`, `GlobalReAlloc`, `GlobalFree`, `GlobalLock`
- `GlobalDOSAlloc`, `GlobalDOSFree`, `FreeSelector`, `SelectorAccessRights`
- `GetWinFlags`, `PatchCodeHandle`, `GetProcAddress`, `DOS3Call`
- the two handshake slots at loader offsets `0x10` and `0x24` (selector allocate, owner notify)

USER, GDI, VBX, OLE and the universal thunk are not implemented. A lesson will not run here. The Win98 VM remains the place to dump a live page object.

Requires the Unicorn CPU emulator. It is not in the standard library.

```
python -m pip install unicorn
python unfold.py D:\courses\courses\TB80RTM.EXE -o rtm --trace
```

`-o` is a normal directory. On Windows use `rtm` or `C:\Users\brian\Downloads\nehost\rtm`, not `/tmp/rtm`.

`BootApp` returns nonzero (it returns SP) when the unfold finished. On TB80RTM that is 139 segments. Segment 2 matches the static unpacker in `unpack_optloader.py` apart from the fixups the live loader applied.

Named `GetProcAddress` during relocation still resolves to a dummy thunk. The bytes come out; the import targets are not the real KERNEL entries.
