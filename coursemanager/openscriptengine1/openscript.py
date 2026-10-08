#!/usr/bin/env python3
"""Pull OpenScript inputs out of a ToolBook II 8.1 course book.

Three outputs, matching the three missing engine inputs:

  handlers   raw handler slices (the corpus)
  widgets    captions found in the page chunk (names, not bounds)
  opcodes    byte frequencies inside handler streams

The opcode *names* are not in the book. They come from
artifacts/unpacked/TB80CMP.DLL COMPILEREXPANDTEXT
(decompile: Decompile 2.0/New1/TB80CMP.DLL.c line 4237).
This script records the bytes that call has to name.

Widget bounds are the nested 14 00 00 chunk. This script records the
caption sitting in that chunk. The id and rectangle are still unnamed;
property 0x4004 in TB80BAS is the getter.
"""

import argparse
import collections
import json
import re
from pathlib import Path

MARK = bytes.fromhex("80650005000202")
HANDLER = re.compile(rb"(?i)to handle [A-Za-z][A-Za-z0-9]*")
GO = re.compile(rb'\("?(P[A-Z0-9]+)"?\)')


def cstr(buf, off, n):
    out = []
    for i in range(n):
        if off + i >= len(buf):
            break
        c = buf[off + i]
        if c == 0 or c < 32 or c > 126:
            break
        out.append(chr(c))
    return "".join(out)


def pages(data):
    hits = []
    start = 0
    while True:
        i = data.find(MARK, start)
        if i < 0:
            break
        hits.append(i)
        start = i + 1
    found = []
    for n, off in enumerate(hits):
        nxt = hits[n + 1] if n + 1 < len(hits) else len(data)
        name = cstr(data, off + 11, 32)
        if not name.startswith("P"):
            continue
        found.append((name, off, data[off:nxt]))
    return found


def field_text(blob):
    out = []
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
        if raw[0] not in (0x0d, 0x0a):
            continue
        text = raw.replace(b"\r", b"").decode("latin1").strip()
        if len(text) >= 8 and text not in out:
            out.append(text)
    return out


def captions(blob):
    want = (b"Next", b"Back", b"Continue", b"Done", b"Menu")
    found = []
    for word in want:
        if word in blob and word.decode() not in found:
            found.append(word.decode())
    return found


def handlers(blob):
    found = []
    for match in HANDLER.finditer(blob):
        start = match.start()
        end = blob.find(b"END", start)
        if end < 0 or end - start > 4000:
            end = min(len(blob), start + 240)
        else:
            end += 3
        raw = blob[start:end]
        kind = match.group().split()[-1].decode("latin1")
        goes = [m.group(1).decode() for m in GO.finditer(raw)]
        found.append({
            "kind": kind,
            "off": start,
            "goes": goes,
            "text": "".join(chr(c) if 32 <= c < 127 else "." for c in raw[:180]),
            "hex": raw[:180].hex(),
        })
    return found


def opcode_bytes(raw_hex_rows):
    counts = collections.Counter()
    for row in raw_hex_rows:
        raw = bytes.fromhex(row["hex"])
        i = 0
        while i < len(raw):
            c = raw[i]
            if c >= 0x80:
                counts[c] += 1
            i += 1
    return counts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("tbk")
    parser.add_argument("out", nargs="?", default="openscript_corpus.json")
    args = parser.parse_args()
    data = Path(args.tbk).read_bytes()
    book = []
    op_rows = []
    for name, off, blob in pages(data):
        hands = handlers(blob)
        if hands:
            op_rows.extend(hands)
        book.append({
            "page": name,
            "file": off,
            "captions": captions(blob),
            "goes": [m.group(1).decode() for m in GO.finditer(blob)],
            "fields": field_text(blob)[:4],
            "handlers": hands,
        })
    ops = opcode_bytes(op_rows)
    report = {
        "book": args.tbk,
        "pages": len(book),
        "pages_with_handlers": sum(1 for p in book if p["handlers"]),
        "handlers": sum(len(p["handlers"]) for p in book),
        "opcode_bytes": [{"byte": f"{b:02x}", "count": n} for b, n in ops.most_common()],
        "pages_detail": [p for p in book if p["handlers"] or p["goes"] or p["fields"]],
    }
    dest = Path(args.out)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(report, indent=2))
    print(f"pages {report['pages']} handlers {report['handlers']} -> {dest}")
    print("top opcodes", " ".join(f"{b:02x}:{n}" for b, n in ops.most_common(8)))


if __name__ == "__main__":
    main()
