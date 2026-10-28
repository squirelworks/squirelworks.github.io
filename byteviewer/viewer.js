"use strict";

const list = document.getElementById("list");
const detail = document.getElementById("detail");
const status = document.getElementById("status");
let current = null;

function hexBytes(u8, n) {
  const end = Math.min(u8.length, n || u8.length);
  const lines = [];
  for (let i = 0; i < end; i += 16) {
    let hex = "";
    let asc = "";
    for (let c = 0; c < 16; c++) {
      if (i + c < end) {
        const b = u8[i + c];
        hex += b.toString(16).padStart(2, "0") + " ";
        asc += b >= 32 && b < 127 ? String.fromCharCode(b) : ".";
      }
    }
    lines.push(i.toString(16).padStart(6, "0") + "  " + hex.padEnd(48, " ") + asc);
  }
  if (u8.length > end) lines.push("… " + (u8.length - end) + " more bytes");
  return lines.join("\n");
}

function findSeq(u8, seq, from) {
  const start = from || 0;
  outer: for (let i = start; i <= u8.length - seq.length; i++) {
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

function asciiRun(u8, off, limit) {
  let s = "";
  const end = Math.min(u8.length, off + (limit || 4000));
  for (let i = off; i < end; i++) {
    const c = u8[i];
    if (c === 10 || c === 13 || (c >= 32 && c < 127)) s += String.fromCharCode(c);
    else if (s.length > 40) break;
    else s = "";
  }
  return s.trim();
}

async function inflate(data) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function readZip(u8) {
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const files = [];
  let i = 0;
  while (i + 30 < u8.length && view.getUint32(i, true) === 0x04034b50 && files.length < 400) {
    const method = view.getUint16(i + 8, true);
    const compSize = view.getUint32(i + 18, true);
    const nameLen = view.getUint16(i + 26, true);
    const extraLen = view.getUint16(i + 28, true);
    const nameStart = i + 30;
    const name = new TextDecoder().decode(u8.slice(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    files.push({ name, method, off: i, data: u8.slice(dataStart, dataStart + compSize) });
    i = dataStart + compSize;
  }
  return files;
}

function bitmapAt(u8, off) {
  if (off < 0 || off + 20 > u8.length || u8[off] !== 0x42 || u8[off + 1] !== 0x4d) return null;
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const size = view.getUint32(off + 2, true);
  const header = view.getUint32(off + 14, true);
  if (size < 54 || size > 8000000 || off + size > u8.length) return null;
  if (header !== 12 && header !== 40 && header !== 108 && header !== 124) return null;
  return u8.slice(off, off + size);
}

function pictureURL(book, shape) {
  let data = shape.data || shape.src || "";
  if (typeof data === "string" && data.startsWith("#")) data = (book.images || [])[Number(data.slice(1))] || "";
  if (typeof data !== "string" || data.length < 32) return "";
  if (data.startsWith("data:")) return data;
  const kind = data.startsWith("iVBOR") ? "png" : data.startsWith("/9j/") ? "jpeg" : "bmp";
  return "data:image/" + kind + ";base64," + data;
}

function item(kind, title, paragraphs, extra) {
  return Object.assign({ kind, title, paragraphs: paragraphs || [] }, extra || {});
}

async function describe(name, u8) {
  const head = new TextDecoder().decode(u8.slice(0, 4));
  const lower = name.toLowerCase();
  if (head === "FBK1" || head === "FSK1" || head === "FSC1") return describeFoolbook(name, u8, head);
  if (u8[0] === 0x7b || u8[0] === 0x5b) return describeFoolbook(name, u8, "JSON");
  if (u8[0] === 0x50 && u8[1] === 0x4b) return describeZip(name, u8, lower);
  return describeToolbook(name, u8, lower);
}

async function describeFoolbook(name, u8, head) {
  let payload = u8;
  let note = "This file is already the book, written as JSON.";
  if (head !== "JSON") {
    const which = head === "FSK1" ? "Foolbook system book" : head === "FSC1" ? "Foolbook course" : "Foolbook book";
    note = "This is a " + which + ". The first four bytes are " + head + ". The next byte says whether the rest is compressed. The rest is the book.";
    if (u8[4] & 1) {
      payload = await inflate(u8.slice(7, u8.length - 4));
    } else payload = u8.slice(5);
  }
  let book;
  try {
    book = JSON.parse(new TextDecoder().decode(payload));
  } catch (err) {
    return { about: item("File", name, ["The header says this is a Foolbook file, but the book inside did not read.", err.message]) };
  }
  const pages = book.pages || [];
  const groups = { Page: [], Bitmap: [], Script: [], Object: [] };
  pages.forEach((page) => {
    const shapes = page.shapes || [];
    groups.Page.push(item("Page", page.id || "Page", [
      "This is a page in the book.",
      page.text && page.text.length ? page.text.join(" ") : "This page has no text of its own.",
    ], { text: JSON.stringify({ id: page.id, text: page.text, items: page.items }, null, 2).slice(0, 4000) }));
    shapes.forEach((shape, index) => {
      const kind = (shape.kind || "object").toLowerCase();
      const label = shape.name || shape.text || kind;
      const url = pictureURL(book, shape);
      if (url || kind === "image") {
        groups.Bitmap.push(item("Bitmap", "Bitmap on " + (page.id || "page") + " · " + label, [
          "This is a bitmap. It is a picture stored on the page, not a separate file.",
        ], { image: url }));
      }
      if (shape.script) {
        groups.Script.push(item("Script", "Script on " + (page.id || "page") + " · " + label, [
          "This is a script. It is the code attached to that object.",
        ], { text: String(shape.script) }));
      }
      if (kind !== "image") {
        const word = kind === "button" ? "Button" : kind === "text" ? "Text field" : kind.charAt(0).toUpperCase() + kind.slice(1);
        groups.Object.push(item("Object", word + " · " + String(label).slice(0, 42), [
          "This is an object on " + (page.id || "the page") + ". Its kind is " + kind + ".",
          url ? "It is drawn with a bitmap." : (shape.text ? "It says: " + shape.text : "It has no caption."),
        ]));
      }
    });
    if (!shapes.length) {
      (page.items || []).forEach((entry) => {
        groups.Object.push(item("Object", "Button · " + (entry.label || entry.page || "Go"), [
          "This is a button on " + (page.id || "the page") + ". The book stored the words and the button, not a picture.",
          "It goes to " + (entry.page || "the next page") + (entry.book ? " in " + entry.book : "") + ".",
        ]));
      });
    }
  });
  const about = item("File", book.title || name, [
    note,
    (book.title ? book.title + ". " : "") + pages.length + " pages.",
    groups.Bitmap.length + " bitmaps, " + groups.Script.length + " scripts, " + groups.Object.length + " other objects.",
  ]);
  return { about, groups };
}

async function describeZip(name, u8, lower) {
  const files = readZip(u8);
  const system = lower.endsWith(".sbkx") || lower.includes("sbk");
  const about = item("File", name, [
    "This is a " + (system ? "ToolBook system book" : "ToolBook book") + " stored as a zip.",
    "Book.xml is the book. A file whose name ends in .script is OpenScript, the code. A picture file is a bitmap.",
    files.length + " files in the zip.",
  ]);
  const groups = { Page: [], Bitmap: [], Script: [], Object: [] };
  for (const file of files) {
    if (!file.name || file.name.endsWith("/")) continue;
    let body = file.data;
    if (file.method === 8 && file.data.length && file.data.length < 1500000) {
      try { body = await inflate(file.data); } catch (err) { body = file.data; }
    }
    const base = file.name.split("/").pop();
    const low = base.toLowerCase();
    if (low.endsWith(".script")) {
      groups.Script.push(item("Script", base, [
        "This is a script. OpenScript is the code ToolBook runs for this book.",
      ], { text: new TextDecoder().decode(body).slice(0, 8000) }));
    } else if (/\.(png|gif|jpg|jpeg|bmp)$/i.test(low)) {
      const type = low.endsWith(".png") ? "image/png" : low.endsWith(".gif") ? "image/gif" : low.endsWith(".bmp") ? "image/bmp" : "image/jpeg";
      groups.Bitmap.push(item("Bitmap", base, [
        "This is a bitmap. It is a picture file inside the book.",
      ], { image: URL.createObjectURL(new Blob([body], { type })) }));
    } else if (low === "book.xml" || low.endsWith(".xml")) {
      groups.Page.push(item(low === "book.xml" ? "Page" : "Object", base, [
        low === "book.xml" ? "This is the book. The pages and objects are described in this XML." : "This is another XML file in the book.",
      ], { text: new TextDecoder().decode(body).slice(0, 5000) }));
    } else {
      groups.Object.push(item("Object", base, [
        "This is a file inside the book. It is not a script and not a bitmap.",
      ]));
    }
  }
  return { about, groups };
}

function describeToolbook(name, u8, lower) {
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const bookAt = u8.length >= 0xc04 && view.getUint32(0xc00, true) === 0x22222222;
  const system = lower.endsWith(".sbk") || lower.endsWith(".fsk");
  const namedFbk = lower.endsWith(".fbk") || lower.endsWith(".fsk");
  const paragraphs = [];
  if (bookAt) {
    paragraphs.push("This is a ToolBook " + (system ? "system book" : "lesson book") + (namedFbk ? ". The file name looks like Foolbook, but the bytes are ToolBook." : "."));
    paragraphs.push("The first part is a small Windows program, the stub that used to launch ToolBook. The book itself starts at byte 3072, which is hex C00.");
  } else if (u8[0] === 0x4d && u8[1] === 0x5a) {
    paragraphs.push("This is a Windows program. It does not have the ToolBook book mark at hex C00, so it is not a book this page knows.");
  } else {
    paragraphs.push("This file is not a Foolbook book and not a zip. If it is ToolBook, the pages and bitmaps below are what could be named.");
  }
  const groups = { Page: [], Bitmap: [], Script: [], Object: [] };
  const jbo = findSeq(u8, [0x03, 0x4a, 0x42, 0x4f], 0);
  if (jbo >= 0) {
    groups.Object.push(item("Object", "Object store", [
      "This is the object store. ToolBook keeps the objects here. The four bytes 03 4A 42 4F read as JBO.",
      "A page, a button, a field, and a picture are objects. The list below separates the ones this page can name.",
    ], { hex: u8.slice(jbo, jbo + 256), where: jbo }));
  }
  const marks = [[0x80, 0x65, 0x00, 0x05, 0x00, 0x02, 0x02, "Page"], [0x81, 0x65, 0x00, 0x05, 0x00, 0x02, 0x02, "Nested page"]];
  for (let i = 0; i + 16 < u8.length && groups.Page.length < 500; i++) {
    for (const mark of marks) {
      if (u8[i] !== mark[0]) continue;
      let ok = true;
      for (let k = 1; k < 7; k++) if (u8[i + k] !== mark[k]) ok = false;
      if (!ok || !cstr(u8, i + 7, 32).startsWith("P")) continue;
      const pageName = cstr(u8, i + 7, 32);
      groups.Page.push(item("Page", pageName, [
        "This is a " + mark[7].toLowerCase() + ". The bytes 80 65, or 81 65 for a nested page, are the mark ToolBook writes in front of the page name.",
      ], { hex: u8.slice(i, i + 64), where: i }));
    }
  }
  let from = 0;
  while (groups.Script.length < 60) {
    const at = findSeq(u8, [0x74, 0x6f, 0x20, 0x68, 0x61, 0x6e, 0x64, 0x6c, 0x65], from);
    if (at < 0) break;
    const text = asciiRun(u8, Math.max(0, at - 12), 2500);
    if (text.toLowerCase().includes("to handle")) {
      groups.Script.push(item("Script", "Script at " + at.toString(16), [
        "This is a script. The words “to handle” are how an OpenScript handler starts.",
      ], { text: text.slice(0, 2500), where: at }));
    }
    from = at + 9;
  }
  let bm = 0;
  while (groups.Bitmap.length < 40) {
    const at = u8.indexOf(0x42, bm);
    if (at < 0) break;
    const bytes = bitmapAt(u8, at);
    if (bytes) {
      groups.Bitmap.push(item("Bitmap", "Bitmap at " + at.toString(16), [
        "This is a bitmap. The letters BM are the start of a Windows bitmap.",
        bytes.length.toLocaleString() + " bytes.",
      ], { image: URL.createObjectURL(new Blob([bytes], { type: "image/bmp" })), where: at }));
      bm = at + bytes.length;
    } else bm = at + 1;
  }
  let textAt = 0;
  let texts = 0;
  while (texts < 30) {
    const at = findSeq(u8, [0x54, 0x65, 0x78, 0x74, 0, 0], textAt);
    if (at < 0) break;
    groups.Object.push(item("Object", "Text field at " + at.toString(16), [
      "This is a text field. The bytes spell Text and then two zeros. The words of the field are stored with that mark.",
    ], { hex: u8.slice(at, at + 64), where: at }));
    texts += 1;
    textAt = at + 6;
  }
  paragraphs.push(groups.Page.length + " pages, " + groups.Bitmap.length + " bitmaps, " + groups.Script.length + " scripts.");
  if (groups.Page.length >= 500) paragraphs.push("The page list stops at 500.");
  return { about: item("File", name, paragraphs), groups };
}

function show(entry) {
  current = entry;
  detail.replaceChildren();
  const kind = document.createElement("p");
  kind.className = "kind";
  kind.textContent = entry.kind;
  const h = document.createElement("h2");
  h.textContent = entry.title;
  detail.append(kind, h);
  (entry.paragraphs || []).forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    detail.appendChild(p);
  });
  if (entry.image) {
    const img = document.createElement("img");
    img.className = "preview";
    img.alt = entry.title;
    img.src = entry.image;
    detail.appendChild(img);
  }
  if (entry.text) {
    const pre = document.createElement("pre");
    pre.textContent = entry.text;
    detail.appendChild(pre);
  }
  if (entry.hex) {
    const p = document.createElement("p");
    p.textContent = entry.where != null ? "Bytes at " + entry.where.toString(16) + "." : "Bytes.";
    const pre = document.createElement("pre");
    pre.className = "hex";
    pre.textContent = hexBytes(entry.hex, 256);
    detail.append(p, pre);
  }
  list.querySelectorAll("button").forEach((button) => button.classList.toggle("on", button._entry === entry));
}

function render(report) {
  list.replaceChildren();
  const order = [["This file", [report.about]], ["Pages", report.groups.Page], ["Bitmaps", report.groups.Bitmap], ["Scripts", report.groups.Script], ["Objects", report.groups.Object]];
  order.forEach(([label, entries]) => {
    if (!entries || !entries.length) return;
    const h = document.createElement("h2");
    h.textContent = label;
    list.appendChild(h);
    entries.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button._entry = entry;
      const name = document.createElement("span");
      name.textContent = entry.title;
      const small = document.createElement("small");
      small.textContent = entry.kind;
      button.append(name, small);
      button.addEventListener("click", () => show(entry));
      list.appendChild(button);
    });
  });
  show(report.about);
}

function welcome() {
  list.replaceChildren();
  detail.replaceChildren();
  const kind = document.createElement("p");
  kind.className = "kind";
  kind.textContent = "Byte Viewer";
  const h = document.createElement("h2");
  h.textContent = "What is in a book file";
  const lines = [
    "Open a file and this page names the parts. A bitmap is a picture. An object is a page, a button, a field, or a drawing. A script is the code.",
    "A ToolBook lesson is a .tbk. A ToolBook system book is a .sbk. The file starts with a small Windows program. The book starts later, at hex C00. Pages, bitmaps, and scripts are inside that book.",
    "A ToolBook XML book is a .tbkx or a .sbkx. It is a zip. Book.xml describes the book. A .script file is OpenScript.",
    "A Foolbook book is a .fbk. A Foolbook system book is a .fsk. Those are a short header and the book. A picture on a page is a bitmap. Code attached to an object is a script.",
    "If a file is named .fbk but the bytes are ToolBook, it is read as ToolBook.",
  ];
  detail.append(kind, h);
  lines.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    detail.appendChild(p);
  });
  const samples = document.createElement("div");
  samples.className = "samples";
  const sample = document.createElement("button");
  sample.type = "button";
  sample.textContent = "Open the First Light sample";
  sample.addEventListener("click", () => openURL("first_light.fbk", "https://raw.githubusercontent.com/squirelworks/Foolbook/main/_books/first_light/first_light.fbk"));
  samples.appendChild(sample);
  detail.appendChild(samples);
}

async function openBytes(name, bytes) {
  status.textContent = "Reading " + name + "…";
  try {
    const report = await describe(name, bytes);
    status.textContent = "";
    render(report);
  } catch (err) {
    status.textContent = name + " did not read. " + err.message;
  }
}

async function openURL(name, url) {
  status.textContent = "Opening " + name + "…";
  const res = await fetch(url);
  if (!res.ok) {
    status.textContent = name + " did not open.";
    return;
  }
  openBytes(name, new Uint8Array(await res.arrayBuffer()));
}

document.getElementById("open").addEventListener("click", () => document.getElementById("file").click());
document.getElementById("file").addEventListener("change", () => {
  const file = document.getElementById("file").files[0];
  if (!file) return;
  file.arrayBuffer().then((buf) => openBytes(file.name, new Uint8Array(buf)));
});
document.body.addEventListener("dragover", (ev) => ev.preventDefault());
document.body.addEventListener("drop", (ev) => {
  ev.preventDefault();
  const file = ev.dataTransfer.files[0];
  if (file) file.arrayBuffer().then((buf) => openBytes(file.name, new Uint8Array(buf)));
});

welcome();
