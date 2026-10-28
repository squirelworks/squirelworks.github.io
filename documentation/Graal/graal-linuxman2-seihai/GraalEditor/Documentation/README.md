# GraalEditor.exe — reverse-engineering notes

GraalEditor 2.3.1.1 is the Graal Online classic level editor (Linux Cyberjoueur). The file in `graal/GraalEditor.exe` is not a Delphi image. It is a Thinstall (pre-VMware ThinApp) package. That is why IDR rejected it, and why the Ghidra C dump in `Export/GraalEditor.exe.c` is only 3,136 lines of loader.

The Delphi editor was recovered by running the stub decompressor and then the Thinstall `0xD7` block codec. The unpacked image is `unpacked/GraalEditor.exe` (1,729,536 bytes, Borland linker 2.25). Names below come from Delphi RTTI and binary DFM resources (`TPF0`), not from original source.

## Why the dump looks empty

`Export/GraalEditor.exe.c` decompiles the outer stub only (`entry` → `FUN_00401780` → `FUN_004013a0`). The optional-header `LoaderFlags` field is reused as a file offset (`0xFC94E`) of a 0x38-byte package header. Magic is `0x82D0B188`. The first block is the Thinstall runtime (`X:\thinstall\stub\ts_stub.cc`), not the editor. Ghidra never saw the Delphi code, so IDR had nothing with a Delphi VMT to reconstruct.

## What the program is

A single-window level editor (`TAdventure`, caption `Graal`) with modal tools for links, signs, NPCs, baddies, and chests.

- Levels open and save as `*.graal` and `*.nw`. Filter string: `Graal levels (*.graal, *.nw)|*.graal; *.nw`.
- A level is a text file with `BOARD`, `LINK`, `SIGN`, `CHEST`, `NPC`, `BADDY` / `BADDYEND`, and `LEVELNAMES` / `LEVELNAMESEND` sections. `BOARD 0` is the tile layer.
- World view is a gmap (`*.gmap`, `loadgmaps.txt`, `bigmap.txt`, `minimap.txt`, `graalmap.png`).
- Preview is DelphiX DirectDraw. Both DirectDraw 5 and DirectDraw 7 init failures are stringed. Sound is BASS (`bass.dll` is imported by the stub's import table and by the editor).
- Spritesheets are PNG, GIF, MNG. Failures are `Gif loading failed!`, `MNG loading failed!`, `Image loading failed!`.
- The same GANI classes as GraalShop are linked in: `TGraalAni`, `TGraalAniSprite`, `TGraalAniStep`, `TGraalActor`, `TGraalActorMod`, plus `TGraalAniPart`, `TGraalAniSound`, `TGraalSpriteAttachment`.

## Read this first

| Document | Contents |
| --- | --- |
| [packer.md](packer.md) | What the Ghidra dump actually is |
| [architecture.md](architecture.md) | Process, modules, class map |
| [data-model.md](data-model.md) | Level, link, sign, NPC, baddy, chest |
| [level-format.md](level-format.md) | On-disk sections the editor reads and writes |
| [flows.md](flows.md) | Load, save, paint, mode switch |
| [pseudocode.md](pseudocode.md) | Reconstructed procedures |
| [ui.md](ui.md) | Forms recovered from DFM |
| [diagrams/](diagrams/) | Packer, architecture, classes, load/save |

## Package contents

Thinstall virtual path `%InstallPath%`:

| File | Role |
| --- | --- |
| `GraalEditor.exe` | Delphi editor, version resource 2.3.1.1 |
| `hvdi.dll` | Bundled helper, 133,632 bytes. No Graal strings; not the editor core |
| `arrays.dat` | 11,500-byte sorted dword table (count word `0x03A6`) |
| `arrays2.dat` | Server list: `listserver.graalonline.com:14922` and two fallbacks |
| `arrays2.sig`, `graaleditor.sig` | 0x80-byte signatures. Stub string: `Not ready to verify signature, must have valid public key` |
| `thinstall.log` | Virtual log path |

`Setup_Graal` is the package group name. `TS_EXECUTE_EXTERNAL` is set in the package directory.
