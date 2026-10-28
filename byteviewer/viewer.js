"use strict";

const WINDOW = 512;
const viewEl = document.getElementById("view");
const jumps = document.getElementById("jumps");
const readout = document.getElementById("readout");
let raw = new Uint8Array();
let source = new Uint8Array();
let ranges = [];
let marks = [];
let cursor = 0;
let pinned = -1;
let banner = "";

function findSeq(u8, seq, from, end) {
  const start = from || 0;
  const stop = end == null ? u8.length : Math.min(u8.length, end);
  outer: for (let i = start; i <= stop - seq.length; i++) {
    for (let k = 0; k < seq.length; k++) if (u8[i + k] !== seq[k]) continue outer;
    return i;
  }
  return -1;
}

function cstr(u8, off, n) {
  let s = "";
  for (let i = 0; i < n && off + i < u8.length; i++) {
    const c = u8[off + i];
    if (!c || c < 32 || c > 126) break;
    s += String.fromCharCode(c);
  }
  return s;
}

function add(a, b, kind, note) {
  if (b > a) ranges.push([a, Math.min(b, raw.length), kind, note]);
}

function mark(name, off, kind) {
  marks.push({ name, off, kind });
}

function bitmapSize(u8, off) {
  if (off + 20 > u8.length || u8[off] !== 0x42 || u8[off + 1] !== 0x4d) return 0;
  const data = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const size = data.getUint32(off + 2, true);
  const header = data.getUint32(off + 14, true);
  if (size < 54 || size > 8000000 || off + size > u8.length) return 0;
  if (header !== 12 && header !== 40 && header !== 108 && header !== 124) return 0;
  return size;
}

function fileNote(u8, name) {
  const head = new TextDecoder().decode(u8.slice(0, Math.min(4, u8.length)));
  const lower = (name || "").toLowerCase();
  if (head === "FBK1") return "Foolbook book. The four bytes are FBK1.";
  if (head === "FSK1") return "Foolbook system book. The four bytes are FSK1.";
  if (head === "FSC1") return "Foolbook course. The four bytes are FSC1.";
  if (u8[0] === 0x7b || u8[0] === 0x5b) return "JSON bytes.";
  if (u8[0] === 0x50 && u8[1] === 0x4b) return "Zip bytes. A ToolBook XML book is a zip.";
  if (u8.length >= 0xc04 && new DataView(u8.buffer, u8.byteOffset, u8.byteLength).getUint32(0xc00, true) === 0x22222222) {
    const named = lower.endsWith(".fbk") || lower.endsWith(".fsk");
    return "ToolBook " + (lower.endsWith(".sbk") || lower.endsWith(".fsk") ? "system book" : "book") + ". The book starts at hex C00." + (named ? " The name says Foolbook. The bytes say ToolBook." : "");
  }
  if (u8[0] === 0x4d && u8[1] === 0x5a) return "Windows program. MZ at byte 0.";
  return "";
}

function classify(u8) {
  ranges = [];
  marks = [];
  const head = new TextDecoder().decode(u8.slice(0, Math.min(4, u8.length)));
  if (u8[0] === 0x50 && u8[1] === 0x4b) {
    const data = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let i = 0;
    while (i + 30 < u8.length && data.getUint32(i, true) === 0x04034b50 && marks.length < 300) {
      const method = data.getUint16(i + 8, true);
      const compSize = data.getUint32(i + 18, true);
      const nameLen = data.getUint16(i + 26, true);
      const extraLen = data.getUint16(i + 28, true);
      const name = new TextDecoder().decode(u8.slice(i + 30, i + 30 + nameLen));
      const low = name.toLowerCase();
      let kind = "object";
      let note = "Object. File " + name + ".";
      if (low.endsWith(".script")) { kind = "script"; note = "Script. OpenScript in " + name + "."; }
      else if (/\.(png|gif|jpg|jpeg|bmp)$/i.test(low)) { kind = "bitmap"; note = "Bitmap. " + name + "."; }
      else if (low.endsWith("book.xml")) { kind = "page"; note = "Object. Book.xml is the book."; }
      else if (low.endsWith(".xml")) { kind = "text"; note = "Text. " + name + "."; }
      const dataAt = i + 30 + nameLen + extraLen;
      add(i, dataAt, "header", "Header. Zip local header for " + name + ", method " + method + ".");
      if (compSize) add(dataAt, dataAt + compSize, kind, note);
      mark(name || "zip", i, kind);
      i = dataAt + compSize;
    }
    return;
  }
  if (head === "FBK1" || head === "FSK1" || head === "FSC1") {
    add(0, 4, "header", "Header. " + head + ".");
    add(4, 5, "header", "Header. Bit 0 set means the rest is zlib.");
    add(5, u8.length, "text", (u8[4] & 1) ? "Text. Compressed book. Inflate shows the JSON bytes." : "Text. The JSON book.");
    mark("header", 0, "header");
    mark("payload", 5, "text");
    return;
  }
  if (u8[0] === 0x4d && u8[1] === 0x5a) add(0, Math.min(0x80, u8.length), "stub", "Stub. DOS header of the Windows program in front of the book.");
  const pe = findSeq(u8, [0x50, 0x45, 0, 0], 0, 0x400);
  if (pe >= 0) add(pe, pe + 4, "stub", "Stub. PE signature.");
  if (u8.length >= 0xc04 && new DataView(u8.buffer, u8.byteOffset, u8.byteLength).getUint32(0xc00, true) === 0x22222222) {
    add(0, 0xc00, "stub", "Stub. Windows program. The book starts at hex C00.");
    add(0xc00, 0xc04, "header", "Header. Book mark 22 22 22 22.");
    mark("book", 0xc00, "header");
  }
  const jbo = findSeq(u8, [0x03, 0x4a, 0x42, 0x4f]);
  if (jbo >= 0) {
    add(jbo, jbo + 4, "object", "Object. Object store. The bytes 03 4A 42 4F read as JBO.");
    mark("object store", jbo, "object");
  }
  const pageMarks = [[0x80, 0x65, 0x00, 0x05, 0x00, 0x02, 0x02], [0x81, 0x65, 0x00, 0x05, 0x00, 0x02, 0x02]];
  for (let i = 0; i + 16 < u8.length && marks.length < 500; i++) {
    for (const sig of pageMarks) {
      if (u8[i] !== sig[0]) continue;
      let ok = true;
      for (let k = 1; k < 7; k++) if (u8[i + k] !== sig[k]) ok = false;
      const name = cstr(u8, i + 7, 32);
      if (!ok || !name.startsWith("P")) continue;
      const nested = sig[0] === 0x81;
      add(i, i + 7 + name.length, "page", "Object. " + (nested ? "Nested page " : "Page ") + name + ". Mark " + (nested ? "81 65" : "80 65") + ".");
      mark(name, i, "page");
    }
  }
  let from = 0;
  let scripts = 0;
  const handle = [0x74, 0x6f, 0x20, 0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65];
  while (scripts < 80) {
    const at = findSeq(u8, handle, from);
    if (at < 0) break;
    let end = at;
    while (end < u8.length && end < at + 400 && u8[end] >= 32 && u8[end] < 127) end++;
    add(at, Math.max(end, at + 9), "script", "Script. OpenScript. The bytes spell “to handle”.");
    mark("script " + at.toString(16), at, "script");
    scripts += 1;
    from = at + 9;
  }
  let bm = 0;
  let pictures = 0;
  while (pictures < 40) {
    const at = u8.indexOf(0x42, bm);
    if (at < 0) break;
    const size = bitmapSize(u8, at);
    if (size) {
      add(at, at + size, "bitmap", "Bitmap. Windows BMP, " + size + " bytes.");
      mark("bitmap " + at.toString(16), at, "bitmap");
      pictures += 1;
      bm = at + size;
    } else bm = at + 1;
  }
  let textAt = 0;
  let texts = 0;
  const textMark = [0x54, 0x65, 0x78, 0x74, 0, 0];
  while (texts < 40) {
    const at = findSeq(u8, textMark, textAt);
    if (at < 0) break;
    add(at, at + 6, "text", "Object. Text field. The bytes spell Text and then two zeros.");
    mark("text " + at.toString(16), at, "text");
    texts += 1;
    textAt = at + 6;
  }
}

function covering(off) {
  return ranges.filter((range) => off >= range[0] && off < range[1]);
}

function cls(off) {
  const hits = covering(off);
  if (!hits.length) return "";
  const prefer = ["bitmap", "script", "page", "text", "object", "header", "stub"];
  for (const kind of prefer) if (hits.some((range) => range[2] === kind)) return kind;
  return hits[hits.length - 1][2];
}

function say(off) {
  if (!raw.length) return "Open a file. The bytes are the view.";
  const hits = covering(off);
  const where = "Byte " + off.toString(16) + ".";
  if (!hits.length) return where + " Not marked.";
  return where + " " + hits.map((range) => range[3]).join(" ");
}

function hex(n, w) { return n.toString(16).padStart(w, "0"); }

function draw() {
  const start = raw.length ? (Math.max(0, Math.min(raw.length - 1, cursor)) & ~15) : 0;
  cursor = start;
  document.getElementById("goto").value = "0x" + start.toString(16);
  document.getElementById("stat").textContent = raw.length ? (start.toString(16) + " / " + raw.length.toString(16)) : "";
  readout.textContent = (banner ? banner + "  " : "") + say(pinned >= 0 ? pinned : start);
  viewEl.replaceChildren();
  const end = Math.min(raw.length, start + WINDOW);
  for (let row = start; row < end; row += 16) {
    const line = document.createElement("div");
    line.className = "row";
    const off = document.createElement("span");
    off.className = "off";
    off.textContent = hex(row, 6) + "  ";
    line.appendChild(off);
    let asc = "";
    for (let col = 0; col < 16; col++) {
      const i = row + col;
      const cell = document.createElement("span");
      cell.className = "b" + (i < raw.length ? " " + cls(i) : "");
      cell.dataset.off = String(i);
      if (i < raw.length) {
        cell.textContent = hex(raw[i], 2);
        asc += raw[i] >= 32 && raw[i] < 127 ? String.fromCharCode(raw[i]) : ".";
      } else cell.textContent = "  ";
      line.appendChild(cell);
      line.appendChild(document.createTextNode(col === 7 ? "  " : " "));
    }
    const ascii = document.createElement("span");
    ascii.className = "ascii";
    ascii.textContent = asc;
    line.appendChild(ascii);
    viewEl.appendChild(line);
  }
  jumps.querySelectorAll("button").forEach((button) => button.classList.toggle("on", button._off === start));
}

function jump(off) {
  pinned = off;
  cursor = off;
  draw();
}

function showMarks() {
  jumps.replaceChildren();
  marks.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button._off = entry.off & ~15;
    button.textContent = entry.kind + "  " + entry.name;
    button.addEventListener("click", () => jump(entry.off));
    jumps.appendChild(button);
  });
}

function load(name, bytes) {
  source = bytes;
  raw = bytes;
  pinned = 0;
  classify(bytes);
  const head = new TextDecoder().decode(bytes.slice(0, Math.min(4, bytes.length)));
  document.getElementById("payload").disabled = !((head === "FBK1" || head === "FSK1" || head === "FSC1") && (bytes[4] & 1));
  banner = name ? (name + ". " + bytes.length.toLocaleString() + " bytes. " + fileNote(bytes, name)) : "";
  showMarks();
  cursor = 0;
  draw();
}

viewEl.addEventListener("mousemove", (ev) => {
  const cell = ev.target.closest(".b");
  if (!cell || cell.dataset.off == null || !raw.length) return;
  pinned = Number(cell.dataset.off);
  readout.textContent = (banner ? banner + "  " : "") + say(pinned);
});

document.getElementById("prev").addEventListener("click", () => jump(cursor - WINDOW));
document.getElementById("next").addEventListener("click", () => jump(cursor + WINDOW));
document.getElementById("go").addEventListener("click", () => {
  const text = document.getElementById("goto").value.trim();
  const n = text.startsWith("0x") || text.startsWith("0X") ? parseInt(text, 16) : parseInt(text, 10);
  if (!Number.isNaN(n)) jump(n);
});
document.getElementById("find").addEventListener("click", () => {
  const q = document.getElementById("q").value.trim();
  if (!q) return;
  let needle;
  if (/^(?:[0-9a-f]{2}\s*)+$/i.test(q)) needle = new Uint8Array(q.split(/\s+/).map((h) => parseInt(h, 16)));
  else needle = new TextEncoder().encode(q);
  const at = findSeq(raw, needle, cursor + 1);
  if (at >= 0) jump(at);
  else document.getElementById("stat").textContent = "not found";
});
document.getElementById("open").addEventListener("click", () => document.getElementById("file").click());
document.getElementById("file").addEventListener("change", () => {
  const file = document.getElementById("file").files[0];
  if (!file) return;
  file.arrayBuffer().then((buf) => load(file.name, new Uint8Array(buf)));
});
document.getElementById("sample").addEventListener("click", async () => {
  readout.textContent = "Opening First Light…";
  const res = await fetch("https://raw.githubusercontent.com/squirelworks/Foolbook/main/_books/first_light/first_light.fbk");
  if (!res.ok) { readout.textContent = "First Light did not open."; return; }
  load("first_light.fbk", new Uint8Array(await res.arrayBuffer()));
});
document.getElementById("payload").addEventListener("click", async () => {
  if (source.length < 6 || !(source[4] & 1)) return;
  const inflated = await inflate(source.slice(7, source.length - 4));
  load("inflated", inflated);
});
document.body.addEventListener("dragover", (ev) => ev.preventDefault());
document.body.addEventListener("drop", (ev) => {
  ev.preventDefault();
  const file = ev.dataTransfer.files[0];
  if (file) file.arrayBuffer().then((buf) => load(file.name, new Uint8Array(buf)));
});

async function inflate(data) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
