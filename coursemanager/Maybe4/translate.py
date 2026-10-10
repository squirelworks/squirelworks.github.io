"""Maybe4 translator: ToolBook lesson -> JSON shell with OpenScript decoding.

Same output format as Maybe2 (id, title, shells, pages, menu) but uses the
OpenScript bytecode decoder (resource 0x77 keywords) to extract real handler
source. Jumps and sends are taken from the decoded "go to page" / "send"
statements when present, falling back to the string-scan method.

  python3 translate.py path/to/lesson.tbk
  python3 translate.py path/to/directory --out lessonshells
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# Local decoder + keyword table
sys.path.insert(0, str(Path(__file__).parent))
from openscript_decode import load_keywords, decode  # type: ignore

MARK = bytes.fromhex("80650005000202")
NAV = {
    "Next", "Back", "Menu", "Exit", "Help", "Begin",
    "Directions", "Discussion", "Summary",
}
SKIP_TEXT = (
    "setupquizex", "maximum number of times", "insufficient questions",
    "already in the quiz", "to handle", "contact your instructor",
)

KEYWORDS: list[str] = []


def load_kw() -> list[str]:
    global KEYWORDS
    if not KEYWORDS:
        res = Path(__file__).parent / "res_77.bin"
        if not res.exists():
            res = Path("/workspace/artifacts/res_77.bin")
        KEYWORDS = load_keywords(res)
    return KEYWORDS


def pages_of(data: bytes) -> list[tuple[str, bytes]]:
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
        raw = data[off + 11 : off + 43].split(b"\0", 1)[0]
        name = raw.decode("latin1", "replace")
        if name.startswith("P") and name[1:].isdigit():
            found.append((name, data[off:nxt]))
    return found


def extract_handlers(blob: bytes) -> list[tuple[str, str]]:
    """Find 'To Handle Name' headers and decode the following bytecode body."""
    kw = load_kw()
    out: list[tuple[str, str]] = []
    pat = re.compile(rb"(?i)to handle ([A-Za-z][A-Za-z0-9]*)")
    for m in pat.finditer(blob):
        name = m.group(1).decode("latin1")
        body_start = m.end()
        # body until plain END or next handler or 4k
        end = blob.find(b"END", body_start)
        if end < 0 or end - body_start > 4000:
            end = min(len(blob), body_start + 800)
        else:
            end = min(end + 3, len(blob))
        body = blob[body_start:end]
        try:
            text = decode(body, kw)
        except Exception:
            text = ""
        # clean leading noise
        text = text.strip()
        if text:
            out.append((name, text))
    return out


def parse_script(text: str, ids: dict[str, str]) -> dict:
    """Pull page targets and sends from decoded OpenScript."""
    jumps: list[str] = []
    sends: list[str] = []
    # go to page "Pxxx" or go to page Pxxx
    for m in re.finditer(r'go\s+to\s+page\s+"?([Pp]\d+)"?', text, re.I):
        token = m.group(1).upper()
        name = ids.get(token.lower(), token)
        if name not in jumps:
            jumps.append(name)
    # send Foo or send Foo to ...
    for m in re.finditer(r'\bsend\s+([A-Za-z][A-Za-z0-9]*)', text, re.I):
        s = m.group(1)
        if s not in sends:
            sends.append(s)
    # buttonClick handlers often set nextpage = "Pxxx"
    for m in re.finditer(r'nextpage\s*=\s*"?([Pp]\d+)"?', text, re.I):
        token = m.group(1).upper()
        name = ids.get(token.lower(), token)
        if name not in jumps:
            jumps.append(name)
    return {"jumps": jumps, "sends": sends}


def strings(blob: bytes) -> list[str]:
    cur: list[str] = []
    out: list[str] = []
    for c in blob:
        if 32 <= c < 127:
            cur.append(chr(c))
        else:
            if cur:
                out.append("".join(cur))
            cur = []
    if cur:
        out.append("".join(cur))
    return out


def canonical(token: str, ids: dict[str, str]) -> str | None:
    return ids.get(token.lower())


def quoted_targets(ss: list[str], ids: dict[str, str]) -> list[str]:
    out = []
    for s in ss:
        m = re.fullmatch(r'\s*(?:\(\s*)?\"([Pp]\d+)\"(?:\s*\))?\s*', s)
        if not m:
            continue
        token = m.group(1)
        name = canonical(token, ids) or token.upper()
        if not out or out[-1] != name:
            out.append(name)
    return out


def captions(ss: list[str]) -> list[str]:
    out = []
    for s in ss:
        text = " ".join(s.replace("*", " ").split())
        text = re.sub(r"^[\-\s]+", "", text)
        if text in NAV:
            out.append(text)
            continue
        first = text.split("  ")[0].strip()
        if re.match(r"^\d+\.\s+\S", first) and len(first) < 80:
            out.append(first)
    return out


def prose(ss: list[str], title: str) -> list[str]:
    out = []
    for s in ss:
        line = " ".join(s.split())
        low = line.lower()
        if any(bad in low for bad in SKIP_TEXT):
            continue
        if line.startswith("Hello, this lesson is about"):
            line = "Hello, this lesson is about:"
        if "?" in line:
            line = re.sub(r"\?\.+$", "?", line)
        if re.fullmatch(r"[\W_]+", line):
            continue
        if len(line) < 4:
            continue
        if line and line not in out:
            out.append(line)
    return out[:16]


def build_page(name: str, blob: bytes, ss: list[str], ids: dict[str, str], title: str) -> dict:
    handlers = extract_handlers(blob)
    script_jumps: list[str] = []
    script_sends: list[str] = []
    handler_text: list[str] = []
    for hname, htext in handlers:
        parsed = parse_script(htext, ids)
        for j in parsed["jumps"]:
            if j not in script_jumps and j != name:
                script_jumps.append(j)
        for s in parsed["sends"]:
            if s not in script_sends:
                script_sends.append(s)
        handler_text.append(f"To Handle {hname}\n{htext}")

    # fallback string scan
    targets = [t for t in quoted_targets(ss, ids) if t != name]
    known = set(ids.values())
    in_book = [t for t in targets if t in known]
    caps = captions(ss)
    text = prose(ss, title)

    # prefer script-derived jumps when available
    jumps = script_jumps if script_jumps else in_book[:4]
    sends = script_sends

    page: dict = {
        "id": name,
        "text": text,
        "jumps": jumps,
        "sends": sends,
    }
    if handler_text:
        page["script"] = "\n\n".join(handler_text)
    # simple nav items from captions
    items = []
    used = set()
    for cap in caps:
        if cap in used:
            continue
        used.add(cap)
        # map caption to a jump if we have one
        dest = jumps[0] if jumps else None
        if dest:
            items.append({"label": cap, "page": dest})
    if items:
        page["items"] = items
    return page


def lesson_title(ss_all: list[str], stem: str) -> str:
    for s in ss_all:
        if "this lesson is about" in s.lower():
            return stem.replace("_", " ").title()
    return stem.replace("_", " ").title()


def translate(path: Path) -> dict:
    data = path.read_bytes()
    pages_raw = pages_of(data)
    if not pages_raw:
        return {"id": path.stem, "title": path.stem, "shells": [], "pages": [], "menu": []}
    ids = {name.lower(): name for name, _ in pages_raw}
    page_strings: dict[str, list[str]] = {}
    blobs: dict[str, bytes] = {}
    all_ss: list[str] = []
    for name, blob in pages_raw:
        ss = strings(blob)
        page_strings[name] = ss
        blobs[name] = blob
        all_ss.extend(ss)
    title = lesson_title(all_ss, path.stem)
    pages = []
    for name, _ in pages_raw:
        pages.append(build_page(name, blobs[name], page_strings[name], ids, title))
    # shells
    shells = []
    for s in all_ss:
        low = s.lower().strip().strip('"')
        if low.endswith(".sbk") or low == "nida81.tbk":
            if low not in shells:
                shells.append(low)
    # simple menu from first LESSON MENU page
    menu = []
    for p in pages:
        if any("LESSON MENU" in line.upper() for line in p.get("text") or []):
            for item in p.get("items") or []:
                menu.append({"label": item["label"], "page": item["page"]})
            break
    return {"id": path.stem, "title": title, "shells": shells, "pages": pages, "menu": menu}


def write_lesson(path: Path, dest: Path) -> Path:
    dest.mkdir(parents=True, exist_ok=True)
    data = translate(path)
    out = dest / f"{path.stem}.json"
    out.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return out


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("src", type=Path, help="TBK file or directory")
    ap.add_argument("--out", type=Path, default=Path("lessonshells"))
    args = ap.parse_args(argv)
    src: Path = args.src
    if src.is_file():
        out = write_lesson(src, args.out)
        print(out)
    else:
        for p in sorted(src.glob("*.tbk")):
            out = write_lesson(p, args.out)
            print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
