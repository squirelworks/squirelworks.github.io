# ToolBook Function Naming Summary

Generated 2026-10-11. Brute-force pattern naming across decompiled modules.

## Totals

| Module | Unique | Nameable | Confirmed | Script |
|--------|--------|----------|-----------|--------|
| TB80BAS | 3,739 | 650 | **12** | rename/rename_bas.py |
| TB80RTM | 2,669 | 873 | **8** | rename/rename_rtm.py |
| TB80BMP | 381 | 99 | **11** | rename/rename_bmp.py |
| TB80CMP | 1,058 | 59 | **8** | rename/rename_cmp.py |
| TB80UTL | 192 | 79 | **7** | rename/rename_utl.py |
| TB80W16 | 330 | 57 | **8** | rename/rename_w16.py |
| TB80LNL | 805 | 98 | **7** | rename/rename_lnl.py |
| TB80MM | 191 | — | **7** | rename/rename_mm.py |
| TB80RCR | 323 | — | **9** | rename/rename_rcr.py |
| TB80FLT | 430 | — | **8** | rename/rename_flt.py |
| TB80NET | 513 | — | **8** | rename/rename_net.py |
| **Total** | **~10,991** | **~1,918** | **93** | — |

## Coverage

- Pattern nameable: ~17.5% of analyzed functions
- Confirmed (manual): 93
- Gap to 30% of analyzed: ~1,379

## Confirmed by Category

### Paint / Draw
- BAS: PaintPolygon, PaintPolyline, PaintArc, PaintArcAlt, PaintRectangle
- RTM: PaintRectangle, PaintRectangleAlt
- BMP: CreateDibBitmap, BitBltBmp
- RCR: RcrBitBlt
- FLT: FltBitBlt

### Scale / Property
- BAS: ScaleTwipsToScreen, SetProperty, SetPointArray, SetupPaintRect, SetScriptProperty, ValidateProperty, CheckVertices

### Memory / String
- All modules: *Alloc, *Lock, *StrCpy, *StrLen, *StrCat helpers

### Message / Window
- MM, RCR, FLT, NET, W16: *SendMessage, *CreateWindow helpers

### Compiler
- CMP: LoadCompilerResource, LockCompilerResource, ExpandTextCore, CompilerStr*

## Next Dig Targets

1. **BAS** — more paint variants (Ellipse, RoundRect, Pie), property setters (0x40xx)
2. **RTM** — book open path, page paint dispatch, object create
3. **BMP** — TBKBITMAP/TBKGRAPHICFX internals, compression
4. **CMP** — COMPILEREXPANDTEXT path, resource 0x77/0x78 emit

## Deep dig (2026-10-11 00:45)

### BAS additional (8)
- PaintEllipse, PaintEllipseAlt
- PaintRoundRect, PaintRoundRectAlt, PaintRoundRectAlt2
- PaintArc2
- SetMultiProperty, SetMultiProperty2

### BAS total now: 20

### Updated totals
| Module | Confirmed |
|--------|-----------|
| BAS | 20 |
| RTM | 8 |
| BMP | 11 |
| CMP | 8 |
| UTL | 7 |
| W16 | 8 |
| LNL | 7 |
| MM | 7 |
| RCR | 9 |
| FLT | 8 |
| NET | 8 |
| **Total** | **101** |

## Deep dig 2 (2026-10-11 00:46)

### BMP compression (3)
- Lz77Expand (FUN_1000_0031)
- Lz77ExpandCaller, Lz77ExpandCaller2

### RTM book (1)
- PaintPageRect (FUN_1398_05c6)

### Updated totals
| Module | Confirmed |
|--------|-----------|
| BAS | 20 |
| RTM | 9 |
| BMP | 14 |
| CMP | 8 |
| UTL | 7 |
| W16 | 8 |
| LNL | 7 |
| MM | 7 |
| RCR | 9 |
| FLT | 8 |
| NET | 8 |
| **Total** | **105** |

## Minor modules (2026-10-11 00:47)

### JPG (1) — `rename/rename_jpg.py`
- JpgAlloc

### VBX (6) — `rename/rename_vbx.py`
- VbxCreateWindow, VbxBitBlt, VbxBitBlt2
- VbxAlloc, VbxAlloc2, VbxAlloc3

### Updated totals
| Module | Confirmed |
|--------|-----------|
| BAS | 20 |
| RTM | 9 |
| BMP | 14 |
| CMP | 8 |
| UTL | 7 |
| W16 | 8 |
| LNL | 7 |
| MM | 7 |
| RCR | 9 |
| FLT | 8 |
| NET | 8 |
| JPG | 1 |
| VBX | 6 |
| **Total** | **112** |
