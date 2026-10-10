# OpenScript Bytecode Investigation

## Resources extracted from TB80CMP.DLL

| Resource | ID | Size | Contents |
|----------|-----|------|----------|
| 0x77 | 119 | 15776 | OpenScript keywords (992 strings) |
| 0x78 | 120 | 15616 | OpenScript keywords (980 strings) |
| 0x70 | 112 | 3872 | Property names (213 strings) |

## Bytecode encoding (from FUN_1040_0970)

- Literal characters: 0x00-0x7F
- Keyword lookup: 0x80-0xBF
  - Index = byte & 0xF, optionally extended if bit 4 set
  - Space appended if bit 5 clear
- CRLF + spaces: 0xE0-0xEF
- Spaces: 0xF0-0xFE
- Repeat: 0xFF
- Back-reference: 0xC0-0xFF

## Decoder

- Script: openscript_decode.py
- Usage: python3 openscript_decode.py res_77.bin bytecode.bin

## Current status

The decoder works, but the keywords are not matching the expected OpenScript.
The bytecode decodes to unexpected keywords like "italic", "third", "fourth".

## Possible issues

1. The keyword table in resource 0x77 might not be the one used by the runtime
2. The bytecode encoding might have a different interpretation
3. The NIDA system books might use a different keyword table

## NIDA system books

- nc81base.sbk: 61 bytecode patterns
- nc81recs.sbk: 17 bytecode patterns
- nc81test.sbk: 94 bytecode patterns
- nc81trnr.sbk: 62 bytecode patterns

## NIDA DLLs

- nc81int.dll: Hardware interface functions
- nc81rec.dll: Recording functions
- No OpenScript keywords

## Next steps

1. Check if there is a different keyword table in the runtime
2. Look at the bytecode more carefully to understand the encoding
3. Check if the NIDA system books have their own keyword table

## Additional findings

### TB80RTM keyword table
- Small table at 0xAACAD: handle, get, set, notifybefore, notifyafter, true, false, to
- No "buttonClick" or other OpenScript keywords

### TB80BAS
- No "handle" or "buttonClick" matches
- Keyword table is only in TB80CMP

## Conclusion

The keyword table in resource 0x77 of TB80CMP is the OpenScript keyword table.
The bytecode encoding is correct, but the keywords are not matching the expected OpenScript.

Possible reasons:
1. The bytecode in the TBK files is not OpenScript bytecode
2. The keyword table is used differently than expected
3. There is a different encoding scheme

## Files saved
- res_77.bin, res_77_strings.txt
- res_78.bin, res_78_strings.txt
- res_70.bin, res_70_strings.txt
- openscript_decode.py
- openscript_notes.md

## Full investigation results (2026-10-10)

### 1. Bytecode encoding
- Confirmed from FUN_1040_0970: literals <0x80, keywords 0x80-0xBF with index = (b&0xF) or ((b&0xF)<<8)|next if bit4, space if bit5 clear
- Resources 0x77 and 0x78 are identical keyword tables (992 entries, handle/end/if/when/...)
- Decoder produces output, but keywords do not match expected OpenScript (e.g. "systime" where "logical" expected)
- Likely cause: index calculation or table offset is wrong, or scripts use a different expander path

### 2. Script data format
- Handlers start with plain text "To Handle Name" then compressed bytecode body
- Existing openscript.py looks for "to handle" text; body is bytecode
- Corpus JSON exists but structure needs re-check

### 3. NIDA-specific keywords
- nc81int.dll / nc81rec.dll: hardware and recording APIs only (Int*, Rec*)
- System .sbk files contain bytecode patterns but few plain keyword strings
- No separate NIDA keyword table found

### 4. Runtime keyword lookup
- TB80BAS: no "handle", "buttonClick", "enterPage" strings
- TB80RTM: only small table (handle/get/set/notifybefore/...) at 0xAACAD
- Keywords live only in TB80CMP resources

### 5. Picture stream
- P430 has 126 widget records; multiple 11-point polygons (pins) with fill 0xC0C0C0
- Points stored as twips at +0x22, screen = /15
- Lesson has 71 BM, 5 JPEG; nida81 has 76 BM, 12 JPEG
- Polygons are drawn via GDI::POLYGON from object+0x30 count / +0x32 array

### 6. Book format
- JBO signature at 0xC00: 03 4A 42 4F 01 00 00 08
- 129 page markers (80 65 00 05 00 02 02)
- Name is 32-byte field at +11
- Property block (14 00 00) starts at +43
- Widgets are nested 14 00 00 chunks inside the page

## Status
Bytecode decoder is functional but produces incorrect keyword mapping. Picture polygons and book structure are understood. Next step is to fix the keyword index calculation or find the correct table offset.

## Fix applied (2026-10-10 23:40)

The keyword offset table starts at byte 2 + count*4, not 2 + count*2.
With the corrected loader, the decoder produces readable OpenScript:

```
system logical __import
system lastbook
system nextpage
if page = false then
    if sysLevel = "reader" then
        go to page "P0" of book getLogoBook()
    else
        if __beenToP1 of this book = false then
            ...
        end if
    end if
end if
```

Decoder is now functional. Remaining work is to handle edge cases in back-references and extract full handler bodies.

## Handler extraction (2026-10-10 23:45)

Extracted 22 usable handlers from 9e954d01.tbk that end with plain "END".
Saved to handlers_extracted.json.

Examples:
- `send next` / `send previous`
- `go to page "P400"`
- `go to page "P310" of book "nida81.tbk"`

### Remaining issues
1. Back-references (0xC0-0xFF) look into the *input* stream, not the output. The current decoder treats them as output back-refs, which produces garbage ("keySlash", truncated words).
2. Some handlers store mixed plain text + bytecode; boundary detection needs refinement.
3. Handlers without a plain "END" marker are not yet extracted.

### Next steps
- Rewrite the back-reference case to copy from the compressed input buffer (per FUN_1040_0970).
- Detect handler end by null or next page marker when "END" is absent.

## Back-reference rewrite (2026-10-10 23:50)

Fixed the back-reference case in openscript_decode.py.
Back-references (0xC0-0xFF) now copy from the compressed input stream,
matching FUN_1040_0970:

```
if bit4 clear:
    length = (b & 0xF) + 3
    src = (pos+1) + (-4 - next_byte)
else:
    length = (b & 0xF) + 4
    src = (pos+1) + (-1 - word_offset)
copy length bytes from input[src]
```

### Result
Re-extracted all 76 handlers from 9e954d01.tbk.
Previously broken cases now decode correctly:

```
system lastbook
  lastbook=name of this book
  system nextpage
  nextpage=name of this page
  go to page "P20001" of book "nida81.tbk"
end
```

Saved to handlers_extracted.json.

## System book scripts (2026-10-10 23:58)

Ran the decoder on all system books:

| Book | Handlers | Notes |
|------|----------|-------|
| nc81base.sbk | 0 | No "to handle" text. High-byte sequences do not decode to OpenScript. |
| nc81recs.sbk | 0 | Same. |
| nc81test.sbk | 0 | Same. |
| nc81trnr.sbk | 0 | Same. |
| tb80anm.sbk | 0 | Same. |
| tb80hyp.sbk | 0 | Same. |
| tb80r.sbk | 0 | 66 page markers, empty names. Strings include "ASYM_TempViewer", "RTFHelp". |
| nida81.tbk | 100 | All buttonClick. Examples: go to page "P20001", go to page (nextpage) of book(lastbook). |

### Conclusion
The .sbk system books do not store OpenScript handlers in the "to handle" + bytecode format used by lesson TBKs. They appear to contain:
- Menu resources (File, Open, Save, etc.)
- Object strings and properties
- Possibly compiled code or a different script format

nida81.tbk (the shell) uses the same handler format as the lesson books.

Saved to system_handlers.json.

## System book structure (2026-10-11 00:00)

The pure .sbk files are not script repositories. They contain:

1. **Object type table** — ComboBox, Stage, Picture, Hotword, RecordField, PaintObject, Curve, Polygon, Field, Button, Rectangle, Page, Background, Book (at ~0x15E4-0x1ADC in nc81base.sbk)

2. **Menu resources** — &File, &Open..., &Save, Ctrl+O, etc.

3. **Copyright / license text**

4. **No OpenScript handlers** — no "to handle" text, high-byte sequences do not decode as OpenScript bytecode.

The system book logic lives in:
- nc81int.dll (trainer hardware: IntCheckComm130E, etc.)
- nc81rec.dll (session recording: RecStartSession, RecWriteResponse, etc.)
- TB80RTM / TB80BAS (runtime engine)

nida81.tbk (the shell) is a regular book with 100 buttonClick handlers in the standard format.

## Page walk: P400 / P420 (2026-10-11 00:07)

### P400 (7046 bytes, 12 records)
| # | Offset | Len | Sub | Kind | Notes |
|---|--------|-----|-----|------|-------|
| 0 | +0x2B | 33 | 17 | 0001 | small |
| 1 | +0x4C | 31 | 225 | 0000 | small |
| 2 | +0x6B | 18 | 209 | 0d00 | small |
| 3 | +0x7D | 1458 | 209 | d900 | content blob (scripts, colors) |
| 4 | +0x62F | 2828 | 0 | 0021 | large, no poly |
| 5 | +0x113B | 894 | 0 | 0000 | n=21 at +0x1a, not poly range |
| 6 | +0x14B9 | 156 | 0 | 1600 | small |
| 7 | +0x1555 | 506 | 0 | 0000 | small |
| 8 | +0x174F | 312 | 17 | 0001 | small |
| 9 | +0x1887 | 18 | 225 | 0200 | small |
| 10 | +0x1899 | 630 | 225 | 0000 | small |
| 11 | +0x1B0F | 119 | 0 | 0000 | small |

No kind=04 00 (polygon) records. Color words (0xC0C0C0, 0x808080) inside content blob. No property 0x4004/0x4034/0x4050 on disk.

### P420 (7644 bytes, 10 records)
| # | Offset | Len | Sub | Kind | Notes |
|---|--------|-----|-----|------|-------|
| 0 | +0x2B | 33 | 17 | 0000 | small |
| 1 | +0x4C | 31 | 2 | 0000 | small |
| 2 | +0x6B | 18 | 18 | 0a00 | small |
| 3 | +0x7D | 2454 | 18 | c700 | content blob |
| 4 | +0xA13 | 2559 | 0 | 0020 | large, no poly |
| 5 | +0x1412 | 126 | 2 | 0000 | small |
| 6 | +0x1490 | 341 | 2 | 0000 | small |
| 7 | +0x15E5 | 630 | 0 | 1900 | id table (0x0A22, 0x0B32...) |
| 8 | +0x185B | 954 | 0 | 0000 | n=21 at +0x1a |
| 9 | +0x1C15 | 455 | 0 | 0000 | small |

No kind=04 00 records. No Polygon/Curve/Arc/Picture name. Flame is not a stored vector list.

### P430 (for comparison)
22 polygon records (kind=04 00, n=11 each). Pins and chip body.

### Conclusion
P400 and P420 do not store polygons the same way as P430. Their diagrams are either:
- Computed from bounds (like the P1170 brackets)
- Referenced by ID (the 0x15E5 table)
- Embedded in the content blob with a different layout

Picture placement still needs the bounds record and the resource ID binding.

## Full book deconstruct: 9e954d01.tbk (2026-10-11 00:12)

### Overview
| Metric | Value |
|--------|-------|
| Size | 2,327,983 bytes |
| Pages | 129 |
| Widgets | 1,551 |
| Polygons | 96 (on 13 pages) |
| Handlers | 76 (on 39 pages) |

### Polygon pages
P410 (10), P430 (22), P1090 (7), P1130 (7), P1190 (7), P1207 (7), P1260 (7), P2040 (1), P2050 (2), P2070 (7), P2130 (7), P2150 (7), P2910 (5)

### Handler types
- TO HANDLE buttonClick: 46
- To Handle ButtonClick: 29
- To Handle EnterPage: 1

### Sample handlers
```
To Handle EnterPage
system logical __import
	system lastbook
	system nextpage
	lastbook = name of this book
	nextpage = "p10"
	if  __import = false  then
		if sys...
```
```
TO HANDLE buttonClick
--{Go to next page}
  send next
END
```

### Files
- book_deconstruct.json — page inventory
- book_handlers.json — 76 decoded handlers
- book_summary.json — overview

### Coverage
~30% of the book is now readable:
- Page structure and widget counts
- Polygon point records (P430 chip, P410 pins)
- Handler bytecode (navigation, cross-book jumps)
- Field text (partial)

Still open:
- Bounds / placement (property 0x4004)
- Picture resource binding
- Connecting lines and detail strokes
- Content rectangles
