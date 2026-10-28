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

function pale(color) {
  const hex = String(color || "").replace("#", "");
  if (hex.length < 6) return true;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return true;
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

function jumpOf(shape) {
  const item = shape.item || {};
  let page = item.page || shape.page || "";
  let other = item.book || shape.book || "";
  if (!page) {
    const found = /go to page\s*\(?\s*"([^"]+)"/i.exec(shape.script || "");
    if (found) page = found[1];
  }
  return { page: page ? String(page) : "", book: other ? String(other) : "" };
}

function pageJump(shape) {
  return jumpOf(shape).page;
}

function withButtons(page) {
  const shapes = (page.shapes || []).slice();
  const written = shapes.map((shape) => String(shape.text || "")).join("\n");
  const missing = (page.text || []).map((line) => String(line).trim()).filter((line) => line && !written.includes(line));
  if (missing.length && !shapes.some((shape) => shape.text)) {
    const title = missing[0];
    const body = missing.slice(1).join("\n\n");
    shapes.unshift(
      { kind: "rect", x: 0, y: 0, w: 700, h: 480, fill: "#f7f4ee", outline: "#f7f4ee" },
      { kind: "rect", x: 0, y: 0, w: 700, h: 150, fill: "#0b1c3d", outline: "#0b1c3d" },
      { kind: "text", name: "title", x: 36, y: 36, w: 620, h: 80, text: title, outline: "#ffffff", size: 28, bold: true }
    );
    if (body) {
      shapes.push({ kind: "text", x: 36, y: 180, w: 620, h: 220, text: body, outline: "#1a1a1a", size: 16 });
    }
  }
  const have = new Set();
  shapes.forEach((shape) => {
    if ((shape.kind || "") !== "button" && !shape.item) return;
    const label = shape.text || shape.name || (shape.item && shape.item.label) || "";
    if (label) have.add(String(label).toLowerCase());
  });
  let y = 16;
  shapes.forEach((shape) => {
    y = Math.max(y, (Number(shape.y) || 0) + (Number(shape.h) || 0));
  });
  y += shapes.length ? 16 : 28;
  let x = 28;
  (page.items || []).forEach((item) => {
    const label = String(item.label || item.page || "Go");
    if (have.has(label.toLowerCase())) return;
    const w = Math.max(120, Math.min(280, 9 * label.length + 28));
    if (x > 28 && x + w > 700) {
      x = 28;
      y += 48;
    }
    shapes.push({
      kind: "button",
      name: label,
      text: label,
      x: x,
      y: y,
      w: w,
      h: 40,
      fill: "#0b1c3d",
      outline: "#0b1c3d",
      item: item,
      visible: true,
      size: 16,
    });
    x += w + 12;
  });
  return shapes;
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

function u16(u8, off) {
  return u8[off] | (u8[off + 1] << 8);
}

function i16(u8, off) {
  const n = u16(u8, off);
  return n & 0x8000 ? n - 0x10000 : n;
}

function toPixel(twip) {
  const inch = 0x5a0;
  const half = 0x2d0;
  let value = twip * 96 + half;
  if (value < 0) value -= inch;
  if (value < 0) return -Math.floor(-value / inch);
  return Math.floor(value / inch);
}

function findBytes(u8, seq, from) {
  const start = from || 0;
  outer: for (let i = start; i <= u8.length - seq.length; i++) {
    for (let k = 0; k < seq.length; k++) if (u8[i + k] !== seq[k]) continue outer;
    return i;
  }
  return -1;
}

function cstrAt(u8, off, n) {
  let s = "";
  for (let i = 0; i < n && off + i < u8.length; i++) {
    const c = u8[off + i];
    if (!c || c < 32 || c > 126) break;
    s += String.fromCharCode(c);
  }
  return s;
}

function isToolbook(u8) {
  if (u8.length >= 0xc04) {
    const mark = u8[0xc00] | (u8[0xc01] << 8) | (u8[0xc02] << 16) | (u8[0xc03] << 24);
    if ((mark >>> 0) === 0x22222222) return true;
  }
  if (findBytes(u8, [0x03, 0x4a, 0x42, 0x4f]) >= 0) return true;
  return findBytes(u8, [0x80, 0x65, 0x00, 0x05, 0x00, 0x02, 0x02]) >= 0 || findBytes(u8, [0x81, 0x65, 0x00, 0x05, 0x00, 0x02, 0x02]) >= 0;
}

function fieldTexts(blob) {
  const out = [];
  let start = 0;
  while (out.length < 40) {
    const i = findBytes(blob, [0x54, 0x65, 0x78, 0x74, 0x00, 0x00], start);
    if (i < 0) break;
    start = i + 6;
    if (i + 16 > blob.length) continue;
    const length = u16(blob, i + 14);
    if (length < 8 || i + 16 + length > blob.length) continue;
    const raw = blob.subarray(i + 16, i + 16 + length);
    if (raw[0] !== 0x0d && raw[0] !== 0x0a) continue;
    let text = "";
    for (const c of raw) {
      if (c === 0x0d) continue;
      text += c === 0x0a ? "\n" : String.fromCharCode(c);
    }
    text = text.trim();
    if (text) out.push(text);
  }
  return out;
}

function pageJumps(blob) {
  const jumps = [];
  const text = Array.from(blob, (c) => (c >= 32 && c < 127 ? String.fromCharCode(c) : " ")).join("");
  const re = /\("?(P[A-Za-z0-9]+)"?\)/g;
  let match;
  while ((match = re.exec(text))) {
    const name = match[1];
    if (!jumps.includes(name)) jumps.push(name);
  }
  return jumps;
}

function hasWord(blob, word) {
  const bytes = Array.from(word).map((ch) => ch.charCodeAt(0));
  for (let i = 0; i + bytes.length < blob.length; i++) {
    let ok = true;
    for (let k = 0; k < bytes.length; k++) if (blob[i + k] !== bytes[k]) ok = false;
    if (!ok) continue;
    const before = i ? blob[i - 1] : 0;
    const after = blob[i + bytes.length] || 0;
    if (before < 65 && (after === 0 || after < 65)) return true;
  }
  return false;
}

function geometry(blob) {
  const shapes = [];
  const spans = [];
  let idx = 0;
  while (shapes.length < 80) {
    const i = findBytes(blob, [0x10, 0x00], idx);
    if (i < 0) break;
    const found = readPolygon(blob.subarray(i));
    if (found) {
      const end = i + 0x3a + found.count * 4;
      spans.push([i, end]);
      if (found.pixels.length >= 3) {
        shapes.push({ kind: "polygon", points: found.pixels, fill: found.fill || "none", outline: "#000" });
      }
      idx = end;
      continue;
    }
    idx = i + 1;
  }
  idx = 0;
  while (shapes.length < 120) {
    const i = findBytes(blob, [0x01, 0x00, 0x00, 0x04], idx);
    if (i < 0) break;
    if (spans.some(([start, end]) => i >= start && i < end)) { idx = i + 1; continue; }
    if (i >= 20) {
      const vals = [0, 2, 4, 6].map((k) => u16(blob, i - 16 + k));
      if (vals.every((v) => v > 0 && v < 15000) && vals[2] > vals[0] && vals[3] > vals[1]) {
        const x = toPixel(vals[0]);
        const y = toPixel(vals[1]);
        const b = blob[i - 4];
        const g = blob[i - 3];
        const r = blob[i - 2];
        shapes.push({
          kind: "rect", x, y,
          w: Math.max(1, toPixel(vals[2]) - x),
          h: Math.max(1, toPixel(vals[3]) - y),
          fill: "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join(""),
          outline: "#000",
        });
      }
    }
    idx = i + 1;
  }
  return shapes;
}

function readPolygon(record) {
  if (record.length < 0x3a + 4 || record[0] !== 0x10 || record[1] !== 0x00) return null;
  if (record[0x24] !== 0x04 || record[0x25] !== 0x00) return null;
  if (u16(record, 0x38) !== 0) return null;
  const count = u16(record, 0x32);
  if (count < 3 || 0x3a + count * 4 > record.length) return null;
  const bounds = [0, 2, 4, 6].map((step) => i16(record, 0x11 + step));
  if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) return null;
  const pairs = [];
  for (let j = 0; j < count; j++) {
    pairs.push([i16(record, 0x3a + j * 4), i16(record, 0x3a + j * 4 + 2)]);
  }
  const xs = pairs.map((p) => p[0]);
  const ys = pairs.map((p) => p[1]);
  const minx = Math.min(...xs);
  const maxx = Math.max(...xs);
  const miny = Math.min(...ys);
  const maxy = Math.max(...ys);
  const spanX = maxx - minx;
  const spanY = maxy - miny;
  const width = bounds[2] - bounds[0];
  const height = bounds[3] - bounds[1];
  const pixels = pairs.map(([x, y]) => {
    const pageX = spanX === 0 ? bounds[0] : bounds[0] + ((x - minx) * width) / spanX;
    const pageY = spanY === 0 ? bounds[1] : bounds[1] + ((y - miny) * height) / spanY;
    return [toPixel(Math.round(pageX)), toPixel(Math.round(pageY))];
  });
  const pattern = record[0x27];
  const fill = pattern === 0xfd ? "" : "#" + [record[0x1d], record[0x1e], record[0x1f]].map((n) => n.toString(16).padStart(2, "0")).join("");
  return { count, pixels, fill };
}

function readToolbook(u8) {
  const tail = [0x65, 0x00, 0x05, 0x00, 0x02, 0x02];
  const hits = [];
  let scan = 0;
  while (hits.length < 2000) {
    const at = findBytes(u8, tail, scan);
    if (at < 1) break;
    if (u8[at - 1] === 0x80 || u8[at - 1] === 0x81) hits.push(at - 1);
    scan = at + 1;
  }
  const pages = hits.map((off, n) => {
    const next = n + 1 < hits.length ? hits[n + 1] : u8.length;
    const blob = u8.subarray(off, next);
    const id = cstrAt(u8, off + 11, 32) || ("Page" + n);
    const lines = fieldTexts(blob);
    const targets = pageJumps(blob);
    const items = [];
    if (hasWord(blob, "Next") && hasWord(blob, "Back") && targets.length >= 2) {
      items.push({ label: "Next", page: targets[0] }, { label: "Back", page: targets[1] });
      targets.slice(2).forEach((name) => items.push({ label: name, page: name }));
    } else {
      targets.forEach((name) => items.push({ label: name, page: name }));
    }
    const shapes = geometry(blob);
    let y = 20;
    if (!lines.length) {
      shapes.push({ kind: "text", name: "title", x: 24, y, w: 640, h: 36, text: id, outline: "#1a1a1a", size: 22, bold: true });
      y += 48;
    }
    lines.forEach((line, index) => {
      const rows = line.split("\n").length;
      const h = Math.max(32, rows * 22 + 8);
      shapes.push({
        kind: "text", name: index === 0 ? "title" : "",
        x: 24, y, w: 652, h, text: line, outline: "#1a1a1a", size: 16,
      });
      y += h + 10;
    });
    let x = 24;
    items.forEach((item) => {
      const w = Math.max(88, Math.min(220, item.label.length * 10 + 28));
      shapes.push({
        kind: "button", name: item.label, text: item.label,
        x, y: y + 8, w, h: 36, fill: "#0b1c3d", outline: "#0b1c3d", item, size: 15,
      });
      x += w + 12;
    });
    const bottom = Math.max(480, y + 64);
    shapes.unshift({ kind: "rect", x: 0, y: 0, w: 700, h: bottom, fill: "#f7f4ee", outline: "#f7f4ee" });
    return { id, text: lines.length ? lines : [id], items, shapes };
  });
  return { id: "toolbook", title: "ToolBook", pages, format: "tbk" };
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
  } else if (isToolbook(u8)) {
    const stored = window.Toolbook && Toolbook.read(u8);
    const book = stored && stored.pages && stored.pages.length ? stored : readToolbook(u8);
    if (!book.pages || !book.pages.length) throw new Error("not a ToolBook book");
    book._magic = "TBK";
    return book;
  } else {
    throw new Error("not an FBK, FSK, TBK, or SBK");
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
  const shapes = withButtons(page);
  const [w, h] = pageSize({ size: page.size, shapes: shapes });
  const scale = Math.min(1, (stage.clientWidth || 640) / w);
  const board = document.createElement("div");
  board.className = "board";
  board.style.width = w + "px";
  board.style.height = h + "px";
  board.style.transform = "scale(" + scale + ")";
  stage.style.height = Math.ceil(h * scale) + 8 + "px";
  shapes.forEach((shape, index) => {
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
      if (kind !== "rect" && (shape.text || kind === "button")) {
        const named = shape.name || (shape.item && shape.item.label) || "";
        const label = shape.text ? shape.text : (kind === "button" && shape.text !== "" ? named : "");
        el.textContent = label;
        el.style.fontSize = (Number(shape.size) || (kind === "button" ? 16 : 12)) + "px";
        let ink = shape.color || shape.outline || "#000";
        if (kind === "button" && shape.fill && !pale(shape.fill)) ink = "#fff";
        if (kind === "text" && shape.fill) {
          el.style.background = shape.fill;
          if (!pale(shape.fill) && !pale(ink)) ink = "#fff";
          if (pale(shape.fill) && pale(ink)) ink = "#202020";
        }
        el.style.color = ink;
        el.style.fontWeight = shape.bold || kind === "button" ? "bold" : "normal";
        el.style.whiteSpace = "pre-wrap";
        el.style.overflow = "hidden";
        if (kind === "button") {
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.textAlign = "center";
        }
      }
    }
    if (!el) return;
    el.dataset.index = String(index);
    const dest = jumpOf(shape);
    el.style.pointerEvents = dest.page || dest.book || kind === "button" ? "auto" : "none";
    if (dest.page || dest.book) {
      el.style.cursor = "pointer";
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onJump(dest.page, dest.book);
      });
    } else if (onPick && kind === "button") {
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
    withButtons(page).forEach((shape) => {
      const dest = jumpOf(shape);
      if (!dest.page && !dest.book) return;
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = (shape.name || shape.text || "go") + " → " + (dest.book ? dest.book + " " : "") + dest.page;
      b.addEventListener("click", () => show(dest.page));
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
