"use strict";

const BOOKS = [
  ["First light", "https://raw.githubusercontent.com/squirelworks/Foolbook/main/foolbook/books/first_light.fbk"],
  ["Using Foolbook", "https://raw.githubusercontent.com/squirelworks/Foolbook/main/foolbook/books/using_foolbook.fbk"],
  ["Filing taxes for 2026", "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/Money/Filing%20taxes/file_2026.fbk"],
  ["Finding current tax information", "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/Money/Filing%20taxes/find_current.fbk"],
  ["Phone", "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/Getting%20around/Street%20sense/phone.fbk"],
];

const shelf = document.getElementById("shelf");
const pagesEl = document.getElementById("pages");
const stage = document.getElementById("stage");
const where = document.getElementById("where");
const status = document.getElementById("status");
let book = null;
let index = 0;

function pageLabel(page) {
  const shape = (page.shapes || []).find((item) => item.text && String(item.text).trim());
  const line = shape ? String(shape.text).trim().split("\n")[0].slice(0, 48) : "";
  return page.id + (line ? "  " + line : "");
}

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
  where.textContent = (book.title || book.id || "Book") + "   " + (index + 1) + " / " + pages.length + "   " + page.id;
  FoolReader.drawPage(stage, book, page, (dest) => show(dest));
  pagesEl.replaceChildren();
  pages.forEach((item, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = pageLabel(item);
    if (i === index) button.className = "on";
    button.addEventListener("click", () => show(i));
    pagesEl.appendChild(button);
  });
  const current = pagesEl.querySelector(".on");
  if (current) current.scrollIntoView({ block: "nearest" });
}

async function openURL(name, url) {
  status.textContent = "Opening " + name + "…";
  shelf.querySelectorAll("button").forEach((button) => button.classList.toggle("on", button.textContent === name));
  try {
    book = await FoolReader.fetchBook(url);
    index = 0;
    status.textContent = "";
    show(0);
  } catch (err) {
    status.textContent = name + " did not open. " + err.message;
  }
}

async function openBuffer(name, buffer) {
  status.textContent = "";
  shelf.querySelectorAll("button").forEach((button) => button.classList.remove("on"));
  try {
    book = await FoolReader.unpackBytes(new Uint8Array(buffer));
    if (!book.title) book.title = name.replace(/\.(fbk|fsk|json)$/i, "");
    show(0);
  } catch (err) {
    status.textContent = name + " did not open. " + err.message;
  }
}

BOOKS.forEach(([name, url]) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = name;
  button.addEventListener("click", () => openURL(name, url));
  shelf.appendChild(button);
});

document.getElementById("prev").addEventListener("click", () => book && show(index - 1));
document.getElementById("next").addEventListener("click", () => book && show(index + 1));
document.getElementById("open").addEventListener("click", () => document.getElementById("file").click());
document.getElementById("file").addEventListener("change", () => {
  const file = document.getElementById("file").files[0];
  if (!file) return;
  file.arrayBuffer().then((buffer) => openBuffer(file.name, buffer));
});
window.addEventListener("resize", () => { if (book) show(index); });

openURL(BOOKS[0][0], BOOKS[0][1]);
