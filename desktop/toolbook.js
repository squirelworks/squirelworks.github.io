"use strict";

const TB_CLASSES = {
  0x8: "rect", 0x9: "button", 0xA: "text", 0xC: "ellipse", 0xD: "rect",
  0xE: "line", 0xF: "polygon", 0x10: "polygon", 0x11: "arc", 0x13: "line",
};
const TB_SIZES = {
  0x8: 41, 0x9: 43, 0xA: 61, 0xB: 49, 0xC: 41, 0xD: 45, 0xE: 53,
  0xF: 53, 0x10: 53, 0x11: 61, 0x13: 55, 0x14: 55, 0x15: 89, 0x19: 89,
};

function tb16(u8, off) {
  if (off < 0 || off + 2 > u8.length) return 0;
  return u8[off] | (u8[off + 1] << 8);
}

function tb16s(u8, off) {
  const n = tb16(u8, off);
  return n & 0x8000 ? n - 0x10000 : n;
}

function tb32(u8, off) {
  if (off < 0 || off + 4 > u8.length) return 0;
  return (u8[off] | (u8[off + 1] << 8) | (u8[off + 2] << 16) | (u8[off + 3] << 24)) >>> 0;
}

function tbPixel(twip) {
  const inch = 0x5a0;
  const half = 0x2d0;
  let value = twip * 96 + half;
  if (value < 0) value -= inch;
  if (value < 0) return -Math.floor(-value / inch);
  return Math.floor(value / inch);
}

function tbHex(n) {
  return (n & 255).toString(16).padStart(2, "0");
}

function tbRgb(u8, off) {
  if (off < 0 || off + 3 > u8.length) return "";
  return "#" + tbHex(u8[off]) + tbHex(u8[off + 1]) + tbHex(u8[off + 2]);
}

function tbFind(u8, seq) {
  outer: for (let i = 0; i <= u8.length - seq.length; i++) {
    for (let k = 0; k < seq.length; k++) if (u8[i + k] !== seq[k]) continue outer;
    return i;
  }
  return -1;
}

function tbCstr(u8, off, limit) {
  if (off < 0 || off >= u8.length) return "";
  let end = off;
  const stop = Math.min(u8.length, off + limit);
  while (end < stop && u8[end] !== 0) end++;
  let s = "";
  for (let i = off; i < end; i++) {
    const c = u8[i];
    if (c < 32 || c > 126) return "";
    s += String.fromCharCode(c);
  }
  return s;
}

function tbDecompress(blob, origin, keywords) {
  const out = [];
  let pos = origin || 0;
  const end = blob.length;
  const max = 100000;
  if (pos < end && blob[pos] === 0xf8) pos += 1;
  while (pos < end && out.length < max) {
    const b = blob[pos++];
    if (b < 0x80) {
      if (b === 0) break;
      out.push(b);
      continue;
    }
    if ((b & 0xf0) === 0xf0) {
      if (b === 0xff) {
        if (pos + 1 >= end) break;
        const ch = blob[pos];
        const count = blob[pos + 1] + 1;
        pos += 2;
        for (let i = 0; i < count && out.length < max; i++) out.push(ch);
      } else {
        const count = (b & 0xf) + 2;
        for (let i = 0; i < count && out.length < max; i++) out.push(0x20);
      }
      continue;
    }
    if ((b & 0xf0) === 0xe0) {
      const chunk = [0x0d, 0x0a];
      for (let i = 0; i < (b & 0xf); i++) chunk.push(0x20);
      for (const ch of chunk) if (out.length < max) out.push(ch);
      continue;
    }
    if ((b & 0x40) === 0) {
      let index = b & 0xf;
      if (b & 0x10) {
        if (pos >= end) break;
        index = (index << 8) | blob[pos++];
      }
      const word = index < keywords.length ? keywords[index] : "";
      for (let i = 0; i < word.length && out.length < max; i++) out.push(word.charCodeAt(i) & 255);
      if ((b & 0x20) === 0 && out.length < max) out.push(0x20);
      continue;
    }
    let length;
    let src;
    if ((b & 0x10) === 0) {
      if (pos >= end) break;
      length = (b & 0xf) + 3;
      src = pos + (-4 - blob[pos]);
      pos += 1;
    } else {
      if (pos + 1 >= end) break;
      length = (b & 0xf) + 4;
      const off = blob[pos] | (blob[pos + 1] << 8);
      src = pos + (-1 - off);
      pos += 2;
    }
    for (let i = 0; i < length && out.length < max; i++) {
      const at = src + i;
      out.push(at >= 0 && at < blob.length ? blob[at] : 63);
    }
  }
  return out.map((c) => String.fromCharCode(c)).join("");
}

function tbItem(trailer, handle) {
  if (!trailer || handle === 0 || handle === 0xffff || handle >= trailer.slots.length) return null;
  const slot = trailer.slots[handle];
  const blob = trailer.heaps.get(slot.heap);
  if (!blob || slot.off >= blob.length) return null;
  let end = slot.off >= 6 ? (blob[slot.off - 6] | (blob[slot.off - 5] << 8)) : slot.off + 64;
  if (end <= slot.off || end > blob.length) end = Math.min(blob.length, slot.off + 64);
  return blob.subarray(slot.off, end);
}

function tbHstr(trailer, handle) {
  const raw = tbItem(trailer, handle);
  if (!raw || !raw.length) return "";
  let s = "";
  for (const c of raw) {
    if (!c) break;
    s += String.fromCharCode(c);
  }
  return s;
}

function tbHtext(trailer, handle) {
  const raw = tbItem(trailer, handle);
  if (!raw || raw.length < 4) return "";
  const length = raw[2] | (raw[3] << 8);
  if (length > raw.length - 4) return "";
  let s = "";
  for (let i = 0; i < length; i++) s += String.fromCharCode(raw[4 + i]);
  return s;
}

function tbParseTrailer(u8, seg) {
  let off = seg.filepos + seg.size;
  if (off + 4 > u8.length || tb16(u8, off) !== 1) return null;
  const count = tb16(u8, off + 2);
  let pos = off + 4;
  const headers = [];
  for (let i = 0; i < count; i++) {
    if (pos + 12 > u8.length) return null;
    headers.push({ pre: tb16(u8, pos + 2), length: tb32(u8, pos + 4) });
    pos += 12;
  }
  const heaps = new Map();
  const prefix = new Uint8Array(6);
  const body = u8.subarray(seg.filepos, seg.filepos + seg.size);
  const heap0 = new Uint8Array(prefix.length + body.length);
  heap0.set(prefix, 0);
  heap0.set(body, prefix.length);
  heaps.set(0, heap0);
  headers.forEach((header, i) => {
    const blob = u8.subarray(pos, pos + header.length);
    pos += header.length;
    if (header.length) {
      const padded = new Uint8Array(header.pre + blob.length);
      padded.set(blob, header.pre);
      heaps.set(i + 1, padded);
    }
  });
  if (pos + 4 > u8.length || tb16(u8, pos) !== 1) return null;
  const n1 = tb16(u8, pos + 2);
  pos += 4 + 4 * n1;
  if (pos + 2 > u8.length) return null;
  const n2 = tb16(u8, pos);
  pos += 2;
  const slots = [];
  for (let i = 0; i < n2; i++) {
    if (pos + 8 > u8.length) break;
    slots.push({
      heap: tb16(u8, pos),
      off: tb16(u8, pos + 2),
    });
    pos += 8;
  }
  return { heaps, slots };
}

function tbB64(bytes) {
  let raw = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    raw += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
  }
  return btoa(raw);
}

class ToolStore {
  constructor(u8) {
    this.d = u8;
    this.H = tbFind(u8, [0x03, 0x4a, 0x42, 0x4f]);
    this.segs = new Map();
    this.trailers = new Map();
    this.dirs = new Map();
    if (this.H >= 0) this.segs = this.walk();
  }

  walk() {
    const out = new Map();
    const seen = new Set();
    const node = (pos, level, prefix) => {
      if (!pos || seen.has(pos) || pos < 0 || pos + 0x18 > this.d.length) return;
      seen.add(pos);
      if (level < 3) {
        for (let n = 0; n < 16; n++) {
          const child = tb32(this.d, pos + n * 0x14);
          if (child) node(child, level + 1, (prefix | (n << (4 * level))) >>> 0);
        }
        return;
      }
      for (let n = 0; n < 16; n++) {
        const slot = pos + n * 0x18;
        if (slot + 0x18 > this.d.length) break;
        const filepos = tb32(this.d, slot);
        const flags = tb16(this.d, slot + 8);
        const size = tb16(this.d, slot + 0x0c);
        const key = (prefix | (n << 12)) >>> 0;
        if (filepos && filepos + 4 <= this.d.length && tb16(this.d, filepos) === key && tb16(this.d, filepos + 2) === ((size - 2) & 0xffff)) {
          out.set(key, { segid: key, filepos, size, flags, base: filepos - 6 });
        }
      }
    };
    node(tb32(this.d, this.H + 0x10e), 0, 0);
    return out;
  }

  trailer(segid) {
    if (this.trailers.has(segid)) return this.trailers.get(segid);
    const seg = this.segs.get(segid);
    const parsed = seg && (seg.flags & 0x4000) ? tbParseTrailer(this.d, seg) : null;
    this.trailers.set(segid, parsed);
    return parsed;
  }

  layer(kind) {
    for (const seg of this.segs.values()) {
      const rec = seg.base + 0x14;
      if (rec + 4 <= this.d.length && tb16(this.d, rec - 2) === kind) return rec;
    }
    return null;
  }

  bookSeg() {
    return tb32(this.d, this.H + 8 + 0x10) >>> 16;
  }

  face(ptr) {
    if (!ptr) return "";
    const seg = this.segs.get(this.bookSeg());
    if (!seg) return "";
    const off = seg.base + (ptr & 0xffff);
    return tbCstr(this.d, off, 40);
  }

  fontEntry(ptr) {
    const face = this.face(ptr);
    if (!face) return {};
    const seg = this.segs.get(this.bookSeg());
    if (!seg) return { font: face };
    const off = seg.base + (ptr & 0xffff);
    if (off + 37 > this.d.length) return { font: face };
    const height = tb16s(this.d, off + 32);
    const flags = this.d[off + 36];
    const entry = { font: face, bold: !!(flags & 1), italic: !!(flags & 2) };
    if (height < 0) entry.size = Math.max(1, Math.round(-height / 20));
    return entry;
  }

  fieldText(seg, rec) {
    const trailer = this.trailer(seg.segid);
    const ptr = tb16(this.d, rec + 0x24);
    const heap = trailer && trailer.heaps.get(0);
    if (!heap || ptr + 4 > heap.length) return "";
    const textHandle = heap[ptr + 2] | (heap[ptr + 3] << 8);
    return tbHtext(trailer, textHandle).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  caption(seg, rec) {
    const ptr = tb16(this.d, rec + 0x22);
    if (!ptr) return "";
    if (seg.base + ptr < seg.filepos + seg.size) {
      const raw = tbCstr(this.d, seg.base + ptr, 80);
      if (raw) return raw;
    }
    return tbHstr(this.trailer(seg.segid), ptr);
  }

  script(seg, rec) {
    if ((this.d[rec + 0x0a] & 3) !== 0) return "";
    const ptr = tb16(this.d, rec + 0x0b);
    const trailer = this.trailer(seg.segid);
    const heap = trailer && trailer.heaps.get(0);
    if (!heap || ptr + 4 > heap.length) return "";
    const first = heap[ptr] | (heap[ptr + 1] << 8);
    const second = ptr + 2 + first;
    if (second + 2 > heap.length) return "";
    const length = heap[second] | (heap[second + 1] << 8);
    const source = heap.subarray(second + 2, second + 2 + length);
    try {
      return tbDecompress(source, 0, window.TB_KEYWORDS || []);
    } catch (err) {
      return "";
    }
  }

  objectName(seg, rec) {
    return tbHstr(this.trailer(seg.segid), tb16(this.d, rec + 6));
  }

  bmpAt(dataAt) {
    if (dataAt < 0 || dataAt + 14 > this.d.length) return null;
    if (this.d[dataAt + 8] !== 0x42 || this.d[dataAt + 9] !== 0x4d) return null;
    const size = tb32(this.d, dataAt + 10);
    const end = dataAt + 8 + size;
    if (size < 14 || end > this.d.length) return null;
    return this.d.subarray(dataAt + 8, end);
  }

  storedBitmap(index) {
    if (index < 1) return null;
    const table = tb32(this.d, this.H + 0x104);
    if (!table || table + 12 > this.d.length) return null;
    const count = tb16(this.d, table + 10);
    if (index > count) return null;
    const row = table + 12 + (index - 1) * 12;
    if (row + 12 > this.d.length) return null;
    return this.bmpAt(tb32(this.d, row + 8));
  }

  bitmap(ident) {
    return this.storedBitmap(ident);
  }

  buttonBmp(seg, rec) {
    const ptr = tb16(this.d, rec + 0x28);
    if (!ptr) return null;
    const block = seg.base + ptr;
    const end = seg.filepos + seg.size;
    if (block + 0x16 > end) return null;
    const word = (off) => (block + off + 2 > end ? 0 : tb16(this.d, block + off));
    const style = this.d[rec + 0x27] & 0x7f;
    const up = word(0x15);
    const checked = word(0x4b);
    const flags = this.d[rec + 0x26];
    const disabled = this.storedBitmap(word(0x39) > 1 ? word(0x39) - 1 : 0);
    if ((flags & 0x01) === 0 && disabled) return disabled;
    let face = up;
    if (style === 1 && up > 1 && checked > 1 && checked < up) face = checked;
    if (face <= 1) return null;
    return this.storedBitmap(face - 1);
  }

  children(seg, parent) {
    const base = seg.base;
    const end = seg.filepos + seg.size;
    const kids = [];
    let at = base + 0x18;
    let guard = 0;
    while (at + 0x20 < end && guard < 200000) {
      guard += 1;
      const kind = tb16(this.d, at - 2);
      const size = tb16(this.d, at - 4) - (at - base);
      if (TB_SIZES[kind] && size === TB_SIZES[kind] && tb16(this.d, at + 4) === parent) {
        kids.push(at);
        at += size;
        continue;
      }
      at += 1;
    }
    return kids;
  }

  emit(seg, rec) {
    const kind = tb16(this.d, rec - 2);
    if (kind === 0x0b) {
      const out = [];
      const count = tb16(this.d, rec + 0x24);
      const ptr = tb16(this.d, rec + 0x2e);
      const base = seg.base;
      const n = count > 0 && count < 300 ? count : 0;
      for (let i = 0; i < n; i++) {
        const child = base + tb16(this.d, base + ptr + 10 * i);
        if (child > seg.base && child < seg.filepos + seg.size && tb16(this.d, child + 4) === rec - base) {
          out.push(...this.emit(seg, child));
        }
      }
      if (!(this.d[rec + 0x1f] & 1)) out.forEach((obj) => { obj.hidden = true; });
      return out;
    }
    const hidden = !(this.d[rec + 0x1f] & 1);
    const bounds = [0, 2, 4, 6].map((step) => tb16s(this.d, rec + 0x0f + step));
    const obj = {
      kind: TB_CLASSES[kind] || "rect",
      bounds,
      fill: tbRgb(this.d, rec + 0x1b),
      outline: tbRgb(this.d, rec + 0x17),
      name: this.objectName(seg, rec),
      text: "",
      script: this.script(seg, rec),
    };
    if (hidden) obj.hidden = true;
    if (this.d[rec + 0x1f] & 0x40) {
      obj.fill = "#c0c0c0";
      obj.outline = "#000000";
    }
    const pattern = [0x8, 0x0c, 0x0d, 0x0f, 0x10].includes(kind) ? this.d[rec + 0x25] : 0xfe;
    if (pattern === 0xfd) obj.fill = "";
    if (kind === 0x0a) {
      obj.text = this.fieldText(seg, rec);
      obj.border = this.d[rec + 0x36];
      const font = this.fontEntry(tb16(this.d, rec + 0x22));
      if (font.font) obj.font = font.font;
      if (font.size) obj.size = font.size;
      obj.bold = !!font.bold;
      if (this.d[rec + 0x1f] & 0x02 || this.d[rec + 0x25] === 0xfd) obj.fill = "";
      if (!obj.text && !obj.name && obj.border === 1) return [];
    } else if (kind === 0x09) {
      obj.text = this.caption(seg, rec);
      const bmp = this.buttonBmp(seg, rec);
      if (bmp) obj.bmp = bmp;
    } else if (kind === 0x15 || kind === 0x19) {
      obj.kind = "image";
    }
    return [obj];
  }

  background(handle) {
    const seg = this.segs.get(handle >>> 16);
    if (!seg) return null;
    const rec = seg.base + 0x14;
    if (rec + 0x63 > this.d.length || tb16(this.d, rec - 2) !== 4) return null;
    const pattern = this.d[rec + 0x4b];
    return {
      fill: pattern === 0xfd ? "" : tbRgb(this.d, rec + 0x5b),
      width: tb16(this.d, rec + 0x5f),
      height: tb16(this.d, rec + 0x61),
      name: tbCstr(this.d, rec + 6, 32),
    };
  }

  pages() {
    if (!this.segs.size) return [];
    const book = this.layer(1);
    const bookSeg = this.segs.get(this.bookSeg());
    if (book == null || !bookSeg) return [];
    const head = bookSeg.base + tb16(this.d, book + 0x10);
    if (head + 6 > this.d.length) return [];
    const tables = tb16(this.d, head + 2);
    const found = [];
    for (let table = 0; table < tables && table < 32; table++) {
      const at = head + 6 + 6 * table;
      if (at + 6 > this.d.length) break;
      const count = tb16(this.d, at);
      const ref = tb32(this.d, at + 2);
      const seg = this.segs.get(ref >>> 16);
      if (!seg) continue;
      const rec = seg.base + (ref & 0xffff);
      if (rec + 5 > this.d.length) continue;
      const total = tb16(this.d, rec + 3);
      const n = Math.min(count || total, total);
      for (let i = 0; i < n && i < 2000; i++) {
        const row = rec + 5 + 13 * i;
        if (row + 13 > this.d.length) break;
        const pref = tb32(this.d, row + 8);
        found.push(pref);
      }
    }
    const pages = [];
    found.forEach((pref) => {
      const seg = this.segs.get(pref >>> 16);
      if (!seg) return;
      const rec = seg.base + (pref & 0xffff);
      if (rec < 2 || tb16(this.d, rec - 2) !== 5) return;
      const objects = [];
      const bg = this.background(tb32(this.d, rec + 0x47));
      const bookRec = this.layer(1);
      let width = bookRec ? tb16(this.d, bookRec + 0x20) : 9360;
      let height = bookRec ? tb16(this.d, bookRec + 0x1e) : 6624;
      if (bg && (bg.width || bg.height)) {
        width = bg.width || width;
        height = bg.height || height;
      }
      objects.push({
        kind: "rect",
        bounds: [0, 0, width, height],
        fill: bg ? bg.fill : "",
        outline: "",
        name: bg ? bg.name : "",
        text: "",
        script: "",
      });
      const bgHandle = tb32(this.d, rec + 0x47);
      const bgSeg = this.segs.get(bgHandle >>> 16);
      if (bg && bgSeg) {
        const brec = bgSeg.base + 0x14;
        this.children(bgSeg, brec - bgSeg.base).forEach((child) => objects.push(...this.emit(bgSeg, child)));
      }
      const parent = rec - seg.base;
      this.children(seg, parent).forEach((child) => objects.push(...this.emit(seg, child)));
      const id = tbCstr(this.d, rec + 6, 32) || ("Page" + pages.length);
      pages.push({ id, objects, script: this.script(seg, rec) });
    });
    return pages;
  }
}

function tbItemFromScript(name, script, fallback) {
  if (!script) return null;
  const go = /go\s+to\s+page\s+"([^"]+)"/i.exec(script);
  if (go) return { label: name || go[1], page: go[1] };
  const low = script.toLowerCase();
  if (low.includes("send next")) return { label: name || "Next", page: fallback.next || "" };
  if (low.includes("send previous") || low.includes("send back")) return { label: name || "Back", page: fallback.prev || "" };
  return null;
}

function tbShape(obj) {
  const bounds = obj.bounds || [0, 0, 0, 0];
  const x0 = tbPixel(bounds[0]);
  const y0 = tbPixel(bounds[1]);
  const x1 = tbPixel(bounds[2]);
  const y1 = tbPixel(bounds[3]);
  const shape = {
    kind: obj.kind || "rect",
    name: obj.name || "",
    x: x0,
    y: y0,
    w: Math.max(1, x1 - x0),
    h: Math.max(1, y1 - y0),
    text: obj.text || "",
    fill: obj.fill || "",
    outline: obj.outline || "",
    script: obj.script || "",
    size: obj.size || 0,
    bold: !!obj.bold,
    visible: !obj.hidden,
  };
  if (obj.bmp && obj.bmp[0] === 0x42 && obj.bmp[1] === 0x4d) {
    shape.data = tbB64(obj.bmp);
    shape.kind = "image";
  }
  return shape;
}

function readStoreBook(u8) {
  let store;
  try {
    store = new ToolStore(u8);
  } catch (err) {
    return null;
  }
  const rawPages = store.pages();
  if (!rawPages.length) return null;
  const ids = rawPages.map((page) => page.id);
  const pages = rawPages.map((page, index) => {
    const fallback = { next: ids[index + 1] || "", prev: ids[index - 1] || "" };
    const shapes = [];
    const text = [];
    const items = [];
    page.objects.forEach((obj) => {
      const shape = tbShape(obj);
      const item = tbItemFromScript(obj.name, obj.script, fallback);
      if (item) {
        shape.item = item;
        items.push(item);
      }
      if (shape.kind === "text" && shape.text && shape.visible !== false) text.push(shape.text);
      shapes.push(shape);
    });
    const pageItem = tbItemFromScript(page.id, page.script, fallback);
    if (pageItem) items.push(pageItem);
    return { id: page.id, text, items, shapes, script: page.script || "" };
  });
  return { id: "toolbook", title: "ToolBook", pages, format: "tbk" };
}

window.Toolbook = { read: readStoreBook };
