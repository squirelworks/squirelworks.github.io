"use strict";

const RAW = "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/";

const CURRICULUM = [
  {
    subject: "Money",
    module: "Filing taxes",
    courses: [
      { title: "Filing taxes for 2026", file: "Money/Filing taxes/file_2026.fbk" },
      { title: "How to find up-to-date information", file: "Money/Filing taxes/find_current.fbk" },
    ],
  },
  {
    subject: "Getting around",
    module: "Street sense",
    courses: [
      { title: "How to not walk while using your phone", file: "Getting around/Street sense/phone.fbk" },
      { title: "Reading maps", file: "" },
      { title: "Bus times", file: "" },
    ],
  },
];

const tree = document.getElementById("tree");
const frame = document.getElementById("book");
const status = document.getElementById("status");
let ready = false;
const pending = [];

function tell(message) {
  message.type = "foolbook";
  if (!ready || !frame.contentWindow) pending.push(message);
  else frame.contentWindow.postMessage(message, "*");
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
    status.textContent = "That page is in " + msg.book + ". Open that book beside this one.";
  } else if (msg.event === "page") {
    status.textContent = "";
  }
});

function openCourse(item, button) {
  tree.querySelectorAll("button").forEach((node) => node.classList.remove("on"));
  button.classList.add("on");
  if (!item.file) {
    status.textContent = item.title + " is listed in the curriculum. The book is not in the course folder.";
    return;
  }
  status.textContent = "Opening " + item.title + "…";
  tell({ cmd: "open", src: RAW + encodeURI(item.file), title: item.title });
}

CURRICULUM.forEach((group) => {
  const subject = document.createElement("div");
  subject.className = "subject";
  subject.textContent = group.subject;
  tree.appendChild(subject);
  const module = document.createElement("div");
  module.className = "module";
  module.textContent = group.module;
  tree.appendChild(module);
  group.courses.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = item.file ? "course" : "course missing";
    button.textContent = item.title;
    button.addEventListener("click", () => openCourse(item, button));
    tree.appendChild(button);
  });
});

frame.addEventListener("load", () => {
  ready = false;
  if (frame.contentWindow) frame.contentWindow.postMessage({ type: "foolbook", cmd: "ping" }, "*");
});
if (frame.contentWindow) frame.contentWindow.postMessage({ type: "foolbook", cmd: "ping" }, "*");
