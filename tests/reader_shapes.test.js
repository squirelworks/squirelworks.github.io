"use strict";
// The web reader draws the shapes the editor's tools make, as the Foolbook reader does.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function node(tag) {
  const listeners = {};
  const el = {
    tagName: String(tag).toLowerCase(),
    children: [],
    attrs: {},
    dataset: {},
    style: {},
    className: "",
    setAttribute(name, value) { el.attrs[name] = String(value); },
    appendChild(child) { el.children.push(child); return child; },
    replaceChildren(...items) { el.children = items; },
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    click() { (listeners.click || []).forEach((fn) => fn({ stopPropagation() {} })); },
  };
  return el;
}

function reader() {
  const sandbox = {
    console,
    document: { createElement: node, createElementNS: (_ns, tag) => node(tag) },
    TextDecoder,
    TextEncoder,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "desktop", "reader.js"), "utf8"), sandbox, { filename: "reader.js" });
  return sandbox.FoolReader;
}

function draw(shapes, onJump) {
  const stage = node("div");
  stage.clientWidth = 640;
  const page = { id: "P1", size: [640, 480], shapes };
  const book = { pages: [page, { id: "P2", shapes: [] }] };
  reader().drawPage(stage, book, page, onJump || (() => {}), () => {});
  return stage.children[0].children;
}

const svgChild = (el) => el.children[0];

test("A rounded rectangle is drawn with its radius, 8 when missing, at most half the short side", () => {
  const [a, b, c] = draw([
    { kind: "roundrect", name: "a", x: 10, y: 10, w: 100, h: 60, fill: "#f7f4ee", outline: "#071428" },
    { kind: "roundrect", name: "b", x: 10, y: 10, w: 100, h: 60, radius: 12 },
    { kind: "roundrect", name: "c", x: 10, y: 10, w: 100, h: 10, radius: 20 },
  ]);
  assert.strictEqual(svgChild(a).tagName, "rect");
  assert.strictEqual(svgChild(a).attrs.rx, "8");
  assert.strictEqual(svgChild(a).attrs.fill, "#f7f4ee");
  assert.strictEqual(svgChild(b).attrs.rx, "12");
  assert.strictEqual(svgChild(c).attrs.rx, "5");
});

test("A curve is a polyline through its points", () => {
  const [curve] = draw([{ kind: "curve", name: "w", points: [[0, 0], [10, 10], [20, 0]], stroke: 3 }]);
  assert.strictEqual(svgChild(curve).tagName, "polyline");
  assert.strictEqual(svgChild(curve).attrs.points, "0,0 10,10 20,0");
  assert.strictEqual(svgChild(curve).attrs.fill, "none");
  assert.strictEqual(svgChild(curve).attrs["stroke-width"], "3");
});

test("An arc, a pie, and a chord follow start and sweep, zero east and counterclockwise", () => {
  const [arc, pie, chord] = draw([
    { kind: "arc", name: "a", x: 0, y: 0, w: 100, h: 50, start: 0, sweep: 180 },
    { kind: "pie", name: "p", x: 0, y: 0, w: 100, h: 100, start: 0, sweep: 90, fill: "#c00000" },
    { kind: "chord", name: "c", x: 0, y: 0, w: 100, h: 50, start: 0, sweep: 180 },
  ]);
  // The top half: from the east end to the west end, turning up.
  assert.strictEqual(svgChild(arc).attrs.d, "M 100 25 A 50 25 0 0 0 0 25");
  assert.strictEqual(svgChild(arc).attrs.fill, "none");
  // The top right quarter, back to the centre.
  assert.strictEqual(svgChild(pie).attrs.d, "M 50 50 L 100 50 A 50 50 0 0 0 50 0 Z");
  assert.strictEqual(svgChild(pie).attrs.fill, "#c00000");
  assert.strictEqual(svgChild(chord).attrs.d, "M 100 25 A 50 25 0 0 0 0 25 Z");
});

test("A clockwise sweep and a sweep past half turn take the long way the right way round", () => {
  const R = reader();
  assert.strictEqual(R.arcPath(0, 0, 100, 100, 0, -90, "arc"), "M 100 50 A 50 50 0 0 1 50 100");
  assert.strictEqual(R.arcPath(0, 0, 100, 100, 0, 270, "arc"), "M 100 50 A 50 50 0 1 0 50 100");
});

test("An arc with no angles is still the ellipse of its bounds", () => {
  const [arc] = draw([{ kind: "arc", name: "old", x: 0, y: 0, w: 80, h: 60 }]);
  assert.strictEqual(svgChild(arc).tagName, "ellipse");
});

test("A hotspot draws nothing and its click follows the item", () => {
  const jumps = [];
  const [spot] = draw([{ kind: "hotspot", name: "h", x: 5, y: 5, w: 50, h: 50, item: { page: "P2" } }], (page) => jumps.push(page));
  assert.strictEqual(spot.style.background, "transparent");
  assert.strictEqual(spot.children.length, 0);
  assert.ok(!spot.style.border, "no outline in the reader");
  spot.click();
  assert.deepStrictEqual(jumps, ["P2"]);
});
