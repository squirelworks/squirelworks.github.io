#!/usr/bin/env python3
"""Dump as much of a ToolBook lesson as the page records hold.

    python interpreter.py lesson.tbk
    python interpreter.py D:\\courses\\courses --out courses
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

MARK = bytes.fromhex("80650005000202")
HERE = Path(__file__).resolve().parent


def word(blob, off):
    return int.from_bytes(blob[off:off + 2], "little")


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
        length = word(blob, i + 14)
        if length < 8 or i + 16 + length > len(blob):
            continue
        raw = blob[i + 16:i + 16 + length]
        if raw[:1] not in (b"\r", b"\n"):
            continue
        text = raw.replace(b"\r", b"").decode("latin-1").strip()
        if not text:
            continue
        found.append({
            "kind": "field",
            "text": text,
            "x": word(blob, i + 6),
            "y": word(blob, i + 8),
            "w": word(blob, i + 12),
            "h": word(blob, i + 14),
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


def buttons(blob):
    found = []
    for caption in (b"Next", b"Back", b"Menu", b"Exit", b"Help", b"Begin"):
        if caption in blob and caption.decode() not in found:
            found.append(caption.decode())
    return found


def sections(blob):
    found = []
    start = 0
    while True:
        i = blob.find(b"\x14\x00\x00", start)
        if i < 0:
            break
        found.append({"offset": i, "mark": blob[i:i + 4].hex()})
        start = i + 1
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
        out.append({
            "name": name,
            "offset": off,
            "size": len(blob),
            "id": int.from_bytes(blob[7:11], "little"),
            "jumps": jumps(blob),
            "buttons": buttons(blob),
            "fields": fields(blob),
            "sections": sections(blob),
            "strings": strings(blob)[:80],
            "bm": blob.count(b"BM"),
            "jpeg": blob.count(b"\xff\xd8\xff"),
        })
    return out


def dump(path: Path, out_dir: Path) -> Path:
    data = path.read_bytes()
    payload = {"file": path.name, "size": len(data), "pages": pages(data)}
    dest = out_dir / f"{path.stem.lower()}.json"
    dest.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"{dest} pages {len(payload['pages'])}")
    return dest


def main():
    if len(sys.argv) < 2:
        raise SystemExit("usage: python interpreter.py <file.tbk | directory> [--out courses]")
    src = Path(sys.argv[1])
    out = HERE / "courses"
    if "--out" in sys.argv:
        out = Path(sys.argv[sys.argv.index("--out") + 1])
    out.mkdir(parents=True, exist_ok=True)
    books = [src] if src.is_file() else sorted(src.glob("*.tbk")) + sorted(src.glob("*.TBK"))
    for path in books:
        dump(path, out)


if __name__ == "__main__":
    main()
