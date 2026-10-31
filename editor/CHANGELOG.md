# Foolbook Editor (web) changelog

The editor page has its own build number, shown in its header. Tests run headless with `node --test tests/*.test.js`.

## 2026-10-31

- 3.419: Download writes the book JSON after the `FBK1` header. It wrote the header and then zeros, so no reader could open a downloaded book.
- editor/schema.json is the book, page, and shape field list, generated from FoolbookEditor `author/schema.py` (84606d7, branch schema-shape-fields) by `tools/editor_schema.py`. A test fails if Download writes a field the desktop editor would drop. The page does not load it yet, so the build stays 3.419.
- 3.420: Download stamps `"fbk"` with the version from editor/schema.json and refuses a book from a newer Foolbook, saying both numbers, the way the desktop save does. schema.json now also lists the envelope keys Foolbook stamps (FoolbookEditor `author/files.py`, 84606d7).
