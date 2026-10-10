# Maybe4

Same JSON shell format as Maybe2 (id, title, shells, pages with text/jumps/sends/items, menu).

The translator now decodes OpenScript handlers using the TB80CMP resource 0x77 keyword table (openscript_decode.py). Jumps and sends are taken from the real "go to page" / "send" / nextpage assignments in the decoded source. String-scan fallback remains for pages without handlers.

## Usage

```
python3 translate.py path/to/lesson.tbk
python3 translate.py path/to/directory --out lessonshells
```

Keyword table is res_77.bin (copied from artifacts/). Decoder is openscript_decode.py.

## Viewer

viewer.html and systemshell/ are the Maybe2 versions. Serve this folder and open viewer.html. Lesson JSON lives in lessonshells/.

## What changed from Maybe2

- Handler bodies are decoded to source text and stored in page.script.
- jumps/sends prefer the decoded script over raw string matches.
- 9e954d01.tbk yields 39 pages with script, 86 with jumps.
