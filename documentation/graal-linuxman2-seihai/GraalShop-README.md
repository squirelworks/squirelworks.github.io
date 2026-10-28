# GraalShop.exe — reverse-engineering notes

GraalShop is a Delphi desktop editor for Graal Online animations. The name is a Photoshop pun: it edits pictures and `.gani` scripts, it is not the Graal item shop. These notes were reconstructed from the Ghidra C dump in `Export/GraalShop.exe.c` (about 90,664 lines) and checked against sample `.gani` files in the local client tree.

Nothing here is original source. Names such as `TGraalAni` and `TEditFrame` were recovered from Delphi RTTI. Functions that Ghidra left as `FUN_0047xxxx` are named in this folder by what they do. Field offsets are byte offsets from the object pointer (Delphi VMT at offset 0).

## What the program is

A single-document animation editor with a DirectDraw 7 preview.

- Sprite mode writes a `GANI0001` file: a sprite table plus `ANI` / `ANIEND` steps. This is the classic Graal player/NPC animation.
- Movie mode writes a `GANI0002` file: actors, per-actor `FRAME` mods, and a `MOVIE` / `MOVIEEND` block. Switching modes deletes the other kind of timeline.
- Preview is DirectX 7 (`IDirectDraw7`, `IDirectDrawSurface7`, `IDirectSound`). Zoom is a global scale clamped to 1.0–16.0.
- Spritesheets are GIF (with the `ANIMEXTS1.0` Netscape extension), MNG, and ordinary VCL bitmaps / DIBs. PNG shows up as a filename suffix and via zlib inflate errors in the linked decompressor.

## Read this first

| Document | Contents |
| --- | --- |
| [architecture.md](architecture.md) | Process, modules, class map |
| [data-model.md](data-model.md) | `TGraalAni`, sprite, step, actor layouts |
| [gani-format.md](gani-format.md) | On-disk grammar the parser and writer implement |
| [flows.md](flows.md) | Load, save, playback, mode switch |
| [pseudocode.md](pseudocode.md) | Reconstructed procedures |
| [ui-preview.md](ui-preview.md) | Form handlers, DirectDraw, asset lookup |
| [diagrams/](diagrams/) | SVG architecture, class, load/save, playback |

## Startup

`EntryPoint` (`Export/GraalShop.exe.c` near the end of the dump):

1. `_InitExe` — Delphi RTL / unit init, including the custom memory manager (`GetMem` / `SysGetMem` / commit-gap allocator).
2. `TApplication_Initialize`.
3. `TApplication_CreateForm` twice (VMTs `0x46ccf8` and `0x46be24`, instances `gvar_004882B0` and `gvar_004883D0`). The live editor object used everywhere else is `DAT_0048c610`, the `TEditFrame` form.
4. `TApplication_Run`, then `_Halt0`.

The image is a Borland Delphi GUI binary: `SOFTWARE\Borland\Delphi\RTL`, `ctl3d32.dll`, VCL classes (`TStringGrid`, `TOpenDialog`, `TSpeedButton`, `TRichEdit`), and Delphi exception frames (`in_FS_OFFSET`).

## Source anchors

| Role | Symbol in the dump | Approx. line |
| --- | --- | --- |
| Process entry | `EntryPoint` | 90648 |
| Current animation | `FUN_0047e0c4` | 87491 |
| Load path into the actor | `FUN_0047e0e8` | 87502 |
| Line parser | `FUN_00477eb8` | 84070 |
| Serializer | `FUN_00479500` | 84902 |
| Mode switch | `FUN_0048383c` | 89369 |
| Open button | `TEditFrame_SpeedButton9Click` | 88247 |
| Graal path + `FILENAMECACHE.txt` | `FUN_0046ed5c` | 79434 |
| Document ctor | `TGraalAni_Create` | 83183 |
| Sprite / step / actor ctors | `TGraalAniSprite_Create`, `TGraalAniStep_Create`, `TGraalActor_Create` | 79880–80407 |
