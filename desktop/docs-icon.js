"use strict";

// Adds a Documentation icon without modifying the rest of the desktop.
document.addEventListener("DOMContentLoaded", () => {
  const desk = document.getElementById("desk");
  if (!desk || document.querySelector("[data-docs-icon]")) return;
  const el = document.createElement("div");
  el.className = "icon";
  el.tabIndex = 0;
  el.dataset.docsIcon = "1";
  el.style.left = "108px";
  el.style.top = "164px";
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 32 32");
  s.setAttribute("class", "glyph");
  s.innerHTML =
    '<rect x="4" y="6" width="24" height="20" fill="#800080" stroke="#fff" stroke-width="2"/>' +
    '<rect x="4" y="6" width="24" height="5" fill="#000080"/>' +
    '<rect x="8" y="14" width="16" height="2" fill="#fff"/>' +
    '<rect x="8" y="18" width="10" height="2" fill="#fff"/>';
  el.appendChild(s);
  const label = document.createElement("span");
  label.textContent = "Documentation";
  el.appendChild(label);
  el.addEventListener("click", () => {
    location.href = "documentation/";
  });
  el.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") location.href = "documentation/";
  });
  desk.appendChild(el);
});
