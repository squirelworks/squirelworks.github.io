"use strict";

const NIDA_RAW = "https://raw.githubusercontent.com/squirelworks/NIDA_ATT/main/";
const COURSE_RAW = "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/";

function pictureURL(book, shape) {
  let data = shape.data || shape.src || "";
  if (typeof data === "string" && data.startsWith("#")) {
    const list = book.images || [];
    data = list[Number(data.slice(1))] || "";
  }
  if (typeof data !== "string" || data.length < 32) return "";
  if (data.startsWith("data:")) return data;
  const kind = data.startsWith("iVBOR") ? "png" : data.startsWith("/9j/") ? "jpeg" : "bmp";
  return "data:image/" + kind + ";base64," + data;
}

function pageJump(shape) {
  if (shape.item && shape.item.page) return String(shape.item.page);
  const source = shape.script || "";
  const found = /go to page\("([^"]+)"\)/i.exec(source);
  return found ? found[1] : "";
}

function pageSize(page) {
  let w = 640;
  let h = 480;
  const given = page.size;
  if (Array.isArray(given) && given.length >= 2) {
    w = Number(given[0]) || w;
    h = Number(given[1]) || h;
  }
  (page.shapes || []).forEach((shape) => {
    const x = Number(shape.x) || 0;
    const y = Number(shape.y) || 0;
    const sw = Number(shape.w) || 0;
    const sh = Number(shape.h) || 0;
    w = Math.max(w, x + sw);
    h = Math.max(h, y + sh);
  });
  return [w, h];
}

async function unpackBytes(u8) {
  const head = new TextDecoder().decode(u8.slice(0, 4));
  let payload = u8.slice(5);
  let magic = head;
  if (head === "FBK1" || head === "FSK1" || head === "FSC1") {
    if (u8[4] & 1) {
      const raw = payload.slice(2, Math.max(2, payload.length - 4));
      const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      payload = new Uint8Array(await new Response(stream).arrayBuffer());
    }
  } else if (u8[0] === 0x7b || u8[0] === 0x5b) {
    payload = u8;
    magic = "JSON";
  } else {
    throw new Error("not an FBK, FSK, or FSC");
  }
  const book = JSON.parse(new TextDecoder().decode(payload));
  book._magic = magic;
  return book;
}

async function fetchBook(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return unpackBytes(new Uint8Array(await res.arrayBuffer()));
}

function findPage(book, id) {
  const want = String(id || "").toLowerCase();
  return (book.pages || []).find((page) => String(page.id).toLowerCase() === want) || book.pages[0];
}

function drawPage(stage, book, page, onJump, onPick) {
  stage.replaceChildren();
  const [w, h] = pageSize(page);
  const scale = Math.min(1, (stage.clientWidth || 640) / w);
  const board = document.createElement("div");
  board.className = "board";
  board.style.width = w + "px";
  board.style.height = h + "px";
  board.style.transform = "scale(" + scale + ")";
  stage.style.height = Math.ceil(h * scale) + 8 + "px";
  (page.shapes || []).forEach((shape, index) => {
    if (shape.visible === false) return;
    const kind = (shape.kind || "rect").toLowerCase();
    const x = Number(shape.x) || 0;
    const y = Number(shape.y) || 0;
    const sw = Number(shape.w) || 0;
    const sh = Number(shape.h) || 0;
    let el;
    if (kind === "polygon" || kind === "line") {
      el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.setAttribute("class", "shape");
      el.style.left = "0";
      el.style.top = "0";
      el.style.width = w + "px";
      el.style.height = h + "px";
      const pts = (shape.points || []).map((p) => p[0] + "," + p[1]).join(" ");
      const node = document.createElementNS("http://www.w3.org/2000/svg", kind === "line" ? "polyline" : "polygon");
      node.setAttribute("points", pts);
      node.setAttribute("fill", kind === "line" ? "none" : (shape.fill || "none"));
      node.setAttribute("stroke", shape.outline || "#000");
      el.appendChild(node);
    } else if (kind === "ellipse" || kind === "oval") {
      el = document.createElement("div");
      el.className = "shape";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = sw + "px";
      el.style.height = sh + "px";
      el.style.borderRadius = "50%";
      el.style.background = shape.fill || "transparent";
      el.style.border = "1px solid " + (shape.outline || "#000");
    } else if (kind === "image" || (kind === "button" && pictureURL(book, shape))) {
      el = document.createElement("img");
      el.className = "shape";
      el.alt = shape.name || "";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = sw + "px";
      el.style.height = sh + "px";
      const url = pictureURL(book, shape);
      if (url) el.src = url;
    } else if (kind === "text" || kind === "button" || kind === "rect") {
      el = document.createElement("div");
      el.className = "shape " + kind;
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = sw + "px";
      el.style.height = sh + "px";
      if (kind !== "text") {
        el.style.background = shape.fill || "transparent";
        el.style.border = "1px solid " + (shape.outline || (kind === "button" ? "#000" : "transparent"));
      }
      if (kind !== "rect" && shape.text) {
        el.textContent = shape.text;
        el.style.fontSize = (Number(shape.size) || (kind === "button" ? 12 : 12)) + "px";
        el.style.color = shape.outline || "#000";
        el.style.fontWeight = shape.bold ? "bold" : "normal";
        el.style.whiteSpace = "pre-wrap";
        el.style.overflow = "hidden";
      }
    }
    if (!el) return;
    el.dataset.index = String(index);
    const dest = pageJump(shape);
    if (dest) {
      el.style.cursor = "pointer";
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onJump(dest);
      });
    } else if (onPick) {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onPick(index);
      });
    }
    board.appendChild(el);
  });
  stage.appendChild(board);
}

function mountReader(host, book, options) {
  host.replaceChildren();
  const bar = document.createElement("div");
  bar.className = "readerbar";
  const title = document.createElement("b");
  const prev = document.createElement("button");
  prev.type = "button";
  prev.textContent = "Prev";
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "Next";
  const edit = document.createElement("button");
  edit.type = "button";
  edit.textContent = "Edit";
  bar.append(prev, next, title, edit);
  const stage = document.createElement("div");
  stage.className = "stage";
  const jumps = document.createElement("div");
  jumps.className = "jumps";
  host.append(bar, stage, jumps);
  let index = 0;
  const pages = book.pages || [];
  function show(id) {
    if (typeof id === "string") {
      const found = pages.findIndex((page) => String(page.id).toLowerCase() === id.toLowerCase());
      if (found >= 0) index = found;
    } else if (typeof id === "number") {
      index = Math.max(0, Math.min(pages.length - 1, id));
    }
    const page = pages[index];
    if (!page) return;
    title.textContent = (book.title || book.id || "Book") + "  ·  " + page.id;
    drawPage(stage, book, page, (dest) => show(dest), options && options.onPick);
    jumps.replaceChildren();
    (page.shapes || []).forEach((shape) => {
      const dest = pageJump(shape);
      if (!dest) return;
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = (shape.name || shape.text || "go") + " → " + dest;
      b.addEventListener("click", () => show(dest));
      jumps.appendChild(b);
    });
    if (options && options.onPage) options.onPage(page, index);
  }
  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  edit.addEventListener("click", () => {
    window.FoolBook = { book, name: (book.id || "book") + ".fbk" };
    if (options && options.onEdit) options.onEdit();
  });
  show(0);
  return { show };
}

window.FoolReader = { unpackBytes, fetchBook, mountReader, drawPage, findPage, NIDA_RAW, COURSE_RAW };
