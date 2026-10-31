"use strict";

const TOOLS = [
  ["select", "Select"],
  ["button", "Button"],
  ["text", "Field"],
  ["box", "Rectangle"],
  ["line", "Line"],
  ["ellipse", "Ellipse"],
  ["polygon", "Polygon"],
  ["picture", "Picture"],
];
const KIND = { button: "button", text: "text", box: "rect", line: "line", ellipse: "ellipse", polygon: "polygon", picture: "image" };
const SIZE = { button: [90, 28], text: [160, 36], box: [100, 60], line: [80, 8], ellipse: [80, 60], polygon: [80, 60], picture: [120, 80] };

const tools = document.getElementById("tools");
const pagelist = document.getElementById("pagelist");
const stage = document.getElementById("stage");
const props = document.getElementById("props");
const status = document.getElementById("status");
const opener = document.createElement("input");
opener.type = "file";
const picture = document.createElement("input");
picture.type = "file";
picture.accept = "image/*";

let tool = "select";
let layer = "page";
let pageIndex = 0;
let shapeIndex = -1;
let drag = null;
let book = blank();
// The book version this editor writes. editor/schema.json says it; 1 until it loads.
let known = 1;
fetch("schema.json?v=2").then((res) => res.json()).then((schema) => { known = schema.fbk; }).catch(() => {});

function blank() {
  return {
    id: "new",
    title: "New book",
    pages: [freshPage("P0")],
    _magic: "FBK1",
  };
}

function freshPage(id) {
  return {
    id: id,
    text: [""],
    items: [],
    shapes: [{ kind: "rect", name: "paper", x: 0, y: 0, w: 640, h: 480, fill: "#f7f4ee", outline: "#c8c0b0", layer: "background" }],
  };
}

function page() {
  return book.pages[pageIndex];
}

function selected() {
  return shapeIndex >= 0 ? page().shapes[shapeIndex] : null;
}

function button(label, on) {
  const node = document.createElement("button");
  node.type = "button";
  node.textContent = label;
  node.addEventListener("click", on);
  return node;
}

function buildTools() {
  tools.append(button("New", () => { book = blank(); pageIndex = 0; shapeIndex = -1; render(); }));
  tools.append(button("Open", () => opener.click()));
  tools.append(button("Download", download));
  TOOLS.forEach(([id, label]) => {
    const node = button(label, () => { tool = id; markTools(); });
    node.dataset.tool = id;
    tools.appendChild(node);
  });
  const pageLayer = button("Page", () => { layer = "page"; markTools(); });
  pageLayer.dataset.layer = "page";
  const backLayer = button("Background", () => { layer = "background"; markTools(); });
  backLayer.dataset.layer = "background";
  tools.append(pageLayer, backLayer);
  const fill = document.createElement("input");
  fill.type = "color";
  fill.value = "#c0c0c0";
  fill.title = "Fill";
  fill.addEventListener("input", () => paintColor("fill", fill.value));
  const line = document.createElement("input");
  line.type = "color";
  line.value = "#000000";
  line.title = "Line";
  line.addEventListener("input", () => paintColor("outline", line.value));
  tools.append(fill, line, button("Front", () => restack(1)), button("Back", () => restack(-1)));
  markTools();
}

function markTools() {
  tools.querySelectorAll("button").forEach((node) => {
    node.classList.toggle("on", node.dataset.tool === tool || node.dataset.layer === layer);
  });
}

function names() {
  const used = new Set();
  book.pages.forEach((item) => (item.shapes || []).forEach((shape) => used.add(shape.name)));
  return used;
}

function place(kind, x0, y0, x1, y1) {
  const left = Math.min(x0, x1);
  const top = Math.min(y0, y1);
  let w = Math.abs(x1 - x0);
  let h = Math.abs(y1 - y0);
  const ordinary = SIZE[kind];
  if (w < 8) w = ordinary[0];
  if (h < 8) h = ordinary[1];
  const label = TOOLS.find((item) => item[0] === kind)[1];
  const used = names();
  let name = label;
  let n = 2;
  while (used.has(name)) name = label + n++;
  const shape = {
    kind: KIND[kind],
    name: name,
    x: Math.round(left),
    y: Math.round(top),
    w: Math.round(w),
    h: Math.round(h),
    text: kind === "button" || kind === "text" ? label : "",
    script: "",
    fill: kind === "button" || kind === "polygon" ? "#c0c0c0" : (kind === "box" ? "#ffffff" : ""),
    outline: "#000000",
    visible: true,
    layer: layer,
  };
  if (kind === "line" || kind === "polygon") {
    shape.points = kind === "line"
      ? [[Math.round(x0), Math.round(y0)], [Math.round(x1), Math.round(y1)]]
      : [[shape.x, shape.y], [shape.x + shape.w, shape.y], [shape.x + shape.w, shape.y + shape.h], [shape.x, shape.y + shape.h]];
  }
  page().shapes.push(shape);
  shapeIndex = page().shapes.length - 1;
  return shape;
}

function paintColor(key, value) {
  const shape = selected();
  if (!shape || shape.name === "paper") return;
  shape[key] = value;
  draw();
}

function restack(dir) {
  const shapes = page().shapes;
  const next = shapeIndex + dir;
  if (shapeIndex < 1 || next < 1 || next >= shapes.length) return;
  const [shape] = shapes.splice(shapeIndex, 1);
  shapes.splice(next, 0, shape);
  shapeIndex = next;
  draw();
}

function render() {
  listPages();
  draw();
  fillProps();
}

function listPages() {
  pagelist.replaceChildren();
  book.pages.forEach((item, index) => {
    const node = button(item.id, () => {
      pageIndex = index;
      shapeIndex = -1;
      render();
    });
    if (index === pageIndex) node.className = "on";
    pagelist.appendChild(node);
  });
  const row = document.createElement("div");
  row.id = "row";
  row.append(button("Add", () => {
    const id = "P" + book.pages.length;
    book.pages.push(freshPage(id));
    pageIndex = book.pages.length - 1;
    shapeIndex = -1;
    render();
  }), button("Delete", () => {
    if (book.pages.length < 2) return;
    book.pages.splice(pageIndex, 1);
    pageIndex = Math.max(0, pageIndex - 1);
    shapeIndex = -1;
    render();
  }));
  pagelist.appendChild(row);
}

function draw() {
  FoolReader.drawPage(stage, book, page(), () => {}, () => {});
  const board = stage.querySelector(".board");
  if (!board) return;
  const glass = document.createElement("div");
  glass.className = "glass";
  board.appendChild(glass);
  const shape = selected();
  if (shape && shape.name !== "paper") {
    const mark = document.createElement("div");
    mark.className = "pick";
    mark.style.left = (Number(shape.x) || 0) + "px";
    mark.style.top = (Number(shape.y) || 0) + "px";
    mark.style.width = (Number(shape.w) || 0) + "px";
    mark.style.height = (Number(shape.h) || 0) + "px";
    board.appendChild(mark);
  }
  glass.addEventListener("pointerdown", onDown);
}

stage.addEventListener("pointermove", onMove);
stage.addEventListener("pointerup", onUp);

function point(ev) {
  const board = stage.querySelector(".board");
  const rect = board.getBoundingClientRect();
  const w = parseFloat(board.style.width) || rect.width;
  const h = parseFloat(board.style.height) || rect.height;
  return {
    x: (ev.clientX - rect.left) * (w / rect.width),
    y: (ev.clientY - rect.top) * (h / rect.height),
  };
}

function hit(x, y) {
  const shapes = page().shapes || [];
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (shape.visible === false || shape.name === "paper") continue;
    const sx = Number(shape.x) || 0;
    const sy = Number(shape.y) || 0;
    if (x >= sx && y >= sy && x <= sx + (Number(shape.w) || 0) && y <= sy + (Number(shape.h) || 0)) return i;
  }
  return -1;
}

function onDown(ev) {
  const at = point(ev);
  if (tool === "select") {
    shapeIndex = hit(at.x, at.y);
    const shape = selected();
    drag = shape ? { mode: "move", x: at.x, y: at.y, ox: shape.x, oy: shape.y } : null;
    fillProps();
    draw();
    return;
  }
  if (tool === "picture") {
    drag = { mode: "picture", x: at.x, y: at.y };
    picture.click();
    return;
  }
  drag = { mode: "new", x: at.x, y: at.y };
}

function onMove(ev) {
  if (!drag || drag.mode !== "move") return;
  const at = point(ev);
  const shape = selected();
  if (!shape) return;
  shape.x = Math.round(drag.ox + at.x - drag.x);
  shape.y = Math.round(drag.oy + at.y - drag.y);
  draw();
}

function onUp(ev) {
  if (!drag || drag.mode === "picture") return;
  const at = point(ev);
  if (drag.mode === "new") place(tool, drag.x, drag.y, at.x, at.y);
  drag = null;
  status.textContent = page().id + (selected() ? "  ·  " + selected().name : "");
  render();
}

function fillProps() {
  props.replaceChildren();
  const current = page();
  const id = document.createElement("input");
  id.value = current.id;
  props.append("Page id", id);
  id.addEventListener("change", () => { current.id = id.value || current.id; listPages(); });
  const shape = selected();
  if (!shape) {
    const note = document.createElement("p");
    note.textContent = "Select an object, or choose a tool and drag on the page.";
    props.appendChild(note);
    return;
  }
  const name = document.createElement("input");
  name.value = shape.name || "";
  const text = document.createElement("textarea");
  text.value = shape.text || "";
  const script = document.createElement("textarea");
  script.value = shape.script || "";
  props.append("Name", name, "Text", text, "Script", script);
  name.addEventListener("input", () => { shape.name = name.value; });
  text.addEventListener("input", () => { shape.text = text.value; draw(); });
  script.addEventListener("input", () => { shape.script = script.value; });
}

function download() {
  if (typeof book.fbk === "number" && book.fbk > known) {
    status.textContent = "This book is Foolbook book version " + book.fbk + ". This editor writes version " + known + ". It was not saved.";
    return;
  }
  const copy = JSON.parse(JSON.stringify(book));
  delete copy._magic;
  copy.fbk = known;
  const payload = new TextEncoder().encode(JSON.stringify(copy));
  const out = new Uint8Array(5 + payload.length);
  out.set(new TextEncoder().encode("FBK1"));
  out.set(payload, 5);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([out]));
  a.download = (book.title || "book") + ".fbk";
  a.click();
}

opener.addEventListener("change", async () => {
  const file = opener.files && opener.files[0];
  if (!file) return;
  book = await FoolReader.unpackBytes(new Uint8Array(await file.arrayBuffer()));
  if (!book.pages) book.pages = [];
  book.pages.forEach((item) => { if (!item.shapes) item.shapes = []; });
  book.title = file.name.replace(/\.(fbk|fsk|tbk|sbk)$/i, "");
  pageIndex = 0;
  shapeIndex = -1;
  status.textContent = file.name;
  render();
});

picture.addEventListener("change", () => {
  const file = picture.files && picture.files[0];
  picture.value = "";
  if (!file || !drag) return;
  const at = drag;
  const reader = new FileReader();
  reader.onload = () => {
    const shape = place("picture", at.x, at.y, at.x + 120, at.y + 80);
    shape.data = reader.result;
    drag = null;
    render();
  };
  reader.readAsDataURL(file);
});

buildTools();
render();
