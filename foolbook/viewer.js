"use strict";

const BOOKS = [
  ["First light", "https://raw.githubusercontent.com/squirelworks/Foolbook/main/_books/first_light/first_light.fbk", "first_light"],
  ["Using Foolbook", "https://raw.githubusercontent.com/squirelworks/Foolbook/main/_books/using_foolbook/using_foolbook.fbk", "using_foolbook"],
  ["Using Grok", "https://raw.githubusercontent.com/squirelworks/Foolbook/main/_books/using_grok/using_grok.fbk?v=3", "using_grok"],
  ["Filing taxes for 2026", "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/Money/Filing%20taxes/file_2026.fbk", "file_2026"],
  ["Finding current tax information", "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/Money/Filing%20taxes/find_current.fbk", "find_current"],
  ["Phone", "https://raw.githubusercontent.com/squirelworks/Foolcourse/main/_courses/Getting%20around/Street%20sense/phone.fbk", "phone"],
];

const shelf = document.getElementById("shelf");
const pagesEl = document.getElementById("pages");
const stage = document.getElementById("stage");
const where = document.getElementById("where");
const status = document.getElementById("status");
let book = null;
let index = 0;
let wanted = "";
const opened = [];

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
    else {
      const other = opened.find((item) => item !== book && (item.pages || []).some((page) => String(page.id).toLowerCase() === next.toLowerCase()));
      if (other) {
        book = other;
        show(next);
        return;
      }
      wanted = next;
      status.textContent = "Page " + next + " is in another book. Open that file.";
      document.getElementById("file").click();
      return;
    }
  } else {
    index = Math.max(0, Math.min(pages.length - 1, next));
  }
  const page = pages[index];
  where.textContent = (book.title || book.id || "Book") + "   " + (index + 1) + " / " + pages.length + "   " + page.id;
  FoolReader.drawPage(stage, book, page, (dest, other) => {
    if (other) openNamed(other, dest);
    else show(dest);
  });
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

async function openURL(name, url, pageId) {
  status.textContent = "Opening " + name + "…";
  shelf.querySelectorAll("button").forEach((button) => button.classList.toggle("on", button.textContent === name));
  try {
    book = await FoolReader.fetchBook(url);
    index = 0;
    status.textContent = "";
    show(pageId || 0);
  } catch (err) {
    status.textContent = name + " did not open. " + err.message;
  }
}

async function openBuffer(name, buffer) {
  status.textContent = "";
  shelf.querySelectorAll("button").forEach((button) => button.classList.remove("on"));
  try {
    book = await FoolReader.unpackBytes(new Uint8Array(buffer));
    if (!book.title || book.title === "ToolBook") book.title = name.replace(/\.(fbk|fsk|tbk|sbk|json)$/i, "");
    if (!opened.includes(book)) opened.push(book);
    if (wanted) {
      const found = (book.pages || []).findIndex((page) => String(page.id).toLowerCase() === wanted.toLowerCase());
      if (found >= 0) {
        const page = wanted;
        wanted = "";
        status.textContent = "";
        show(page);
        return;
      }
      status.textContent = name + " does not have page " + wanted + ".";
    }
    show(0);
  } catch (err) {
    status.textContent = name + " did not open. " + err.message;
  }
}

function openNamed(name, pageId) {
  const want = String(name || "").toLowerCase().replace(/\.(fbk|json)$/i, "");
  const found = BOOKS.find((row) => row[2] === want || row[0].toLowerCase() === want);
  if (!found) {
    status.textContent = "No book named " + name + " is on the shelf.";
    return;
  }
  openURL(found[0], found[1], pageId);
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
