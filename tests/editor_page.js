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

function loadEditor() {
  const ids = {};
  const blobs = [];
  const document = {
    getElementById(id) { return (ids[id] = ids[id] || element("div")); },
    createElement: element,
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
    FoolReader: { drawPage() {}, unpackBytes: async () => ({ pages: [] }) },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const source = fs.readFileSync(path.join(ROOT, "editor", "editor.js"), "utf8");
  // Top-level let/const stay inside the script, so hand the state out on the way in.
  vm.runInContext(source + "\n;this.__editor = { get book() { return book; } };", sandbox, { filename: "editor.js" });
  const tools = ids.tools;
  const press = (label) => {
    const found = tools.children.find((node) => node.tagName === "BUTTON" && node.textContent === label);
    if (!found) throw new Error("no " + label + " button");
    found.click();
  };
  return { sandbox, ids, blobs, press, editor: sandbox.__editor };
}

module.exports = { loadEditor, ROOT };
