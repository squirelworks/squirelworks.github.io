# Architecture

GraalShop is a Delphi VCL application with a thin domain layer (`TGraalAni` and friends) under a single editor form (`TEditFrame`). Preview and sound go through DelphiX-style DirectX 7 wrappers (`TDXDraw7`, `TDirectDraw7`, `TDXSound7`), not through GDI for the animation canvas.

```
GraalShop.exe
├── Delphi RTL          memory manager, AnsiString, exceptions, file IO
├── VCL                 forms, grids, dialogs, menus, richedit
├── Graphics helpers    TGIF (ANIMEXTS1.0), TMNG, TDIB, TBitmap
├── DirectX 7 wrappers  TDXDraw7 / TDirectDrawSurface7 / TDXSound7 / TWaveCollection
├── Domain              TGraalAni, TGraalAniSprite, TGraalAniStep,
│                       TGraalActor, TGraalActorMod, TSurfaceOwner, TEditOperation
└── UI                  TEditFrame  (DAT_0048c610)  + one secondary form
```

See [diagrams/architecture.svg](diagrams/architecture.svg) and [diagrams/classes.svg](diagrams/classes.svg).

## Layers

### Runtime

The front of the dump is the Borland memory manager (`InitAllocator`, `SysGetMem`, `Commit`, `Decommit`, small-block search) and the Delphi exception machine (`_HandleOnException`, `_HandleFinally`, `NotifyUnhandled`). Strings are Delphi AnsiStrings (`_LStrAsg`, `_LStrCat3`, `_LStrPos`). That matters for the parser: every GANI token is an AnsiString, comparisons are case-sensitive on the already-lowercased line, and `StrToInt` failures are thrown as Delphi exceptions.

### VCL shell

Stock VCL is linked in full enough to include `TStringGrid`, `TInplaceEdit`, `TOpenDialog`, `TSpeedButton`, `TScrollBar`, `TCheckBox`, `TRichEdit`, dock trees, and action lists. The editor grid is a `TStringGrid` (wheel and cell-rect calls in the dump). Script text is a rich edit (`TEditFrame_RichEdit1Exit`).

Two forms are created. Only one has recovered event handlers, and those are all `TEditFrame_*`. The second form is created and then left unnamed by Ghidra; treat it as an auxiliary dialog, not a second document.

### Picture and sound codecs

- `TGifAnimation_Create` rejects a bad GIF with `"Gif loading failed!"` and recognizes the Netscape application extension `ANIMEXTS1.0` (loop count).
- `TMNGAnimation_Create` rejects a bad MNG with `"MNG loading failed!"`.
- zlib messages (`invalid distance code`, `oversubscribed literal/length tree`, …) sit in the same binary, so MNG/PNG-style inflate is linked.
- `TDIB` / `TBitmap` cover ordinary Windows bitmaps.
- `TWaveCollection` / `TWaveStream` / `TDirectSoundBuffer` play `PLAYSOUND` clips. `DSound.dll` is loaded on demand (`DirectSoundCreate`).

### DirectDraw preview

`TDXDraw7` owns an `IDirectDraw7` and a primary/offscreen `IDirectDrawSurface7`. `TEditFrame_DXDraw1Initialize` / `DXDraw1FinalizeSurface` bracket surface lifetime. A zoom above 1.0 allocates an extra `TDirectDrawSurface7` (`FUN_00485d40`); dropping back to 1.0 frees it. The scale lives in `gvar_0048818c` and is clamped to `[1.0, 16.0]`.

`TSurfaceOwner` is the domain-side holder for a loaded spritesheet (head, body, shield, sword, horse, param sheets). Each `TGraalActor` owns five of them.

### Domain

`TGraalAni` is the document. It owns three `TList`s (sprites, steps, and a third list used for attachments / lookup) plus the header flags. `TGraalActor` is the on-canvas mannequin: surfaces, default body/head, text style, and a 30-slot integer list. `TEditOperation` is a small command object (two constructors, one of them taking a pair of integers) used around edit gestures.

There is no plugin ABI and no networking in the dumped application code. Registry use is the Delphi RTL locale key and keyboard layout, not a Graal account store.

## Control flow, one screen

```
WinMain-equivalent EntryPoint
        │
        ▼
TEditFrame (message loop)
        │
        ├── SpeedButton9 ── open dialog "Load Graal Animation"
        │                      └── FUN_0047e0e8 load into actor
        │                            └── FUN_00477eb8 per line
        │
        ├── dirty? ── FUN_00479500 write GANI0001 or GANI0002
        │
        ├── MovieButton / FUN_0048383c ── sprite ↔ movie
        │
        └── DXDraw1 mouse / timer ── blit current step, DirectSound on PLAYSOUND
```

The form keeps the live actor at `TEditFrame+0x430`. The current document is `*(actor+0x50)`, returned by `FUN_0047e0c4`. A null actor means no animation is open.

## Binary facts worth keeping

- Image base is the usual Delphi `0x00400000`. Application code clusters at `0x0046e000`–`0x00485d40`; everything below that is RTL, VCL, GIF/MNG, and DirectX wrappers.
- `DAT_0048c610` is the editor form singleton. Asset root is `gvar_00488104`.
- File signature is chosen by the movie flag at `TGraalAni+0x20`: `0` → `GANI0001`, nonzero → `GANI0002`.
- Classic-vs-new body toggle (`TEditFrame_CheckBox2Click`) swaps `body.png` / idle-walk names for `body102.png` / `human_idle` / `human_walk`.
