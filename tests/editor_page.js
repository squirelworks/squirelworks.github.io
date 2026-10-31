"use strict";
// Load editor/editor.js in a vm with just enough of a page to drive it headless.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

function element(tag) {
  const listeners = {};
  const node = {
    tagName: String(tag).toUpperCase(),
    children: [],
    dataset: {},
    style: {},
    value: "",
    textContent: "",
    className: "",
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    dispatch(type, ev) { (listeners[type] || []).forEach((fn) => fn(ev || {})); },
    append(...items) { items.forEach((item) => node.children.push(item)); },
    appendChild(item) { node.children.push(item); return item; },
    replaceChildren(...items) { node.children = items; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    setAttribute() {},
    click() { node.dispatch("click"); },
  };
  return node;
}

function loadEditor(options) {
  const opts = options || {};
  const ids = {};
  const created = [];
  const docListeners = {};
  // drawPage stands in for the reader: one board, 640 by 480, at the stage's corner.
  const drawPage = (stage) => {
    const board = element("div");
    board.style.width = "640px";
    board.style.height = "480px";
    board.getBoundingClientRect = () => ({ left: 0, top: 0, width: 640, height: 480 });
    stage.querySelector = (sel) => (sel === ".board" ? board : null);
  };
  const blobs = [];
  const fetched = [];
  const document = {
    addEventListener(type, fn) { (docListeners[type] = docListeners[type] || []).push(fn); },
    getElementById(id) { return (ids[id] = ids[id] || element("div")); },
    createElement(tag) { const node = element(tag); created.push(node); return node; },
    createElementNS: (ns, tag) => element(tag),
  };
  class Blob {
    constructor(parts) {
      this.parts = parts;
      blobs.push(this);
    }
    bytes() {
      const chunks = this.parts.map((part) => (typeof part === "string" ? Buffer.from(part) : Buffer.from(part)));
      return new Uint8Array(Buffer.concat(chunks));
    }
  }
  const sandbox = {
    console,
    document,
    Blob,
    TextEncoder,
    TextDecoder,
    URL: { createObjectURL: () => "blob:test" },
    FileReader: function () {},
    FoolReader: {
      drawPage,
      unpackBytes: async () => opts.opens || { pages: [] },
      fetchBook: async (url) => { fetched.push(url); return opts.opens || { pages: [] }; },
    },
    fetch: async (url) => {
      const file = path.join(ROOT, "editor", String(url).split("?")[0]);
      const body = fs.readFileSync(file, "utf8");
      return { ok: true, json: async () => JSON.parse(body) };
    },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  // The page loads the shared shelf before the editor, as editor/index.html does.
  vm.runInContext(fs.readFileSync(path.join(ROOT, "foolbook", "shelf.js"), "utf8"), sandbox, { filename: "shelf.js" });
  vm.runInContext(fs.readFileSync(path.join(ROOT, "editor", "properties.js"), "utf8"), sandbox, { filename: "properties.js" });
  const source = fs.readFileSync(path.join(ROOT, "editor", "editor.js"), "utf8");
  // Top-level let/const stay inside the script, so hand the state out on the way in.
  vm.runInContext(source + "\n;this.__editor = { get book() { return book; } };", sandbox, { filename: "editor.js" });
  const tools = ids.tools;
  const press = (label) => {
    const found = tools.children.find((node) => node.tagName === "BUTTON" && node.textContent === label);
    if (!found) throw new Error("no " + label + " button");
    found.click();
  };
  // The Open button's hidden file input is the first input the page makes.
  const open = async (name) => {
    const opener = created.find((node) => node.tagName === "INPUT");
    opener.files = [{ name: name, arrayBuffer: async () => new ArrayBuffer(0) }];
    opener.dispatch("change");
    await new Promise((done) => setImmediate(done));
  };
  // Drag on the page with the current tool, the way a mouse would.
  const drag = (x0, y0, x1, y1) => {
    const glass = created.filter((node) => node.className === "glass").pop();
    glass.dispatch("pointerdown", { clientX: x0, clientY: y0 });
    ids.stage.dispatch("pointermove", { clientX: x1, clientY: y1 });
    ids.stage.dispatch("pointerup", { clientX: x1, clientY: y1 });
  };
  const key = (k, ctrl) => (docListeners.keydown || []).forEach((fn) => fn({ key: k, ctrlKey: !!ctrl, metaKey: false, target: {}, preventDefault() {} }));
  const settle = () => new Promise((done) => setImmediate(done));
  return { sandbox, ids, blobs, fetched, created, press, open, settle, drag, key, editor: sandbox.__editor };
}

module.exports = { loadEditor, ROOT };
