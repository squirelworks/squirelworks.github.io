#!/usr/bin/env python3
"""Pack a ToolBook lesson into a viewer zip.

Usage: python3 tbk_pack.py <file.tbk | directory> <out.zip>
"""

import json
import sys
import zipfile
from pathlib import Path

MARK = bytes.fromhex("80650005000202")


def strings(blob):
    out = []
    cur = []
    for c in blob:
        if 32 <= c < 127:
            cur.append(chr(c))
        else:
            s = "".join(cur).strip()
            cur = []
            if len(s) >= 4 and s not in out:
                out.append(s)
    return out


def fields(blob):
    found = []
    start = 0
    while True:
        i = blob.find(b"Text\x00\x00", start)
        if i < 0:
            break
        start = i + 6
        if i + 16 > len(blob):
            continue
        length = int.from_bytes(blob[i + 14:i + 16], "little")
        if length < 8 or i + 16 + length > len(blob):
            continue
        raw = blob[i + 16:i + 16 + length]
        if raw[:1] not in (b"\r", b"\n"):
            continue
        text = raw.replace(b"\r", b"").decode("latin-1").strip()
        if not text:
            continue
        # Words after Text\\0\\0 and before the string: x, y, 0, w, h.
        x = y = w = h = 0
        if i + 16 <= len(blob):
            x, y, _, w, h = [
                int.from_bytes(blob[i + 6 + n:i + 8 + n], "little") for n in range(0, 10, 2)
            ]
        found.append({
            "kind": "field",
            "text": text,
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "offset": i,
        })
    return found


def jumps(blob):
    found = []
    start = 0
    while True:
        i = blob.find(b'("P', start)
        if i < 0:
            break
        j = i + 2
        k = j
        while k < len(blob) and (48 <= blob[k] <= 57 or 65 <= blob[k] <= 90):
            k += 1
        name = blob[j:k].decode("ascii", "ignore")
        if name.startswith("P") and name not in found:
            found.append(name)
        start = k + 1
    return found


def pages(data):
    hits = []
    start = 0
    while True:
        i = data.find(MARK, start)
        if i < 0:
            break
        hits.append(i)
        start = i + 1
    out = []
    for n, off in enumerate(hits):
        nxt = hits[n + 1] if n + 1 < len(hits) else len(data)
        blob = data[off:nxt]
        name = blob[11:43].split(b"\x00", 1)[0].decode("latin-1", "replace")
        if not name.startswith("P"):
            continue
        sites = []
        p = 0
        while True:
            j = blob.find(b"\x14\x00\x00", p)
            if j < 0:
                break
            sites.append(j)
            p = j + 1
        out.append({
            "name": name,
            "offset": off,
            "size": len(blob),
            "id": int.from_bytes(blob[7:11], "little"),
            "sections": sites,
            "jumps": jumps(blob),
            "fields": fields(blob),
            "strings": strings(blob)[:60],
            "bm": blob.count(b"BM"),
            "jpeg": blob.count(b"\xff\xd8\xff"),
        })
    return out


def book(path):
    data = path.read_bytes()
    return {
        "file": path.name,
        "size": len(data),
        "pages": pages(data),
    }


VIEWER = r"""<!DOCTYPE html>
<meta charset="utf-8">
<title>Lesson</title>
<link rel="stylesheet" href="viewer.css">
<canvas id="stage" width="900" height="520"></canvas>
<nav>
  <button id="back">Back</button>
  <span id="name"></span>
  <button id="next">Next</button>
</nav>
<script type="module">
import * as shapes from "./shapes.js";

const book = await fetch("book.json").then((r) => r.json());
const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
let index = book.pages.findIndex((p) => p.name === "P400");
if (index < 0) index = 0;

function paintChip(field, px, py, scale) {
  const x = px(field.x - 8);
  const y = py(field.y - 10);
  const w = 96 * scale;
  const h = 36 * scale;
  ctx.save();
  ctx.fillStyle = "#111";
  shapes.paintObject(ctx, x, y, w, h);
  ctx.strokeStyle = "#ddd";
  for (let i = 0; i < 8; i += 1) {
    const pin = x + i * (w / 8);
    shapes.line(ctx, pin, y - 10, pin, y);
    shapes.line(ctx, pin, y + h, pin, y + h + 10);
  }
  ctx.restore();
}

function draw() {
  const page = book.pages[index];
  document.getElementById("name").textContent = page.name;
  ctx.fillStyle = "#1d4e89";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#f4f1e8";
  ctx.fillStyle = "#f4f1e8";
  ctx.font = "14px sans-serif";
  const items = page.fields.filter((f) => f.w > 0 && f.h > 0);
  if (!items.length) {
    ctx.fillText(page.strings[0] || page.name, 24, 40);
    return;
  }
  const minX = Math.min(...items.map((f) => f.x));
  const minY = Math.min(...items.map((f) => f.y));
  const maxX = Math.max(...items.map((f) => f.x + f.w));
  const maxY = Math.max(...items.map((f) => f.y + f.h));
  const scale = Math.min(840 / Math.max(1, maxX - minX), 460 / Math.max(1, maxY - minY));
  const px = (x) => 30 + (x - minX) * scale;
  const py = (y) => 30 + (y - minY) * scale;
  for (const field of items) {
    if (/74LS|27\d\d|MM54|JL/.test(field.text)) paintChip(field, px, py, scale);
    shapes.field(ctx, px(field.x), py(field.y), Math.max(field.w, 40) * scale, Math.max(field.h, 16) * scale, field.text);
  }
}

document.getElementById("back").onclick = () => {
  index = (index - 1 + book.pages.length) % book.pages.length;
  draw();
};
document.getElementById("next").onclick = () => {
  index = (index + 1) % book.pages.length;
  draw();
};
draw();
</script>
"""

CSS = "body{background:#123;color:#fff;font-family:sans-serif}canvas{background:#1d4e89;display:block}nav{padding:8px}button{margin-right:8px}\n"


def shapes_text():
    beside = Path(__file__).resolve().parent / "shapes.js"
    if beside.exists():
        return beside.read_text(encoding="utf-8")
    return SHAPES


SHAPES = r"""// Object kinds named by TB80UTL.DLL at file 0xDED6.
export const kinds = ["rectangle","ellipse","roundedRectangle","line","polygon","irregularPolygon","arc","pie","angledLine","curve","paintObject","picture","field","button","group"];
export function rectangle(ctx, x, y, w, h) { ctx.strokeRect(x, y, w, h); }
export function ellipse(ctx, x, y, w, h) { ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, 0, Math.PI * 2); ctx.stroke(); }
export function roundedRectangle(ctx, x, y, w, h, r) { const radius = r || Math.min(8, Math.abs(w) / 4, Math.abs(h) / 4); ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.stroke(); }
export function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
export function polygon(ctx, points) { if (!points.length) return; ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]); for (const [x, y] of points.slice(1)) ctx.lineTo(x, y); ctx.closePath(); ctx.stroke(); }
export function angledLine(ctx, points) { if (!points.length) return; ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]); for (const [x, y] of points.slice(1)) ctx.lineTo(x, y); ctx.stroke(); }
export function curve(ctx, points) { if (points.length < 2) return; ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]); for (let i = 1; i < points.length - 1; i += 1) { const [x, y] = points[i]; const [nx, ny] = points[i + 1]; ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2); } const last = points[points.length - 1]; ctx.lineTo(last[0], last[1]); ctx.stroke(); }
export function arc(ctx, x, y, w, h, start, end) { ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, start || 0, end || Math.PI); ctx.stroke(); }
export function pie(ctx, x, y, w, h, start, end) { ctx.beginPath(); ctx.moveTo(x + w / 2, y + h / 2); ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, start || 0, end || Math.PI); ctx.closePath(); ctx.stroke(); }
export function paintObject(ctx, x, y, w, h) { ctx.fillRect(x, y, w, h); }
export function picture(ctx, image, x, y, w, h) { if (image) ctx.drawImage(image, x, y, w, h); else paintObject(ctx, x, y, w, h); }
export function field(ctx, x, y, w, h, text) { ctx.strokeRect(x, y, w, h); ctx.fillText(text || "", x + 4, y + 14); }
export function button(ctx, x, y, w, h, text) { ctx.strokeRect(x, y, w, h); ctx.fillText(text || "", x + 6, y + h / 2); }
export function group(ctx, children, draw) { children.forEach(draw); }
"""
def pack(src, dest):
    src = Path(src)
    books = [src] if src.is_file() else sorted(src.glob("*.tbk")) + sorted(src.glob("*.TBK"))
    shapes = shapes_text()
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as zipped:
        zipped.writestr("viewer.html", VIEWER)
        zipped.writestr("viewer.css", CSS)
        zipped.writestr("shapes.js", shapes)
        for path in books:
            payload = book(path)
            zipped.writestr(path.stem.lower() + ".json", json.dumps(payload, indent=2))
            if len(books) == 1:
                zipped.writestr("book.json", json.dumps(payload))
        print(f"{dest} books {len(books)}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: python3 tbk_pack.py <file.tbk | directory> <out.zip>")
    pack(sys.argv[1], sys.argv[2])
