"use strict";

const ICONS = [
  { id: "nida", name: "NIDA ATT", x: 16, y: 12, color: "#000080" },
  { id: "foolcourse", name: "Foolcourse", x: 16, y: 88, color: "#800000" },
  { id: "foolbook", name: "Foolbook", x: 16, y: 164, color: "#008000" },
  { id: "editor", name: "Foolbook Editor", x: 16, y: 240, color: "#008080" },
  { id: "bytes", name: "Byte Viewer", x: 16, y: 316, color: "#808000" },
  { id: "repos", name: "Repositories", x: 108, y: 12, color: "#400080" },
  { id: "old", name: "Old viewers", x: 108, y: 88, color: "#404040" },
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
    const col = i % 4;
    const row = Math.floor(i / 4);
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
    el.addEventListener("click", () => openIcon(icon.id));
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
    location.href = "coursemanager/viewer4/viewer.html";
    return;
  }
  if (id === "nida") openNida();
  if (id === "foolcourse") openFoolcourse();
  if (id === "foolbook") {
    location.href = "foolbook/";
    return;
  }
  if (id === "editor") openEditor();
  if (id === "bytes") openBytes();
  if (id === "repos") {
    location.href = "repos/";
    return;
  }
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
            p.textContent = subject.title + ". " + mod.courses.length + " courses, from NIDA_ATT/courses.";
            detail.append(h, p);
            mod.courses.forEach((course) => {
              detail.appendChild(btn(course.title, () => openRemote(detail, FoolReader.NIDA_RAW + "courses/" + course.file, course.file)));
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
    p.textContent = catalog.nida.lessons + " lessons. Pick a subject, then a module, then a course. The book is loaded from the NIDA_ATT course folder.";
    detail.append(h, p);
  }

  function showCounts(rows, word) {
    list.replaceChildren();
    detail.replaceChildren();
    const h = document.createElement("h1");
    h.textContent = word === "program" ? "Programs" : "Ratings";
    const p = document.createElement("p");
    p.className = "note";
    p.textContent = "The same lessons as the ATT master, in the grouping the NIDA disk used. Open a course from the master.";
    detail.append(h, p);
    rows.forEach((row) => {
      const line = document.createElement("div");
      line.textContent = row.name + "  (" + row.lessons + ")";
      detail.appendChild(line);
    });
    if (word === "program") {
      const shell = document.createElement("div");
      shell.className = "note";
      shell.textContent = "System books, from the NIDA_ATT root:";
      detail.appendChild(shell);
      ["nida81.fbk", "nc81base.fsk", "nc81recs.fsk", "nc81test.fsk", "nc81trnr.fsk", "NC81BANK.fsk"].forEach((file) => {
        detail.appendChild(btn(file, () => openRemote(detail, FoolReader.NIDA_RAW + file, file)));
      });
    }
  }
  showMaster();
}

async function openRemote(host, url, name) {
  host.replaceChildren();
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = "Loading " + name + "…";
  host.appendChild(note);
  try {
    const book = await FoolReader.fetchBook(url);
    window.FoolBook = { book, name };
    host.replaceChildren();
    FoolReader.mountReader(host, book, { onEdit: openEditor });
  } catch (err) {
    note.textContent = "Could not open " + name + ". " + err.message;
  }
}

const FOOL_BOOKS = [
  { title: "Filing taxes for 2026", path: "Money/Filing taxes/file_2026.fbk" },
  { title: "How to find up-to-date information", path: "Money/Filing taxes/find_current.fbk" },
  { title: "How to not walk while using your phone", path: "Getting around/Street sense/phone.fbk" },
];

function openFoolcourse() {
  const win = windowFrame("foolcourse", "Foolcourse");
  win.style.width = "780px";
  win.style.height = "520px";
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
    { name: "Money / Filing taxes", paths: FOOL_BOOKS.slice(0, 2) },
    { name: "Getting around / Street sense", paths: FOOL_BOOKS.slice(2) },
  ];
  groups.forEach((group) => {
    tree.appendChild(btn(group.name, () => {
      tree.querySelectorAll(".sub").forEach((n) => n.remove());
      const box = document.createElement("div");
      box.className = "sub";
      group.paths.forEach((item) => {
        box.appendChild(btn(item.title, () => openRemote(detail, FoolReader.COURSE_RAW + encodeURI(item.path), item.path.split("/").pop())));
      });
      tree.appendChild(box);
    }));
  });
  detail.appendChild(Object.assign(document.createElement("p"), { className: "note", textContent: "The Foolcourse books, from the Foolcourse repository. Open a lesson." }));
  split.append(tree, detail);
  body.appendChild(split);
}

function openFoolbook() {
  const win = windowFrame("foolbook", "Foolbook");
  win.style.width = "780px";
  win.style.height = "520px";
  const body = win.querySelector(".body");
  body.replaceChildren();
  body.style.padding = "0";
  const split = document.createElement("div");
  split.className = "split";
  const tree = document.createElement("div");
  tree.className = "tree";
  const detail = document.createElement("div");
  detail.className = "detail";
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = "Foolbook reads the file by its bytes. These three are Foolbook books. A ToolBook file renamed to .fbk is still opened as ToolBook in the desktop program. Edit hands the open book to Foolbook Editor.";
  tree.appendChild(note);
  FOOL_BOOKS.forEach((item) => {
    tree.appendChild(btn(item.title, () => openRemote(detail, FoolReader.COURSE_RAW + encodeURI(item.path), item.path.split("/").pop())));
  });
  const file = document.createElement("input");
  file.type = "file";
  file.addEventListener("change", async () => {
    if (!file.files[0]) return;
    const u8 = new Uint8Array(await file.files[0].arrayBuffer());
    const book = await FoolReader.unpackBytes(u8);
    window.FoolBook = { book, name: file.files[0].name };
    detail.replaceChildren();
    FoolReader.mountReader(detail, book, { onEdit: openEditor });
  });
  tree.appendChild(file);
  split.append(tree, detail);
  body.appendChild(split);
}

function openBytes() {
  const win = windowFrame("bytes", "Byte Viewer");
  win.style.width = "920px";
  win.style.height = "560px";
  const body = win.querySelector(".body");
  body.replaceChildren();
  body.style.padding = "0";
  const frame = document.createElement("iframe");
  frame.className = "full";
  frame.src = "byteviewer/index.html";
  body.appendChild(frame);
}

function openEditor() {
  const win = windowFrame("editor", "Foolbook Editor");
  win.style.width = "920px";
  win.style.height = "560px";
  const body = win.querySelector(".body");
  body.replaceChildren();
  body.style.padding = "0";
  const root = document.createElement("div");
  root.className = "editor";
  const side = document.createElement("div");
  side.className = "side";
  const mid = document.createElement("div");
  mid.className = "mid";
  const props = document.createElement("div");
  props.className = "props";
  root.append(side, mid, props);
  body.appendChild(root);
  const file = document.createElement("input");
  file.type = "file";
  const save = document.createElement("button");
  save.type = "button";
  save.textContent = "Download";
  side.append(file, save);
  let book = (window.FoolBook && window.FoolBook.book) || null;
  let pageIndex = 0;
  let shapeIndex = -1;

  function paintProps() {
    props.replaceChildren();
    if (!book) return;
    const page = book.pages[pageIndex];
    const shape = shapeIndex >= 0 ? page.shapes[shapeIndex] : null;
    const label = document.createElement("div");
    label.className = "note";
    label.textContent = shape ? (shape.kind + "  " + (shape.name || "")) : page.id + "  (page)";
    props.appendChild(label);
    const text = document.createElement("textarea");
    text.rows = 6;
    text.value = shape ? (shape.text || "") : "";
    const script = document.createElement("textarea");
    script.rows = 8;
    script.value = shape ? (shape.script || "") : ((page.handlers || []).map((h) => "to handle " + h.name + h.source).join("\n"));
    props.append("Text", text, "Script", script);
    text.addEventListener("input", () => {
      if (!shape) return;
      shape.text = text.value;
      draw();
    });
    script.addEventListener("input", () => {
      if (shape) shape.script = script.value;
    });
  }

  function draw() {
    const page = book.pages[pageIndex];
    FoolReader.drawPage(mid, book, page, (dest) => {
      const found = book.pages.findIndex((item) => String(item.id).toLowerCase() === dest.toLowerCase());
      if (found >= 0) {
        pageIndex = found;
        shapeIndex = -1;
        listPages();
        draw();
      }
    }, (index) => {
      shapeIndex = index;
      paintProps();
    });
    paintProps();
  }

  function listPages() {
    side.querySelectorAll("button.pg").forEach((n) => n.remove());
    book.pages.forEach((page, i) => {
      const b = btn(page.id, () => {
        pageIndex = i;
        shapeIndex = -1;
        draw();
      });
      b.className = "pg" + (i === pageIndex ? " on" : "");
      side.appendChild(b);
    });
  }

  function use(next) {
    book = next;
    pageIndex = 0;
    shapeIndex = -1;
    listPages();
    draw();
  }

  file.addEventListener("change", async () => {
    if (!file.files[0]) return;
    use(await FoolReader.unpackBytes(new Uint8Array(await file.files[0].arrayBuffer())));
    window.FoolBook = { book, name: file.files[0].name };
  });
  save.addEventListener("click", () => {
    if (!book) return;
    const copy = Object.assign({}, book);
    delete copy._magic;
    const payload = new TextEncoder().encode(JSON.stringify(copy));
    const out = new Uint8Array(5 + payload.length);
    const magic = (book._magic === "FSK1" || book._magic === "FSC1") ? book._magic : "FBK1";
    out.set(new TextEncoder().encode(magic));
    out.set(payload, 5);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([out]));
    a.download = (window.FoolBook && window.FoolBook.name) || "book.fbk";
    a.click();
  });
  if (book) use(book);
  else {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = "Open a book in NIDA ATT, Foolcourse, or Foolbook, then press Edit. Or choose a file here. Pages are on the left. The page is in the middle. The object and its script are on the right.";
    props.appendChild(note);
  }
}

function openRepos() {
  const win = windowFrame("repos", "Public repositories");
  win.style.width = "720px";
  win.style.height = "560px";
  const body = win.querySelector(".body");
  body.replaceChildren();
  body.style.padding = "0";
  body.style.overflow = "hidden";
  body.style.display = "flex";
  body.style.flexDirection = "column";
  const frame = document.createElement("iframe");
  frame.className = "full";
  frame.title = "Public repositories";
  frame.src = "repos/index.html";
  body.appendChild(frame);
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
  [["NIDA ATT", "nida"], ["Foolcourse", "foolcourse"], ["Foolbook", "foolbook"], ["Foolbook Editor", "editor"], ["Byte Viewer", "bytes"], ["Repositories", "repos"], ["Old viewers", "old"]].forEach(([label, id]) => {
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
