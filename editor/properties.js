"use strict";

/* The property pane, as data, the same rows and rules as FoolbookEditor's
   author/properties.py. Each row is a key on the shape, a label, and how the
   typed text is read. write() changes the shape only when the text is good.
   Bad text leaves the old value, and the pane shows it again.
   editor/schema.json lists the desktop rows; a test holds the two equal. */

(function (root) {
  const ROWS = [
    ["name", "Name", "name"],
    ["text", "Text", "text"],
    ["fill", "Fill", "color"],
    ["outline", "Outline", "color"],
    ["stroke", "Line width", "width"],
    ["font", "Font", "face"],
    ["size", "Size", "points"],
    ["bold", "Bold", "flag"],
    ["italic", "Italic", "flag"],
    ["underline", "Underline", "flag"],
    ["align", "Align", "choice"],
    ["visible", "Visible", "flag"],
    ["x", "Left", "place"],
    ["y", "Top", "place"],
    ["w", "Width", "extent"],
    ["h", "Height", "extent"],
    ["points", "Points", "pointlist"],
    ["jump_page", "Go to page", "jump"],
    ["jump_book", "In book", "jump"],
    ["jump_label", "Jump label", "jump"],
  ];
  const FEWEST_POINTS = { polygon: 3 };
  const MIN_EXTENT = 4;
  const CHOICES = { align: ["left", "center", "right"] };
  const STROKE = 1;
  const HEX = /^#[0-9a-fA-F]{6}$/;
  const WHOLE = /^[+-]?\d+$/;

  function kindOf(key) {
    const row = ROWS.find((item) => item[0] === key);
    return row ? row[2] : "";
  }

  function whole(raw) {
    return WHOLE.test(raw) ? parseInt(raw, 10) : null;
  }

  function boundsOf(shape) {
    const x = Number(shape.x) || 0;
    const y = Number(shape.y) || 0;
    const w = Number(shape.w) || 0;
    const h = Number(shape.h) || 0;
    if (w && h) return [x, y, w, h];
    const pts = [].concat(shape.points || [], shape.ends || []).filter((pt) => pt && pt.length >= 2);
    if (!pts.length) return [x, y, w, h];
    const xs = pts.map((pt) => Number(pt[0]));
    const ys = pts.map((pt) => Number(pt[1]));
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    return [left, top, Math.max(...xs) - left, Math.max(...ys) - top];
  }

  function alignName(value) {
    if (typeof value === "string" && CHOICES.align.includes(value.toLowerCase())) return value.toLowerCase();
    const code = parseInt(value || 0, 10);
    return code === 1 ? "right" : code === 2 ? "center" : "left";
  }

  function read(shape, key) {
    const kind = kindOf(key);
    if (key === "stroke") return String(shape.stroke === undefined ? STROKE : shape.stroke);
    if (key === "points") {
      return (shape.points || []).filter((pt) => pt && pt.length >= 2)
        .map((pt) => Math.trunc(pt[0]) + ", " + Math.trunc(pt[1])).join("\n");
    }
    if (kind === "place" || kind === "extent") {
      const box = boundsOf(shape);
      return String(Math.trunc(box["xywh".indexOf(key)]));
    }
    if (key === "visible") return shape.visible === false ? "false" : "true";
    if (kind === "flag") return shape[key] ? "true" : "false";
    if (key === "align") return alignName(shape.align);
    if (kind === "jump") return String((shape.item || {})[key.slice(5)] || "");
    const value = shape[key];
    return value === undefined || value === null ? "" : String(value);
  }

  function nameTaken(page, shape, name) {
    return ((page && page.shapes) || []).some((other) =>
      other !== shape && other && String(other.name || "").toLowerCase() === name.toLowerCase());
  }

  function parsePoints(raw) {
    const points = [];
    for (const line of raw.split(/\r?\n/)) {
      const parts = line.replace(/,/g, " ").trim().split(/\s+/).filter(Boolean);
      if (!parts.length) continue;
      if (parts.length !== 2) return null;
      const a = whole(parts[0]);
      const b = whole(parts[1]);
      if (a === null || b === null) return null;
      points.push([a, b]);
    }
    return points;
  }

  function setBounds(shape, key, number) {
    const [x, y, w, h] = boundsOf(shape);
    const box = { x, y, w, h };
    box[key] = number;
    const sx = w ? box.w / w : 1;
    const sy = h ? box.h / h : 1;
    ["points", "ends"].forEach((field) => {
      if (shape[field] && shape[field].length) {
        shape[field] = shape[field].map((pt) => [
          Math.round(box.x + (pt[0] - x) * sx),
          Math.round(box.y + (pt[1] - y) * sy),
        ]);
      }
    });
    ["x", "y", "w", "h"].forEach((field) => { shape[field] = Math.trunc(box[field]); });
  }

  function setJump(shape, part, raw) {
    const item = Object.assign({}, shape.item || {});
    if (part === "page") {
      if (!raw) {
        delete shape.item;
        return true;
      }
      item.page = raw;
    } else if (!item.page) {
      return false;
    } else if (raw) {
      item[part] = raw;
    } else {
      delete item[part];
    }
    shape.item = item;
    return true;
  }

  function write(shape, key, typed, page) {
    const kind = kindOf(key);
    const raw = kind === "text" ? String(typed) : String(typed).trim();
    if (kind === "name") {
      if (!raw || nameTaken(page, shape, raw)) return false;
      shape.name = raw;
    } else if (kind === "text") {
      shape.text = raw;
    } else if (kind === "color") {
      if (key === "fill" && raw === "") {
        shape.fill = "";
        return true;
      }
      if (!HEX.test(raw)) return false;
      shape[key] = raw.toLowerCase();
    } else if (kind === "width") {
      const width = whole(raw);
      if (width === null || width < 0) return false;
      shape.stroke = width;
    } else if (kind === "face") {
      if (raw) shape.font = raw;
      else delete shape.font;
    } else if (kind === "points") {
      const size = whole(raw);
      if (size === null || size < 1 || size > 288) return false;
      shape.size = size;
    } else if (kind === "flag") {
      const word = raw.toLowerCase();
      if (!["true", "false", "1", "0"].includes(word)) return false;
      shape[key] = word === "true" || word === "1";
    } else if (kind === "choice") {
      if (!CHOICES[key].includes(raw.toLowerCase())) return false;
      shape[key] = raw.toLowerCase();
    } else if (kind === "pointlist") {
      const points = parsePoints(raw);
      if (!points || points.length < (FEWEST_POINTS[shape.kind] || 2)) return false;
      shape.points = points;
      const xs = points.map((pt) => pt[0]);
      const ys = points.map((pt) => pt[1]);
      shape.x = Math.min(...xs);
      shape.y = Math.min(...ys);
      shape.w = Math.max(...xs) - shape.x;
      shape.h = Math.max(...ys) - shape.y;
    } else if (kind === "jump") {
      return setJump(shape, key.slice(5), raw);
    } else if (kind === "place" || kind === "extent") {
      const number = whole(raw);
      if (number === null) return false;
      if (kind === "extent" && number < MIN_EXTENT) return false;
      setBounds(shape, key, number);
    } else {
      return false;
    }
    return true;
  }

  root.FoolProps = { ROWS, CHOICES, read, write };
})(typeof window !== "undefined" ? window : this);
