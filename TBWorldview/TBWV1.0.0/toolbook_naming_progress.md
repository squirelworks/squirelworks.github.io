# ToolBook Function Naming Progress

Generated 2026-10-11. Pattern-based nameable functions across decompiled modules.

## Overall

| Metric | Value |
|--------|-------|
| Modules analyzed | 8 of 13 |
| Unique functions (analyzed) | 10,991 |
| Nameable by pattern | 1,918 |
| Coverage | **17.5%** |
| 30% target | 3,297 |
| Gap | ~1,379 |

## Per Module

| Module | Unique | Nameable | % | List |
|--------|--------|----------|---|------|
| TB80BAS | 3,739 | 650 | 17.4% | bas_nameable.tsv |
| TB80RTM | 2,669 | 873 | 32.7% | rtm_nameable.tsv |
| TB80CMP | 1,058 | 59 | 5.6% | cmp_nameable.tsv |
| TB80BMP | 381 | 99 | 26.0% | bmp_nameable.tsv |
| TB80UTL | 192 | 79 | 41.1% | utl_nameable.tsv |
| TB80W16 | 330 | 57 | 17.3% | w16_nameable.tsv |
| TB80LNL | 805 | 98 | 12.2% | lnl_nameable.tsv |
| TB80JPG | 167 | 3 | 1.8% | — |
| TB80MM | 191 | — | — | not analyzed |
| TB80RCR | 323 | — | — | not analyzed |
| TB80FLT | 430 | — | — | not analyzed |
| TB80NET | 513 | — | — | not analyzed |
| TBWIN | 193 | — | — | not analyzed |

## Confirmed Names (BAS)

| Function | Name |
|----------|------|
| FUN_1408_0376 | PaintPolygon |
| FUN_1008_01dd | ScaleTwipsToScreen |
| FUN_12d0_03ec | SetProperty |
| FUN_1408_00d8 | SetPointArray |
| FUN_12d0_086c | SetupPaintRect |
| FUN_10a0_0558 | PaintArc |
| FUN_10a0_0458 | PaintArcAlt |

## Pattern Categories

- **GDI**: POLYGON, POLYLINE, ARC, ELLIPSE, RECTANGLE, BITBLT, STRETCHBLT, TEXTOUT, CREATEPEN, CREATEBRUSH, SELECTOBJECT, DELETEOBJECT, MOVETO, LINETO, CREATEDIBITMAP
- **Memory**: GLOBALALLOC, GLOBALLOCK, GLOBALFREE, OBJNEWNEAR, OBJNEWFAR, LOCALALLOC
- **String**: LSTRCPY, LSTRCAT, LSTRLEN, LSTRCMP, ANSINEXT, ANSILOWER
- **Resource**: FINDRESOURCE, LOADRESOURCE, LOCKRESOURCE
- **Message**: SENDMESSAGE, POSTMESSAGE, DEFWINDOWPROC
- **File**: _LREAD, _LWRITE, _LSEEK, CREATEFILE, READFILE
- **Property**: 0x40xx property ID checks

## Notes

- Overlap between categories is not subtracted; actual unique nameable is lower.
- CMP is low because it is mostly compiler emit routines and resource tables, not GDI/Windows calls.
- JPG is low because it is mostly JPEG decode math with few Windows calls.
- RTM is high because it is the main engine with heavy GDI, message, and property dispatch.
- Confirmed names are only in BAS so far. RTM/CMP/BMP need manual review for high-value functions.

## Brute-force progress (2026-10-11 00:35)

### Confirmed renames

**BAS (12)** — `rename_bas.py`
- PaintPolygon, PaintPolyline, PaintArc, PaintArcAlt, PaintRectangle
- ScaleTwipsToScreen, SetProperty, SetPointArray, SetupPaintRect
- SetScriptProperty, ValidateProperty, CheckVertices

**RTM (8)** — `rename_rtm.py`
- PaintRectangle, PaintRectangleAlt
- BitBltHelper, BitBltHelper2-5
- SendMessageHelper

### Next targets
- BMP: CREATEDIBITMAP callers, TBKBITMAP/TBKGRAPHICFX
- CMP: COMPILEREXPANDTEXT, COMPILERPROPINFOFROMINDEX, resource lockers
- UTL: object type table helpers

### BMP (11) — `rename_bmp.py`
- CreateDibBitmap, CreateDibBitmapAlt/2/3
- BitBltBmp, BitBltBmp2-4
- SelectPaletteBmp, SelectPaletteBmp2, GetDcBmp

### CMP (8) — `rename_cmp.py`
- LoadCompilerResource, LockCompilerResource, LockCompilerResource2
- ExpandTextCore
- CompilerStrLen, CompilerStrCpy, CompilerStrCat, CompilerStrHelper

### Totals so far
- BAS: 12
- RTM: 8
- BMP: 11
- CMP: 8
- **Total confirmed: 39**

### UTL (7) — `rename_utl.py`
- UtlAlloc, UtlLock, UtlAlloc2, UtlLock2
- UtlStrCpy, UtlStrLen, UtlStrCat

### W16 (8) — `rename_w16.py`
- W16Alloc, W16Lock, W16Alloc2, W16Lock2
- W16StrCpy, W16StrLen, W16StrCat, W16StrHelper

### LNL (7) — `rename_lnl.py`
- LnlAlloc, LnlLock, LnlAlloc2, LnlLock2
- LnlStrCpy, LnlStrLen, LnlStrCat

### Totals
| Module | Confirmed |
|--------|-----------|
| BAS | 12 |
| RTM | 8 |
| BMP | 11 |
| CMP | 8 |
| UTL | 7 |
| W16 | 8 |
| LNL | 7 |
| **Total** | **61** |

### MM (7) — `rename_mm.py`
- MmSendMessage, MmSendMessage2/3, MmCreateWindow
- MmAlloc, MmAllocStr, MmStrCpy

### RCR (9) — `rename_rcr.py`
- RcrBitBlt, RcrBitBlt2/3
- RcrSendMessage, RcrSendMessage2/3
- RcrAlloc, RcrAlloc2, RcrStrCpy

### FLT (8) — `rename_flt.py`
- FltBitBlt, FltBitBlt2
- FltSendMessage, FltSendMessage2/3
- FltAlloc, FltAlloc2, FltStrCpy

### NET (8) — `rename_net.py`
- NetSendMessage, NetSendMessage2/3, NetCreateWindow
- NetAlloc, NetAlloc2, NetStrCpy, NetStrCpy2

### Totals
| Module | Confirmed |
|--------|-----------|
| BAS | 12 |
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
| **Total** | **93** |
