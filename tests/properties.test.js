"use strict";
// The web property pane has the desktop rows, read and written by the desktop rules.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { loadEditor, ROOT } = require("./editor_page");

function props() {
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "editor", "properties.js"), "utf8"), sandbox);
  return sandbox.FoolProps;
}

const plain = (value) => JSON.parse(JSON.stringify(value));

test("The rows are the desktop Properties rows, in order", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, "editor", "schema.json"), "utf8"));
  assert.ok(schema.properties, "schema.json lists the desktop rows");
  assert.deepStrictEqual(plain(props().ROWS), schema.properties);
});

test("Bad text leaves the old value, row by row", () => {
  const P = props();
  const page = { shapes: [] };
  const shape = { kind: "rect", name: "a", x: 10, y: 10, w: 40, h: 30, fill: "#ffffff" };
  const other = { kind: "rect", name: "B" };
  page.shapes.push(shape, other);
  assert.strictEqual(P.write(shape, "name", "b", page), false, "a name another object has, in any case");
  assert.strictEqual(P.write(shape, "name", "", page), false);
  assert.strictEqual(P.write(shape, "fill", "red"), false);
  assert.strictEqual(P.write(shape, "stroke", "1.5"), false);
  assert.strictEqual(P.write(shape, "stroke", "-1"), false);
  assert.strictEqual(P.write(shape, "size", "0"), false);
  assert.strictEqual(P.write(shape, "size", "289"), false);
  assert.strictEqual(P.write(shape, "bold", "yes"), false);
  assert.strictEqual(P.write(shape, "align", "justify"), false);
  assert.strictEqual(P.write(shape, "w", "3"), false, "under 4");
  assert.strictEqual(P.write(shape, "x", "ten"), false);
  assert.strictEqual(P.write(shape, "jump_book", "other.fbk"), false, "a book needs a page first");
  assert.deepStrictEqual(plain(shape), { kind: "rect", name: "a", x: 10, y: 10, w: 40, h: 30, fill: "#ffffff" });
});

test("Good text is stored as the desktop stores it", () => {
  const P = props();
  const shape = { kind: "button", name: "a", x: 10, y: 10, w: 40, h: 30 };
  assert.strictEqual(P.read(shape, "stroke"), "1", "a missing stroke reads as 1");
  assert.ok(P.write(shape, "fill", ""));
  assert.strictEqual(shape.fill, "", "an empty fill is no fill");
  assert.ok(P.write(shape, "outline", "#ABCDEF"));
  assert.strictEqual(shape.outline, "#abcdef");
  assert.ok(P.write(shape, "stroke", "3"));
  assert.ok(P.write(shape, "font", "Georgia"));
  assert.ok(P.write(shape, "font", ""));
  assert.ok(!("font" in shape), "an empty face is the reader's own");
  assert.ok(P.write(shape, "size", "14"));
  assert.ok(P.write(shape, "italic", "true"));
  assert.ok(P.write(shape, "visible", "false"));
  assert.strictEqual(P.read(shape, "visible"), "false");
  assert.ok(P.write(shape, "align", "Center"));
  assert.ok(P.write(shape, "text", "  two\nlines "));
  assert.strictEqual(shape.text, "  two\nlines ", "text is kept as typed");
  assert.ok(P.write(shape, "x", "50"));
  assert.ok(P.write(shape, "h", "60"));
  assert.ok(P.write(shape, "jump_page", "P2"));
  assert.ok(P.write(shape, "jump_label", "start"));
  assert.deepStrictEqual(plain(shape.item), { page: "P2", label: "start" });
  assert.ok(P.write(shape, "jump_page", ""));
  assert.ok(!("item" in shape), "an empty page takes the jump off");
  assert.strictEqual(shape.stroke, 3);
  assert.strictEqual(shape.size, 14);
  assert.strictEqual(shape.italic, true);
  assert.strictEqual(shape.align, "center");
  assert.deepStrictEqual([shape.x, shape.y, shape.w, shape.h], [50, 10, 40, 60]);
});

test("Points are one pair a line, a polygon keeps three, and the box follows them", () => {
  const P = props();
  const shape = { kind: "polygon", name: "p", points: [[0, 0], [10, 0], [10, 10]] };
  assert.strictEqual(P.read(shape, "points"), "0, 0\n10, 0\n10, 10");
  assert.strictEqual(P.write(shape, "points", "0 0\n5 5"), false);
  assert.strictEqual(P.write(shape, "points", "0 0\n5\n9 9"), false);
  assert.ok(P.write(shape, "points", "2, 4\n\n12 4\n7, 20"));
  assert.deepStrictEqual(plain(shape.points), [[2, 4], [12, 4], [7, 20]]);
  assert.deepStrictEqual([shape.x, shape.y, shape.w, shape.h], [2, 4, 10, 16]);
  assert.ok(P.write(shape, "x", "102"), "moving by a number takes the points along");
  assert.deepStrictEqual(plain(shape.points), [[102, 4], [112, 4], [107, 20]]);
});

test("The pane shows a box per row and applies a typed value when it is left", () => {
  const page = loadEditor();
  const shape = page.sandbox.place("box", 10, 10, 110, 70);
  page.sandbox.fillProps();
  const boxes = page.ids.props.children.filter((node) => node && node.dataset && node.dataset.key);
  const keys = boxes.map((node) => node.dataset.key);
  assert.deepStrictEqual(plain(keys), plain(props().ROWS.map((row) => row[0]).concat(["script"])));
  const left = boxes.find((node) => node.dataset.key === "x");
  left.value = "200";
  left.dispatch("change");
  assert.strictEqual(shape.x, 200);
  left.value = "far";
  left.dispatch("change");
  assert.strictEqual(shape.x, 200);
  assert.strictEqual(left.value, "200", "the pane shows the old value again");
  const bold = boxes.find((node) => node.dataset.key === "bold");
  bold.checked = true;
  bold.dispatch("change");
  assert.strictEqual(shape.bold, true);
});
