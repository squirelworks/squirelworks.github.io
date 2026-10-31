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

test("Every field the editor downloads is in schema.json", () => {
  const fs = require("fs");
  const path = require("path");
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "editor", "schema.json"), "utf8"));
  const page = loadEditor();
  ["button", "text", "box", "line", "ellipse", "polygon", "picture"].forEach((tool, n) => {
    const shape = page.sandbox.place(tool, 10 + n, 10, 100, 80);
    if (tool === "picture") shape.data = "data:image/png;base64,";
  });
  page.press("Download");
  const book = JSON.parse(Buffer.from(page.blobs[page.blobs.length - 1].bytes().slice(5)).toString("utf8"));
  const stray = (where, obj, allowed) => Object.keys(obj).filter((key) => !allowed.includes(key)).map((key) => where + "." + key);
  let found = stray("book", book, schema.book.concat(schema.envelope));
  book.pages.forEach((item) => {
    found = found.concat(stray("page", item, schema.page));
    item.shapes.forEach((shape) => {
      found = found.concat(stray("shape(" + shape.kind + ")", shape, schema.shape.concat(schema.shape_extra[shape.kind] || [])));
    });
  });
  assert.deepStrictEqual(found, [], "the desktop editor would drop these on save");
  assert.strictEqual(book.pages[0].shapes.length, 8, "paper plus seven tools");
});

test("Download stamps the book version from schema.json", async () => {
  const page = loadEditor();
  await page.settle();
  page.press("Download");
  const book = JSON.parse(Buffer.from(page.blobs[page.blobs.length - 1].bytes().slice(5)).toString("utf8"));
  assert.strictEqual(book.fbk, 1);
});

test("Download refuses a book from a newer Foolbook and says the number", async () => {
  const page = loadEditor({ opens: { fbk: 99, id: "far", title: "Far", pages: [{ id: "P0", shapes: [] }] } });
  await page.settle();
  await page.open("far.fbk");
  const before = page.blobs.length;
  page.press("Download");
  assert.strictEqual(page.blobs.length, before, "nothing written");
  assert.match(page.ids.status.textContent, /version 99/);
  assert.match(page.ids.status.textContent, /writes version 1/);
});
