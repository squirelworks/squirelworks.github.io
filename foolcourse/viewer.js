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
const frame = document.getElementById("book");
const status = document.getElementById("status");
let subjects = DEFAULTS;
let subject = null;
let module = null;
let ready = false;
const pending = [];

function tell(message) {
  message.type = "foolbook";
  if (!ready || !frame.contentWindow) pending.push(message);
  else frame.contentWindow.postMessage(message, "*");
}

function fileURL(file) {
  return books + file.split("/").map(encodeURIComponent).join("/");
}

window.addEventListener("message", (ev) => {
  if (ev.source !== frame.contentWindow) return;
  const msg = ev.data;
  if (!msg || msg.type !== "foolbook") return;
  if (msg.event === "ready") {
    ready = true;
    while (pending.length) frame.contentWindow.postMessage(pending.shift(), "*");
  } else if (msg.event === "error") {
    status.textContent = msg.message || "The book did not open.";
  } else if (msg.event === "need" && msg.book) {
    const named = String(msg.book);
    const file = /\.(fbk|fsk|tbk|sbk)$/i.test(named) ? named : named + ".fbk";
    status.textContent = "Opening " + named + "…";
    tell({ cmd: "open", src: fileURL(file), title: named, page: msg.page || "" });
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
      paint();
    }, index === subject);
  });
  if (subject == null) return;
  (subjects[subject].modules || []).forEach((item, index) => {
    button(modulesEl, item.name, () => {
      module = index;
      paint();
    }, index === module);
  });
  if (module == null) return;
  (subjects[subject].modules[module].courses || []).forEach((item) => {
    const node = button(coursesEl, item.title, () => openCourse(item, node));
    if (!item.file) node.classList.add("missing");
  });
}

function openCourse(item, node) {
  coursesEl.querySelectorAll("button").forEach((other) => other.classList.remove("on"));
  node.classList.add("on");
  if (!item.file) {
    status.textContent = item.title + " is listed. The book is not in the course folder.";
    return;
  }
  status.textContent = "Opening " + item.title + "…";
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

frame.addEventListener("load", () => {
  ready = false;
  if (frame.contentWindow) frame.contentWindow.postMessage({ type: "foolbook", cmd: "ping" }, "*");
});
if (frame.contentWindow) frame.contentWindow.postMessage({ type: "foolbook", cmd: "ping" }, "*");

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
