# Foolbook Editor (web) changelog

The editor page has its own build number, shown in its header. Tests run headless with `node --test tests/*.test.js`.

## 2026-10-31

- 3.419: Download writes the book JSON after the `FBK1` header. It wrote the header and then zeros, so no reader could open a downloaded book.
