# Chapter: Understanding the ToolBook 8.0 Reverse-Engineering Effort

This chapter summarizes the state of the work on the Nida Corporation ATT Master_3 ToolBook courses (ToolBook II 8.1 shells, book version 01 00 00 08). It is written so that a reader who has not followed every SoftICE session or Ghidra pass can still see what was learned, what already works, and what remains open.

## 1. What the books are

The course files are classic Asymetrix/Click2learn ToolBook books. Each `.tbk` begins with a short PE stub (0xC00 bytes, no real code) followed by the book body. The magic `ZZZTBKBOOKLOC` and the value `0x22222222` mark the start of the real book data. The opener is `tbload.exe` via `MINSTB32.dll`. The runtime engine that actually interprets the book is the 16-bit NE binary `TB80RTM.EXE` (unpacked from its SLR Optloader wrapper). Supporting DLLs (`TB80BAS`, `TB80CMP`, `TB80BMP`, `TB80UTL`, `TB80W16`, and others) supply object types, painting, OpenScript compilation/expansion, bitmaps, and windowing.

The courses themselves are Navy electronics CAI (not the drug-abuse institute of the same name). `courses.xml` is a menu export that lists 0_MASTER3 plus twenty rating tracks. On disk there are hundreds of lesson `.tbk` files; the work has concentrated on one well-understood example, `9e954d01.tbk` (Logic Families), plus the shared shell `nida81.tbk` and the system books (`nc81base.sbk`, `nc81recs.sbk`, `nc81test.sbk`, `nc81trnr.sbk`, `tb80r.sbk`).

## 2. On-disk structure that is now understood

Page objects are the only records that begin with the marker `80 65 00 05 00 02 02`. Inside each page the widgets are nested chunks that begin `14 00 00`. A typical property block starts `14 00 00 01`. Field text is stored as a `Text` property (length-prefixed, often with a leading CRLF). Standard property IDs (bounds = 0x4004, text = 0x402e, script = 0x4023, vertices = 0x4034, etc.) were recovered from NE resource type 0x2d1 / id 0x2d0 in `TB80BAS`.

Object-type names (Page, Button, Field, Picture, Polygon, Arc, Curve, Rectangle, etc.) live in a classification table inside `TB80UTL.DLL` and are also present as resources in the system `.sbk` files. The system books themselves are resource containers; they do not contain the OpenScript handlers that drive lessons.

OpenScript bytecode is stored in the page records. The keyword tables are NE resources 0x77 and 0x78 in `TB80CMP`. A decoder (`openscript_decode.py`) now correctly expands both the keyword lookups and the 0xC0–0xFF back-references, producing readable handlers (“go to page "P400"”, “send next”, etc.). For `9e954d01.tbk` this yielded dozens of usable handlers.

Polygon geometry (the case that has been solved) is stored in `14 00 00` subtype-0 records whose kind field is `04 00`. The point count is a word at a known offset, followed by x,y twip pairs. Screen coordinates are obtained by the scale `(stored * 96 + 720) / 1440` (equivalently stored/15 when the DPI factors are 96). Fill color is a dword in the same record. This layout was confirmed both statically and by live GDI!POLYGON traces.

## 3. What the modern readers already do

Several generations of clean-room readers exist:

- Early HTML/XML viewers (`viewer`, `viewer2`, `viewer3`) that walk the page marker, extract text and quoted jumps, and present a frame-plus-book UI.
- Maybe2 / Maybe4 lessonshells: JSON that contains pages, Next/Back items, quiz choices, and decoded script. The shell walks `gotoPageList`, `setupQuizPage`, and answer handling. Logic Families under Maybe2 is the best rendering achieved so far.
- `runtime/` and `runtime_cpp/`: Python and C++ packages that parse a book and emit HTML or drive a simple player. System-book stubs supply the path manager, bookmarking, and popup behavior that lessons expect.
- Brickwall: a self-contained `tbk_gui.py` + HTML UI that serves either a raw `.tbk` or a lessonshell JSON, showing page lists, field text, and quoted jumps. Graphics are still omitted.

All of these can already display the textual content, navigation, and quizzes of books that resemble Logic Families. They do not yet paint arbitrary polygons, arcs, curves, or placed bitmaps for the rest of the corpus.

## 4. Dynamic analysis and the live object model

SoftICE + ICEDUMP on a Windows 98 VM has been the primary dynamic tool. It confirmed:

- Window classes owned by TB80RTM (`TBKMain`, `TBKClient`, `SchedulerWndTB80`, \ldots).
- The live polygon painter in `TB80BAS` segment 0x82 (object+0x30 = count, object+0x32 = point array).
- Twip-to-screen scaling in segment 2.
- Arc and rectangle painters and their object layouts.
- That many “dumps” were actually SoftICE console captures rather than target memory; later sessions with expert mode and careful addressing produced real object and page dumps.

A parallel effort unpacked every Optloader-wrapped NE image, imported them into Ghidra, and began systematic renaming. More than one hundred functions now have meaningful names (PaintPolygon, ScaleTwipsToScreen, SetProperty, SetPointArray, various BitBlt and string helpers, compiler expand routines, etc.). Coverage is still only ~17 % of the unique functions, but the paint and property paths are no longer anonymous.

The book-open sequence itself has been sketched (Tbload → ZZZTBKBOOKLOC → JBO signature check → page allocation → CDBSENDCREATE / CDBNEWOBJECT → bounds written at object+0xF) but the exact instruction that reads a `14 00 00` record and fills the object has not been isolated under the debugger. That missing translation step is why most non-polygon widgets and most other books still render poorly.

## 5. Graphics status

- Embedded Windows BMPs have been carved from the course books (hundreds of unique pictures and icons).
- The shared near-start graphic is a 581×157 8 bpp gold plate; the nida81 splash is a known 323×344 bitmap.
- Polygons on pages such as P430 (the chip) can be extracted and drawn correctly, including pin tips and body.
- Curves (the flame on P420), arcs, connecting lines, and content rectangles are only partially understood. Some point runs exist in the page blobs but lack a clear header or are computed from bounds at paint time rather than stored.
- Picture widgets and their placement rectangles are not yet bound to the carved BMPs.

## 6. What remains open

The single highest-leverage gap is the record-to-runtime-object mapping: given an arbitrary `14 00 00` chunk, produce the object type, the bounding box at +0xF, and any type-specific geometry. Once that mapping exists, the polygon renderer can be generalized, arcs and rectangles can be drawn, and the already-carved bitmaps can be placed.

Secondary gaps are:

- Full OpenScript execution (the current readers interpret only the navigation and quiz subset).
- Robust handling of system-book and cross-book jumps for every lesson, not just Logic Families.
- A convenient way to log the fast open path (SoftICE `BPX \ldots DO` logging, a Watcom debugger session, or a thin logging proxy in the style of the existing TB80BMP proxy).

## 7. How to read the artifacts

| Area | Location | What it contains |
|------|----------|------------------|
| Unpacked NE images | `artifacts/unpacked/`, `TB80BAS_ghidra.dll` | Images suitable for Ghidra |
| Rename scripts & lists | `artifacts/rename/` | Confirmed function names |
| OpenScript | `openscript_decode.py`, `handlers_extracted.json`, `openscript_notes.md` | Bytecode decoder and corpus |
| Lessonshells & readers | `Maybe2/`, `Maybe4/`, `Brickwall/`, `runtime/` | Working text + navigation players |
| Page & polygon experiments | `p430_*.png`, `polygon_render.py` | Solved geometry examples |
| SoftICE kit | `SoftIce Stuff/` | ICEDUMP 6.021 and loaders |
| System books as JS | `artifacts/sbk/` | Resource modules used by the shells |
| Project memory | `.grok/project_memory.md` | Chronological facts and bookmarks |

The work has already extracted the readable content and the navigation logic from the books and has produced usable modern viewers for the best-understood lessons. The remaining task is to finish the geometry translation so that the same viewers can paint the diagrams that the original 16-bit runtime drew.
