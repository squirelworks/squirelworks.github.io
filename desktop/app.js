"use strict";

const ICONS = [
  { id: "nida", name: "NIDA ATT", x: 16, y: 16, color: "#000080" },
  { id: "foolcourse", name: "Foolcourse", x: 16, y: 96, color: "#800000" },
  { id: "foolbook", name: "Foolbook", x: 16, y: 176, color: "#008000" },
  { id: "bytes", name: "Byte Viewer", x: 16, y: 256, color: "#808000" },
  { id: "old", name: "Old viewers", x: 16, y: 336, color: "#404040" },
];

const desk = document.getElementById("desk");
const menu = document.getElementById("menu");
const tasks = document.getElementById("tasks");
let catalog = null;
let z = 3;
const windows = new Map();

function glyph(color) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 32 32");
  s.setAttribute("class", "glyph");
  s.innerHTML =
    `<rect x="4" y="6" width="24" height="20" fill="${color}" stroke="#fff" stroke-width="2"/>` +
    `<rect x="4" y="6" width="24" height="5" fill="#000080"/>` +
    `<rect x="8" y="14" width="16" height="2" fill="#fff"/>` +
    `<rect x="8" y="18" width="10" height="2" fill="#fff"/>`;
  return s;
}

function clock() {
  const d = new Date();
  document.getElementById("clock").textContent = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
clock();
setInterval(clock, 10000);

function placeIcons() {
  const narrow = window.innerWidth < 700;
  ICONS.forEach((icon, i) => {
    const el = document.createElement("div");
    el.className = "icon";
    el.tabIndex = 0;
    if (narrow) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      el.style.left = 12 + col * 96 + "px";
      el.style.top = 12 + row * 84 + "px";
    } else {
      el.style.left = icon.x + "px";
      el.style.top = icon.y + "px";
    }
    el.appendChild(glyph(icon.color));
    const label = document.createElement("span");
    label.textContent = icon.name;
    el.appendChild(label);
    el.addEventListener("click", () => selectIcon(el));
    el.addEventListener("dblclick", () => openIcon(icon.id));
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") openIcon(icon.id);
    });
    let tapped = 0;
    el.addEventListener("pointerup", () => {
      const now = Date.now();
      if (now - tapped < 400) openIcon(icon.id);
      tapped = now;
    });
    desk.appendChild(el);
  });
}

function selectIcon(el) {
  desk.querySelectorAll(".icon").forEach((n) => n.classList.remove("selected"));
  el.classList.add("selected");
}

function openIcon(id) {
  if (id === "old") {
    location.href = "coursemanager/index.html";
    return;
  }
  if (id === "nida") openNida();
  if (id === "foolcourse") openFoolcourse();
  if (id === "foolbook") openFoolbook();
  if (id === "bytes") openBytes();
}

function windowFrame(key, title) {
  if (windows.has(key)) {
    focusWin(windows.get(key));
    return windows.get(key);
  }
  const win = document.createElement("section");
  win.className = "window";
  win.style.left = (24 + windows.size * 16) + "px";
  win.style.top = (24 + windows.size * 16) + "px";
  win.style.width = "640px";
  win.style.height = "420px";
  const bar = document.createElement("div");
  bar.className = "title";
  const name = document.createElement("div");
  name.className = "grow";
  name.textContent = title;
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "×";
  close.addEventListener("click", () => closeWin(key));
  bar.append(name, close);
  const body = document.createElement("div");
  body.className = "body";
  win.append(bar, body);
  desk.appendChild(win);
  windows.set(key, win);
  focusWin(win);
  drag(win, bar);
  const task = document.createElement("button");
  task.className = "task on";
  task.type = "button";
  task.textContent = title;
  task.addEventListener("click", () => {
    if (win.style.display === "none") {
      win.style.display = "flex";
      focusWin(win);
    } else if (win === topWin()) {
      win.style.display = "none";
      task.classList.remove("on");
    } else {
      focusWin(win);
    }
  });
  win._task = task;
  tasks.appendChild(task);
  win.addEventListener("pointerdown", () => focusWin(win));
  return win;
}

function topWin() {
  let best = null;
  let bestZ = 0;
  windows.forEach((win) => {
    const n = Number(win.style.zIndex) || 0;
    if (n >= bestZ && win.style.display !== "none") {
      bestZ = n;
      best = win;
    }
  });
  return best;
}

function focusWin(win) {
  z += 1;
  win.style.zIndex = String(z);
  win.style.display = "flex";
  windows.forEach((other) => other._task.classList.toggle("on", other === win && other.style.display !== "none"));
}

function closeWin(key) {
  const win = windows.get(key);
  if (!win) return;
  win.remove();
  win._task.remove();
  windows.delete(key);
}

function drag(win, bar) {
  let dx = 0;
  let dy = 0;
  bar.addEventListener("pointerdown", (ev) => {
    if (ev.target.tagName === "BUTTON" || window.innerWidth < 700) return;
    dx = ev.clientX - win.offsetLeft;
    dy = ev.clientY - win.offsetTop;
    bar.setPointerCapture(ev.pointerId);
  });
  bar.addEventListener("pointermove", (ev) => {
    if (!bar.hasPointerCapture(ev.pointerId)) return;
    win.style.left = Math.max(0, ev.clientX - dx) + "px";
    win.style.top = Math.max(0, ev.clientY - dy) + "px";
  });
}

function btn(label, on) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.addEventListener("click", on);
  return b;
}

function openNida() {
  const win = windowFrame("nida", "NIDA ATT");
  const body = win.querySelector(".body");
  body.replaceChildren();
  body.style.padding = "0";
  const split = document.createElement("div");
  split.className = "split";
  const tree = document.createElement("div");
  tree.className = "tree";
  const detail = document.createElement("div");
  detail.className = "detail";
  split.append(tree, detail);
  body.appendChild(split);
  const modes = document.createElement("div");
  modes.append(
    btn("ATT master", () => showMaster()),
    btn("Programs", () => showCounts(catalog.nida.programs, "program")),
    btn("Ratings", () => showCounts(catalog.nida.ratings, "rating")),
  );
  tree.appendChild(modes);
  const list = document.createElement("div");
  tree.appendChild(list);

  function showMaster() {
    list.replaceChildren();
    catalog.nida.subjects.forEach((subject) => {
      list.appendChild(btn(subject.title, () => {
        list.querySelectorAll(".sub").forEach((n) => n.remove());
        const box = document.createElement("div");
        box.className = "sub";
        subject.modules.forEach((mod) => {
          box.appendChild(btn(mod.title, () => {
            detail.replaceChildren();
            const h = document.createElement("h1");
            h.textContent = mod.title;
            const p = document.createElement("p");
            p.className = "note";
            p.textContent = subject.title + ". " + mod.courses.length + " courses. The books are in the NIDA_ATT release. This site lists them. It does not host the files.";
            detail.append(h, p);
            mod.courses.forEach((course) => {
              const row = document.createElement("div");
              row.textContent = course.title + "  (" + course.id + ")";
              detail.appendChild(row);
            });
          }));
        });
        list.appendChild(box);
      }));
    });
    detail.replaceChildren();
    const h = document.createElement("h1");
    h.textContent = "NIDA ATT";
    const p = document.createElement("p");
    p.className = "note";
    p.textContent = catalog.nida.lessons + " lessons on the ATT master. Pick a subject, then a module.";
    detail.append(h, p);
  }

  function showCounts(rows, word) {
    list.replaceChildren();
    detail.replaceChildren();
    const h = document.createElement("h1");
    h.textContent = word === "program" ? "Programs" : "Ratings";
    const p = document.createElement("p");
    p.className = "note";
    p.textContent = "These are the groupings the NIDA disk used. The ATT master is the consolidated list.";
    detail.append(h, p);
    rows.forEach((row) => {
      const line = document.createElement("div");
      line.textContent = row.name + "  (" + row.lessons + ")";
      detail.appendChild(line);
    });
  }
  showMaster();
}

function bookView(book) {
  const wrap = document.createElement("div");
  const h = document.createElement("h1");
  h.textContent = book.title;
  const p = document.createElement("p");
  p.className = "note";
  p.textContent = book.subject + " / " + book.module + "  ·  " + book.file + "  ·  " + book.pages.length + " pages";
  const pages = document.createElement("div");
  pages.className = "pages";
  const read = document.createElement("div");
  book.pages.forEach((page, i) => {
    pages.appendChild(btn(page.id + "  " + (page.lines[0] || ""), () => {
      pages.querySelectorAll("button").forEach((n) => n.classList.remove("on"));
      pages.children[i].classList.add("on");
      read.replaceChildren();
      page.lines.forEach((line) => {
        const para = document.createElement("p");
        para.textContent = line;
        read.appendChild(para);
      });
    }));
  });
  wrap.append(h, p, pages, read);
  if (book.pages[0]) pages.children[0].click();
  return wrap;
}

function openFoolcourse() {
  const win = windowFrame("foolcourse", "Foolcourse");
  const body = win.querySelector(".body");
  body.replaceChildren();
  body.style.padding = "0";
  const split = document.createElement("div");
  split.className = "split";
  const tree = document.createElement("div");
  tree.className = "tree";
  const detail = document.createElement("div");
  detail.className = "detail";
  const groups = [
    { subject: "Money", module: "Filing taxes", ids: ["file_2026", "find_current"] },
    { subject: "Getting around", module: "Street sense", ids: ["phone"] },
  ];
  groups.forEach((group) => {
    tree.appendChild(btn(group.subject + " / " + group.module, () => {
      const box = document.createElement("div");
      box.className = "sub";
      group.ids.forEach((id) => {
        const book = catalog.books.find((item) => item.id === id);
        box.appendChild(btn(book.title, () => {
          detail.replaceChildren(bookView(book));
        }));
      });
      tree.querySelectorAll(".sub").forEach((n) => n.remove());
      tree.appendChild(box);
    }));
  });
  const intro = document.createElement("div");
  const h = document.createElement("h1");
  h.textContent = "Foolcourse";
  const p = document.createElement("p");
  p.className = "note";
  p.textContent = "The general catalog. Two sample courses ship with it. Open a lesson to read the pages.";
  intro.append(h, p);
  detail.appendChild(intro);
  split.append(tree, detail);
  body.appendChild(split);
}

function openFoolbook() {
  const win = windowFrame("foolbook", "Foolbook");
  const body = win.querySelector(".body");
  body.replaceChildren();
  const h = document.createElement("h1");
  h.textContent = "Foolbook";
  const p = document.createElement("p");
  p.className = "note";
  p.textContent = "The reader. It opens a ToolBook file by what is inside it, and a Foolbook file by the FBK1 or FSK1 envelope. A ToolBook renamed to .fbk is still a ToolBook. These sample books are Foolbook files.";
  body.append(h, p);
  catalog.books.forEach((book) => {
    body.appendChild(btn(book.title + " (" + book.file + ")", () => {
      const old = body.querySelector(".read");
      if (old) old.remove();
      const read = bookView(book);
      read.className = "read";
      body.appendChild(read);
    }));
  });
}

function openBytes() {
  const win = windowFrame("bytes", "Byte Viewer");
  const body = win.querySelector(".body");
  body.replaceChildren();
  const drop = document.createElement("div");
  drop.id = "drop";
  drop.textContent = "Drop a .tbk, .sbk, .xml, .zip, .fbk, .fsk, or .fsc here, or choose a file.";
  const pick = document.createElement("input");
  pick.type = "file";
  const sample = btn("Sample FBK", async () => {
    const json = JSON.stringify({ fbk: 1, foolbook: "sample", title: "Sample", pages: [{ id: "P0", text: ["A Foolbook envelope."] }] });
    const payload = new TextEncoder().encode(json);
    const bytes = new Uint8Array(5 + payload.length);
    bytes.set(new TextEncoder().encode("FBK1"));
    bytes[4] = 0;
    bytes.set(payload, 5);
    showBytes("sample.fbk", bytes.buffer);
  });
  const out = document.createElement("pre");
  out.className = "region";
  drop.addEventListener("dragover", (ev) => ev.preventDefault());
  drop.addEventListener("drop", (ev) => {
    ev.preventDefault();
    const file = ev.dataTransfer.files[0];
    if (file) readFile(file);
  });
  pick.addEventListener("change", () => {
    if (pick.files[0]) readFile(pick.files[0]);
  });
  body.append(drop, pick, sample, out);

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = () => showBytes(file.name, reader.result);
    reader.readAsArrayBuffer(file);
  }

  async function showBytes(name, buffer) {
    out.textContent = "Reading " + name + "…";
    try {
      const text = await describe(name, buffer);
      out.textContent = text;
    } catch (err) {
      out.textContent = "Could not read " + name + ".\n" + err.message;
    }
  }
}

function hex(u8, n) {
  return [...u8.slice(0, n)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

function cstr(u8, off, n) {
  let s = "";
  for (let i = 0; i < n && off + i < u8.length; i++) {
    const c = u8[off + i];
    if (c === 0 || c < 32 || c > 126) break;
    s += String.fromCharCode(c);
  }
  return s;
}

async function describe(name, buffer) {
  const u8 = new Uint8Array(buffer);
  const lower = name.toLowerCase();
  const head = new TextDecoder().decode(u8.slice(0, 4));
  if (head === "FBK1" || head === "FSK1" || head === "FSC1" || u8[0] === 0x7b || u8[0] === 0x5b) {
    return await describeFool(name, u8);
  }
  if (u8[0] === 0x50 && u8[1] === 0x4b) return describeZip(name, u8);
  if (lower.endsWith(".xml") || head.trim().startsWith("<")) return describeXml(name, new TextDecoder().decode(u8));
  return describeToolbook(name, u8);
}

async function describeFool(name, u8) {
  const lines = [];
  lines.push(name + "  " + u8.length + " bytes");
  if (u8[0] === 0x7b || u8[0] === 0x5b) {
    lines.push("00000000  plain JSON. Older Foolbook writing, not an envelope.");
    return lines.concat(summarizeBook(JSON.parse(new TextDecoder().decode(u8)))).join("\n");
  }
  const magic = new TextDecoder().decode(u8.slice(0, 4));
  const flags = u8[4];
  const kind = magic === "FSK1" ? "system book" : magic === "FSC1" ? "course file" : "book";
  lines.push("00000000  4  " + magic + "  Foolbook " + kind + " envelope");
  lines.push("00000004  1  flags " + flags.toString(16).padStart(2, "0") + (flags & 1 ? "  bit 0: zlib payload" : "  payload is plain JSON"));
  lines.push("00000005  " + (u8.length - 5) + "  payload");
  let payload = u8.slice(5);
  if (flags & 1) payload = await inflateZlib(payload);
  const book = JSON.parse(new TextDecoder().decode(payload));
  lines.push("");
  lines.push.apply(lines, summarizeBook(book));
  return lines.join("\n");
}

function summarizeBook(book) {
  const lines = [];
  if (book.fbk != null) lines.push("fbk version " + book.fbk);
  if (book.foolbook) lines.push("written for Foolbook " + book.foolbook);
  if (book.title) lines.push("title  " + book.title);
  const pages = book.pages || [];
  lines.push(pages.length + " pages");
  pages.slice(0, 40).forEach((page) => {
    let pictures = 0;
    (page.shapes || []).forEach((shape) => {
      if (shape && (shape.data || shape.src)) pictures += 1;
    });
    const first = ((page.shapes || []).find((shape) => shape && shape.kind === "text" && shape.text) || {}).text || "";
    lines.push("  " + (page.id || "?") + "  " + String(first).split("\n")[0] + (pictures ? "  pictures " + pictures : ""));
  });
  if (pages.length > 40) lines.push("  … " + (pages.length - 40) + " more pages");
  return lines;
}

async function inflateZlib(bytes) {
  const raw = bytes.slice(2, Math.max(2, bytes.length - 4));
  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function describeToolbook(name, u8) {
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const lines = [];
  const lower = name.toLowerCase();
  const system = lower.endsWith(".sbk") || lower.endsWith(".sbkx");
  lines.push(name + "  " + u8.length + " bytes");
  lines.push(system ? "System book. Same shell as a lesson book." : "Lesson book, if the bytes say so.");
  const at = 0xc00;
  let magicAt = -1;
  if (u8.length >= at + 4 && view.getUint32(at, true) === 0x22222222) magicAt = at;
  else {
    for (let i = 0; i + 4 <= u8.length && i < 0x2000; i++) {
      if (view.getUint32(i, true) === 0x22222222) { magicAt = i; break; }
    }
  }
  if (magicAt < 0 && u8.indexOf(3) < 0) {
    lines.push("No ToolBook book mark (22 22 22 22) in the first 8 KB.");
    lines.push("First 16 bytes  " + hex(u8, 16));
    return lines.join("\n");
  }
  if (magicAt === 0xc00) {
    lines.push("00000000  3072  shell stub. The book object starts after it.");
    lines.push("00000C00  4  22 22 22 22  book mark. The notes call this ZZZTBKBOOKLOC.");
  } else if (magicAt >= 0) {
    lines.push(magicAt.toString(16).padStart(8, "0") + "  4  22 22 22 22  book mark, not at 0xC00.");
  }
  const store = findBytes(u8, [0x03, 0x4a, 0x42, 0x4f]);
  if (store >= 0 && store < 0x1000) {
    lines.push(store.toString(16).padStart(8, "0") + "  object store. The bytes are 03 4A 42 4F, read as JBO.");
  }
  const marks = [
    [0x80, 0x65, 0x00, 0x05, 0x00, 0x02, 0x02],
    [0x81, 0x65, 0x00, 0x05, 0x00, 0x02, 0x02],
  ];
  const pages = [];
  for (let i = 0; i + 7 < u8.length; i++) {
    const nested = u8[i] === 0x81;
    const mark = nested ? marks[1] : marks[0];
    if (u8[i] !== mark[0]) continue;
    let ok = true;
    for (let k = 1; k < mark.length; k++) if (u8[i + k] !== mark[k]) ok = false;
    if (!ok) continue;
    const id = cstr(u8, i + 7, 32);
    if (id.startsWith("P")) pages.push({ at: i, id, nested });
    if (pages.length > 400) break;
  }
  lines.push(pages.length + " page marks (80 65 is a page, 81 65 is a nested page).");
  pages.slice(0, 60).forEach((page) => {
    lines.push("  " + page.at.toString(16).padStart(8, "0") + "  " + page.id + (page.nested ? "  nested" : ""));
  });
  if (pages.length > 60) lines.push("  … " + (pages.length - 60) + " more");
  lines.push("First 16 bytes  " + hex(u8, 16));
  return lines.join("\n");
}

function findBytes(u8, seq) {
  outer: for (let i = 0; i + seq.length <= u8.length; i++) {
    for (let k = 0; k < seq.length; k++) if (u8[i + k] !== seq[k]) continue outer;
    return i;
  }
  return -1;
}

async function describeZip(name, u8) {
  const files = unzipList(u8);
  const lines = [];
  lines.push(name + "  zip  " + files.length + " files");
  lines.push("A TBKX or SBKX export is a folder, often zipped. Book.xml is the book. Page XML and .script files sit beside it.");
  files.forEach((file) => lines.push("  " + file.name + "  " + file.size + " bytes  method " + file.method));
  const book = files.find((file) => file.name.toLowerCase().endsWith("book.xml"));
  if (book && book.raw && !book.data) {
    const stream = new Blob([book.raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    book.data = new Uint8Array(await new Response(stream).arrayBuffer());
  }
  if (book && book.data) {
    lines.push("");
    lines.push(describeXml(book.name, new TextDecoder().decode(book.data)));
  } else if (!files.some((file) => file.data || file.raw)) {
    lines.push("This zip stores sizes in a data descriptor. Drop Book.xml itself.");
  }
  return lines.join("\n");
}

function unzipList(u8) {
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const files = [];
  let i = 0;
  while (i + 30 < u8.length && view.getUint32(i, true) === 0x04034b50 && files.length < 200) {
    const flags = view.getUint16(i + 6, true);
    const method = view.getUint16(i + 8, true);
    let compSize = view.getUint32(i + 18, true);
    const nameLen = view.getUint16(i + 26, true);
    const extraLen = view.getUint16(i + 28, true);
    const name = new TextDecoder().decode(u8.slice(i + 30, i + 30 + nameLen));
    const start = i + 30 + nameLen + extraLen;
    if (flags & 8 || compSize === 0) {
      files.push({ name, method, size: 0, data: null });
      break;
    }
    const slice = u8.slice(start, start + compSize);
    let data = null;
    if (method === 0) data = slice;
    files.push({ name, method, size: compSize, data, raw: method === 8 ? slice : null });
    i = start + compSize;
  }
  return files;
}

function describeXml(name, text) {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const lines = [];
  lines.push(name);
  if (doc.querySelector("parsererror")) {
    lines.push("Not XML this viewer can read.");
    return lines.join("\n");
  }
  const all = doc.getElementsByTagName("*");
  const counts = {};
  for (const el of all) {
    const tag = el.localName;
    counts[tag] = (counts[tag] || 0) + 1;
  }
  lines.push("Tags  " + Object.entries(counts).map(([k, v]) => k + " " + v).join(", "));
  const pages = [...all].filter((el) => el.localName === "Page" || el.localName === "Background");
  pages.slice(0, 40).forEach((el) => {
    const id = el.getAttribute("Name") || el.getAttribute("Id") || el.getAttribute("IdNumber") || "";
    const objects = [...el.children].filter((child) => child.localName === "Objects").length;
    lines.push("  " + el.localName + "  " + id + (objects ? "  has objects" : ""));
  });
  if (pages.length > 40) lines.push("  … " + (pages.length - 40) + " more");
  const scripts = (text.match(/\.script/g) || []).length;
  if (scripts) lines.push(scripts + " mentions of a .script file. That is the OpenScript source for a page or an object.");
  return lines.join("\n");
}

document.getElementById("start").addEventListener("click", (ev) => {
  ev.stopPropagation();
  if (menu.style.display === "block") {
    menu.style.display = "none";
    return;
  }
  menu.replaceChildren();
  [["NIDA ATT", "nida"], ["Foolcourse", "foolcourse"], ["Foolbook", "foolbook"], ["Byte Viewer", "bytes"], ["Old viewers", "old"]].forEach(([label, id]) => {
    menu.appendChild(btn(label, () => {
      menu.style.display = "none";
      openIcon(id);
    }));
  });
  menu.style.display = "block";
});
document.addEventListener("pointerdown", (ev) => {
  if (!menu.contains(ev.target) && ev.target.id !== "start") menu.style.display = "none";
});

placeIcons();
window.addEventListener("resize", () => {
  desk.querySelectorAll(".icon").forEach((n) => n.remove());
  placeIcons();
});

fetch("desktop/catalog.json")
  .then((res) => res.json())
  .then((data) => { catalog = data; })
  .catch(() => { catalog = { nida: { lessons: 0, subjects: [], programs: [], ratings: [] }, books: [] }; });
