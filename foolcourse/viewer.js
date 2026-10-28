"use strict";

const query = new URLSearchParams(location.search);
const books = query.get("books") || "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/";
const menuURL = query.get("menu") || "";
const title = document.getElementById("title");
const back = document.getElementById("back");
if (query.get("title")) title.textContent = query.get("title");
if (query.get("back")) back.href = query.get("back");

const DEFAULTS = [
  {
    name: "Money",
    modules: [{
      name: "Filing taxes",
      courses: [
        { title: "Filing taxes for 2026", file: "Money/Filing taxes/file_2026.fbk" },
        { title: "How to find up-to-date information", file: "Money/Filing taxes/find_current.fbk" },
      ],
    }],
  },
  {
    name: "Getting around",
    modules: [{
      name: "Street sense",
      courses: [
        { title: "How to not walk while using your phone", file: "Getting around/Street sense/phone.fbk" },
        { title: "Reading maps", file: "" },
        { title: "Bus times", file: "" },
      ],
    }],
  },
];

const subjectsEl = document.getElementById("subjects");
const modulesEl = document.getElementById("modules");
const coursesEl = document.getElementById("courses");
const colSubject = document.getElementById("col-subject");
const colModule = document.getElementById("col-module");
const colCourse = document.getElementById("col-course");
const tree = document.getElementById("tree");
const frame = document.getElementById("book");
const status = document.getElementById("status");
let subjects = DEFAULTS;
let subject = null;
let module = null;
let picked = false;
let ready = false;
const pending = [];
const widths = { subject: 220, module: 220, course: 240 };

const crumb = document.getElementById("crumb");
const up = document.getElementById("up");
const where = document.getElementById("where");

function layout() {
  const narrow = window.matchMedia("(max-width: 700px)").matches;
  document.body.classList.toggle("narrow", narrow);
  if (narrow) {
    tree.style.width = "";
    const step = picked ? "book" : module != null ? "course" : subject != null ? "module" : "subject";
    colSubject.hidden = step !== "subject";
    colModule.hidden = step !== "module";
    colCourse.hidden = step !== "course";
    tree.hidden = step === "book";
    frame.hidden = step !== "book";
    crumb.hidden = step === "subject";
    if (step === "module") {
      up.textContent = "Subjects";
      where.textContent = subjects[subject].name;
    } else if (step === "course") {
      up.textContent = "Modules";
      where.textContent = subjects[subject].name + "  ·  " + subjects[subject].modules[module].name;
    } else if (step === "book") {
      up.textContent = "Courses";
      where.textContent = subjects[subject].name + "  ·  " + subjects[subject].modules[module].name;
    }
    return;
  }
  tree.hidden = false;
  frame.hidden = false;
  crumb.hidden = true;
  colModule.hidden = subject == null;
  colCourse.hidden = module == null;
  colSubject.style.flex = subject == null ? "1 1 auto" : "0 0 " + widths.subject + "px";
  colModule.style.flex = module == null ? "1 1 auto" : "0 0 " + widths.module + "px";
  colCourse.style.flex = picked ? "0 0 " + widths.course + "px" : "1 1 auto";
  if (subject == null) tree.style.width = "280px";
  else if (module == null) tree.style.width = (widths.subject + 220) + "px";
  else if (!picked) tree.style.width = (widths.subject + widths.module + 280) + "px";
  else tree.style.width = (widths.subject + widths.module + widths.course + 18) + "px";
}

up.addEventListener("click", () => {
  if (picked) picked = false;
  else if (module != null) module = null;
  else subject = null;
  paint();
});

function tell(message) {
  message.type = "foolbook";
  if (!ready || !frame.contentWindow) pending.push(message);
  else frame.contentWindow.postMessage(message, "*");
}

function fileURL(file) {
  return books + String(file).split("/").map(encodeURIComponent).join("/");
}

function bookURLs(name) {
  const stem = String(name).replace(/\.(fbk|fsk|tbk|sbk)$/i, "");
  const parent = books.replace(/courses\/$/i, "");
  const suffixes = /\.sbk$/i.test(name) ? [".fsk", ".fbk", ".sbk"] : [".fbk", ".fsk", ".tbk", ".sbk"];
  const urls = [];
  suffixes.forEach((suf) => {
    urls.push(books + stem + suf);
    urls.push(parent + stem + suf);
  });
  return urls;
}

async function openOther(name, page) {
  status.textContent = "Opening " + name + "…";
  for (const src of bookURLs(name)) {
    try {
      const res = await fetch(src, { method: "HEAD" });
      if (!res.ok) continue;
      tell({ cmd: "open", src, title: name, page: page || "" });
      return;
    } catch (err) {
      /* try the next place */
    }
  }
  status.textContent = name + " is not beside the lesson or in the course folder.";
}

function flush() {
  if (!frame.contentWindow) return;
  while (pending.length) frame.contentWindow.postMessage(pending.shift(), "*");
}

window.addEventListener("message", (ev) => {
  const msg = ev.data;
  if (!msg || msg.type !== "foolbook") return;
  if (frame.contentWindow && ev.source && ev.source !== frame.contentWindow) return;
  if (msg.event === "ready") {
    ready = true;
    flush();
  } else if (msg.event === "error") {
    status.textContent = msg.message || "The book did not open.";
  } else if (msg.event === "need" && msg.book) {
    openOther(msg.book, msg.page || "");
  } else if (msg.event === "page") {
    status.textContent = "";
  }
});

function button(host, label, on, selected) {
  const node = document.createElement("button");
  node.type = "button";
  node.textContent = label;
  if (selected) node.className = "on";
  node.addEventListener("click", on);
  host.appendChild(node);
  return node;
}

function paint() {
  subjectsEl.replaceChildren();
  modulesEl.replaceChildren();
  coursesEl.replaceChildren();
  subjects.forEach((item, index) => {
    button(subjectsEl, item.name, () => {
      subject = index;
      module = null;
      picked = false;
      widths.subject = 150;
      paint();
    }, index === subject);
  });
  if (subject == null) {
    layout();
    return;
  }
  (subjects[subject].modules || []).forEach((item, index) => {
    button(modulesEl, item.name, () => {
      module = index;
      picked = false;
      widths.subject = 120;
      widths.module = 160;
      paint();
    }, index === module);
  });
  if (module == null) {
    layout();
    return;
  }
  (subjects[subject].modules[module].courses || []).forEach((item) => {
    const node = button(coursesEl, item.title, () => openCourse(item, node));
    if (!item.file) node.classList.add("missing");
  });
  layout();
}

function openCourse(item, node) {
  coursesEl.querySelectorAll("button").forEach((other) => other.classList.remove("on"));
  node.classList.add("on");
  if (!item.file) {
    status.textContent = item.title + " is listed. The book is not in the course folder.";
    return;
  }
  status.textContent = "Opening " + item.title + "…";
  widths.subject = 108;
  widths.module = 128;
  widths.course = 160;
  picked = true;
  layout();
  tell({ cmd: "open", src: fileURL(item.file), title: item.title });
}

function fromXml(text) {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("The menu is not readable.");
  const found = [];
  [...doc.documentElement.children].forEach((menu) => {
    if (menu.localName !== "Menu") return;
    const modules = [];
    [...menu.children].forEach((mod) => {
      if (mod.localName !== "Menu") return;
      const courses = [];
      [...mod.children].forEach((item) => {
        if (item.localName !== "Item") return;
        const id = item.getAttribute("lessonid") || "";
        courses.push({
          title: item.getAttribute("title") || id,
          file: id ? id + ".fbk" : "",
        });
      });
      if (courses.length) modules.push({ name: mod.getAttribute("title") || "Module", courses });
    });
    if (modules.length) found.push({ name: menu.getAttribute("title") || "Subject", modules });
  });
  if (!found.length) throw new Error("The menu has no courses.");
  return found;
}

window.matchMedia("(max-width: 700px)").addEventListener("change", () => layout());

frame.addEventListener("load", () => {
  ready = true;
  flush();
  if (frame.contentWindow) frame.contentWindow.postMessage({ type: "foolbook", cmd: "ping" }, "*");
});
if (frame.contentWindow) frame.contentWindow.postMessage({ type: "foolbook", cmd: "ping" }, "*");

document.querySelectorAll(".grip").forEach((grip) => {
  grip.addEventListener("pointerdown", (ev) => {
    const which = grip.dataset.col;
    const start = ev.clientX;
    const base = which === "tree"
      ? tree.getBoundingClientRect().width
      : widths[which];
    grip.setPointerCapture(ev.pointerId);
    function move(e) {
      const next = Math.max(72, base + e.clientX - start);
      if (which === "tree") {
        tree.style.width = next + "px";
        return;
      }
      widths[which] = next;
      layout();
    }
    function stop() {
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", stop);
    }
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", stop);
  });
});

if (!menuURL) {
  paint();
} else {
  status.textContent = "Loading the menu…";
  fetch(menuURL)
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then((text) => {
      subjects = fromXml(text);
      status.textContent = "";
      paint();
    })
    .catch((err) => {
      status.textContent = "The menu did not load. " + err.message;
    });
}
