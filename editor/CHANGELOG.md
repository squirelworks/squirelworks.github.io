# Foolbook Editor (web) changelog

The editor page has its own build number, shown in its header. Tests run headless with `node --test tests/*.test.js`.

## 2026-10-31

- 3.419: Download writes the book JSON after the `FBK1` header. It wrote the header and then zeros, so no reader could open a downloaded book.
- editor/schema.json is the book, page, and shape field list, generated from FoolbookEditor `author/schema.py` (84606d7, branch schema-shape-fields) by `tools/editor_schema.py`. A test fails if Download writes a field the desktop editor would drop. The page does not load it yet, so the build stays 3.419.
- 3.420: Download stamps `"fbk"` with the version from editor/schema.json and refuses a book from a newer Foolbook, saying both numbers, the way the desktop save does. schema.json now also lists the envelope keys Foolbook stamps (FoolbookEditor `author/files.py`, 84606d7).
- 3.421: Undo and Redo, plus Ctrl+Z and Ctrl+Y, step back and forward through the last 50 changes. The rule matches FoolbookEditor `author/history.py` (main 7244c29): whole-book snapshots, a change that does nothing is not a step, and typing counts as one step when the box loses focus. New and Open clear the history.
- 3.422: Open keeps the book's own title, and an untitled book is named after its file. Before, Open always used the file name as the title, so a desktop book whose title was not its file name came back changed after a trip through the web editor.
- editor/schema.json is regenerated from FoolbookEditor main (49bf229), where `author/schema.py` now lists 34 shape fields and 17 shape kinds. `tools/editor_schema.py` writes `shape_kinds` in place of `shape_extra`, which main no longer has, and a test fails if the editor places a kind that is not listed. The page is unchanged, so the build stays 3.422.
- 3.423: In a window narrower than 800 pixels, the editor page says it needs a wide window and points to the Foolbook viewer for reading on a phone. The layout is unchanged, and the viewer is not touched (work order item 112).
