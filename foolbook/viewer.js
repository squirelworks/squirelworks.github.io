"use strict";

/* Embed this page for Foolcourse or NIDA_ATT.
   iframe src="https://squirelworks.github.io/foolbook/?embed=1"
   Parent sends:
     { type: "foolbook", cmd: "open", src, title, page }
     { type: "foolbook", cmd: "page", page }
   This page replies:
     { type: "foolbook", event: "ready" }
     { type: "foolbook", event: "page", id, index, count, title }
     { type: "foolbook", event: "need", book, page }
     { type: "foolbook", event: "error", message }
   One address also works: ?embed=1&src=<url>&title=<name>&page=<id>
*/

// The shelf lives in shelf.js, so the editor offers the same books.
const BOOKS = window.FOOLBOOK_SHELF || [];

const query = new URLSearchParams(location.search);
const embed = query.get("embed") === "1";
const shelf = document.getElementById("shelf");
const pagesEl = document.getElementById("pages");
const stage = document.getElementById("stage");
const where = document.getElementById("where");
const status = document.getElementById("status");
let book = null;
let index = 0;
let wanted = "";
const opened = [];

function tell(event, extra) {
  if (window.parent === window) return;
  parent.postMessage(Object.assign({ type: "foolbook", event }, extra || {}), "*");
}

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
      if (!embed) document.getElementById("file").click();
      tell("need", { book: "", page: next });
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
  tell("page", { id: page.id, index, count: pages.length, title: book.title || "" });
}

async function openURL(name, url, pageId) {
  status.textContent = "Opening " + name + "…";
  shelf.querySelectorAll("button").forEach((button) => button.classList.toggle("on", button.textContent === name));
  try {
    book = await FoolReader.fetchBook(url);
    if (name && (!book.title || book.title === "ToolBook")) book.title = name;
    index = 0;
    status.textContent = "";
    if (!opened.includes(book)) opened.push(book);
    show(pageId || 0);
  } catch (err) {
    status.textContent = name + " did not open. " + err.message;
    tell("error", { message: status.textContent });
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
    tell("error", { message: status.textContent });
  }
}

function openNamed(name, pageId) {
  const want = String(name || "").toLowerCase().replace(/\.(fbk|fsk|tbk|sbk|json)$/i, "");
  const found = BOOKS.find((row) => row[2] === want || row[0].toLowerCase() === want);
  if (!found) {
    status.textContent = "This page is in " + name + ".";
    tell("need", { book: name, page: pageId || "" });
    return;
  }
  openURL(found[0], found[1], pageId);
}

if (embed) document.body.classList.add("embed");

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
window.addEventListener("message", (ev) => {
  const msg = ev.data;
  if (!msg || msg.type !== "foolbook") return;
  if (msg.cmd === "open" && msg.src) openURL(msg.title || "Book", msg.src, msg.page || 0);
  else if (msg.cmd === "page" && msg.page) show(msg.page);
  else if (msg.cmd === "ping") tell("ready");
});

if (embed) {
  tell("ready");
  if (query.get("src")) openURL(query.get("title") || "Book", query.get("src"), query.get("page") || 0);
  else where.textContent = "Waiting for a book.";
} else {
  openURL(BOOKS[0][0], BOOKS[0][1]);
}
