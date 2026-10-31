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
      found = found.concat(stray("shape(" + shape.kind + ")", shape, schema.shape));
    });
  });
  assert.deepStrictEqual(found, [], "the desktop editor would drop these on save");
  assert.strictEqual(book.pages[0].shapes.length, 8, "paper plus seven tools");
});

test("Every shape kind the editor places is a kind in schema.json", () => {
  const fs = require("fs");
  const path = require("path");
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "editor", "schema.json"), "utf8"));
  const page = loadEditor();
  const kinds = ["button", "text", "box", "line", "ellipse", "polygon", "picture"].map((tool, n) => page.sandbox.place(tool, 10 + n, 10, 100, 80).kind);
  assert.deepStrictEqual(kinds.filter((kind) => !schema.shape_kinds.includes(kind)), []);
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

const shapes = (page) => page.editor.book.pages[0].shapes.length;

test("Undo takes back a drawn rectangle and Redo puts it back", () => {
  const page = loadEditor();
  page.press("Rectangle");
  page.drag(20, 20, 120, 80);
  assert.strictEqual(shapes(page), 2);
  page.press("Undo");
  assert.strictEqual(shapes(page), 1);
  page.press("Redo");
  assert.strictEqual(shapes(page), 2);
  page.key("z", true);
  assert.strictEqual(shapes(page), 1, "Ctrl+Z is Undo");
  page.key("y", true);
  assert.strictEqual(shapes(page), 2, "Ctrl+Y is Redo");
});

test("A click that changes nothing is not an undo step", () => {
  const page = loadEditor();
  page.press("Rectangle");
  page.drag(20, 20, 120, 80);
  page.press("Select");
  page.drag(300, 300, 300, 300);
  page.press("Undo");
  assert.strictEqual(shapes(page), 1);
});

test("Undo goes back 50 steps and no further", () => {
  const page = loadEditor();
  page.press("Rectangle");
  for (let n = 0; n < 60; n++) page.drag(n * 5, 10, n * 5 + 40, 50);
  assert.strictEqual(shapes(page), 61);
  for (let n = 0; n < 60; n++) page.press("Undo");
  assert.strictEqual(shapes(page), 11, "the oldest ten stay, 50 were undone");
});

test("Open keeps the book's own title, so a desktop book comes back unchanged", async () => {
  const page = loadEditor({ opens: { fbk: 1, id: "trip", title: "Trip", pages: [{ id: "P0", shapes: [] }] } });
  await page.settle();
  await page.open("desk.fbk");
  page.press("Download");
  const book = JSON.parse(Buffer.from(page.blobs[page.blobs.length - 1].bytes().slice(5)).toString("utf8"));
  assert.strictEqual(book.title, "Trip");
});

test("Open names an untitled book after its file", async () => {
  const page = loadEditor({ opens: { id: "x", pages: [{ id: "P0", shapes: [] }] } });
  await page.settle();
  await page.open("Lesson One.tbk");
  page.press("Download");
  const book = JSON.parse(Buffer.from(page.blobs[page.blobs.length - 1].bytes().slice(5)).toString("utf8"));
  assert.strictEqual(book.title, "Lesson One");
});

test("The editor page says to use a wide window, and shows it only when the window is narrow", () => {
  const fs = require("fs");
  const path = require("path");
  const html = fs.readFileSync(path.join(__dirname, "..", "editor", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "..", "editor", "editor.css"), "utf8");
  assert.match(html, /<p id="wide">[^<]*wide window/);
  assert.match(css, /#wide \{ display: none;/);
  assert.match(css, /@media \(max-width: 800px\) \{\s*#wide \{ display: block; \}/);
});

