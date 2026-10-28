"use strict";

// Icons register on window.DESK_ICONS from desktop/icons/*.js.
// Core (windows, drag, glyph) is in desktop/core.js.
const icons = window.DESK_ICONS || [];
const desk = window.Desk.desk;
const menu = window.Desk.menu;
const glyph = window.Desk.glyph;
const btn = window.Desk.btn;

function placeIcons() {
  const narrow = window.innerWidth < 700;
  icons.forEach((icon, i) => {
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
    const open = () => {
      if (typeof icon.open === "function") icon.open();
    };
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

document.getElementById("start").addEventListener("click", (ev) => {
  ev.stopPropagation();
  if (menu.style.display === "block") {
    menu.style.display = "none";
    return;
  }
  menu.replaceChildren();
  icons.forEach((icon) => {
    menu.appendChild(btn(icon.name, () => {
      menu.style.display = "none";
      if (typeof icon.open === "function") icon.open();
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
