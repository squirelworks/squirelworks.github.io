"use strict";
// node --test tests/

const test = require("node:test");
const assert = require("node:assert");
const { loadEditor } = require("./editor_page");

test("Download writes the book after the FBK1 header", () => {
  const page = loadEditor();
  page.press("Download");
  const bytes = page.blobs[page.blobs.length - 1].bytes();
  assert.strictEqual(Buffer.from(bytes.slice(0, 4)).toString(), "FBK1");
  assert.strictEqual(bytes[4], 0, "flags byte: uncompressed");
  const book = JSON.parse(Buffer.from(bytes.slice(5)).toString("utf8"));
  assert.strictEqual(book.pages[0].id, "P0");
  assert.strictEqual(book.title, "New book");
  assert.ok(!("_magic" in book), "_magic is envelope state, not payload");
});
