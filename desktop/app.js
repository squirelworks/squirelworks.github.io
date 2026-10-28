"use strict";

const ICONS = [
  { id: "nida", name: "NIDA ATT", x: 16, y: 12, color: "#000080", href: "nida/" },
  { id: "foolcourse", name: "Foolcourse", x: 16, y: 88, color: "#800000", href: "foolcourse/" },
  { id: "foolbook", name: "Foolbook", x: 16, y: 164, color: "#008000", href: "foolbook/" },
  { id: "editor", name: "Foolbook Editor", x: 16, y: 240, color: "#008080", href: "editor/" },
  { id: "bytes", name: "Byte Viewer", x: 16, y: 316, color: "#808000", href: "byteviewer/" },
  { id: "repos", name: "Repositories", x: 108, y: 12, color: "#400080", href: "repos/" },
  { id: "seihai", name: "Seihai", x: 108, y: 88, color: "#1a3a6a", href: "seihai/" },
  { id: "docs", name: "Documentation", x: 108, y: 164, color: "#800080", href: "documentation/" },
  { id: "calc", name: "Calculator", x: 108, y: 240, color: "#804000", href: "calculators/" },
];

const desk = document.getElementById("desk");
const menu = document.getElementById("menu");
const tasks = document.getElementById("tasks");

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
    const open = () => { location.href = icon.href; };
    el.addEventListener("click", open);
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") open();
    });
    let tapped = 0;
    el.addEventListener("pointerup", () => {
      const now = Date.now();
      if (now - tapped < 400) open();
      tapped = now;
    });
    desk.appendChild(el);
  });
}

function btn(label, on) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.addEventListener("click", on);
  return b;
}

document.getElementById("start").addEventListener("click", (ev) => {
  ev.stopPropagation();
  if (menu.style.display === "block") {
    menu.style.display = "none";
    return;
  }
  menu.replaceChildren();
  ICONS.forEach((icon) => {
    menu.appendChild(btn(icon.name, () => {
      menu.style.display = "none";
      location.href = icon.href;
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
