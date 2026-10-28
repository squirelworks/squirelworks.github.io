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
const stage = document.getElementById("stage");
const where = document.getElementById("where");
const status = document.getElementById("status");
let book = null;
let index = 0;
let current = "";

function show(next) {
  const pages = (book && book.pages) || [];
  if (!pages.length) return;
  if (typeof next === "string") {
    const found = pages.findIndex((page) => String(page.id).toLowerCase() === next.toLowerCase());
    if (found >= 0) index = found;
  } else {
    index = Math.max(0, Math.min(pages.length - 1, next));
  }
  const page = pages[index];
  where.textContent = (book.title || "Lesson") + "   " + (index + 1) + " / " + pages.length + "   " + page.id;
  FoolReader.drawPage(stage, book, page, (dest) => show(dest));
}

async function openCourse(item, button) {
  tree.querySelectorAll("button").forEach((node) => node.classList.remove("on"));
  button.classList.add("on");
  if (!item.file) {
    book = null;
    stage.replaceChildren();
    where.textContent = item.title;
    status.textContent = item.title + " is listed in the curriculum. The book is not in the course folder.";
    return;
  }
  status.textContent = "Opening " + item.title + "…";
  current = item.file;
  try {
    book = await FoolReader.fetchBook(RAW + encodeURI(item.file));
    index = 0;
    status.textContent = "";
    show(0);
  } catch (err) {
    status.textContent = item.title + " did not open. " + err.message;
  }
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

document.getElementById("prev").addEventListener("click", () => book && show(index - 1));
document.getElementById("next").addEventListener("click", () => book && show(index + 1));
window.addEventListener("resize", () => { if (book) show(index); });
