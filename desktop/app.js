use strict";

const ICONS = [
  { id: "nida", name: "NIDA ATT", x: 16, y: 12, color: "#000080" },
  { id: "foolcourse", name: "Foolcourse", x: 16, y: 88, color: "#800000" },
  { id: "foolbook", name: "Foolbook", x: 16, y: 164, color: "#008000" },
  { id: "editor", name: "Foolbook Editor", x: 16, y: 240, color: "#008080" },
  { id: "bytes", name: "Byte Viewer", x: 16, y: 316, color: "#808000" },
  { id: "repos", name: "Repositories", x: 108, y: 12, color: "#400080" },
  { id: "seihai", name: "Seihai", x: 108, y: 88, color: "#006400" },
  { id: "docs", name: "Documentation", x: 108, y: 164, color: "#800080" },
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
  if (id === "nida") {
    location.href = "nida/";
    return;
  }
  if (id === "foolcourse") {
    location.href = "foolcourse/";
    return;
  }
  if (id === "foolbook") {
    location.href = "foolbook/";
    return;
  }
  if (id === "editor") {
    location.href = "editor/";
    return;
  }
  if (id === "bytes") {
    location.href = "byteviewer/";
    return;
  }
  if (id === "repos") {
    location.href = "repos/";
    return;
  }
  if (id === "seihai") {
    location.href = "seihai/";
    return;
  }
  if (id === "docs") {
    location.href = "documentation/";
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
