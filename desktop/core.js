"use strict";

// Shared desktop machinery. Icons register themselves and call these.
const desk = document.getElementById("desk");
const menu = document.getElementById("menu");
const tasks = document.getElementById("tasks");
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

window.Desk = { desk, menu, tasks, glyph, windowFrame, btn, closeWin, focusWin };
