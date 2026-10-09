"""Turn a ToolBook lesson into a maybe2 lesson shell.

The shell is JSON the viewer already imports. Buttons keep the caption
from the book (Next, Back, Menu) and the page that caption opens, including
targets written as "P1270" rather than ("P1270"). A lesson menu is handed
to nida81. gotoMenuPage returns to nida81 P20001, not to the first page.

  python3 maybe2/translate.py path/to/lesson.tbk
  python3 maybe2/translate.py path/to/directory --out maybe2/lessonshells
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

MARK = bytes.fromhex("80650005000202")
NAV = {
    "Next",
    "Back",
    "Menu",
    "Exit",
    "Help",
    "Begin",
    "Directions",
    "Discussion",
    "Summary",
}
SKIP_TEXT = (
    "setupquizex",
    "maximum number of times",
    "insufficient questions",
    "already in the quiz",
    "to handle",
    "contact your instructor",
)


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
    """Quoted page ids, in the lesson or not.

    Nida pages are not in the lesson. Next is sometimes stored as "P1270"
    rather than ("P1270"). Both forms are targets.
    """
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
        elif line.startswith("Title:"):
            m = re.search(r"Title:\s*([A-Z][A-Z ]*[A-Z])", line)
            line = f"Title: {m.group(1).strip()}" if m else ""
        elif re.match(r"^(Filename|Revision Date|Language|Version|Trainers|Quiz|Quiz Help):", line):
            line = line.split("  ")[0].strip()
        elif len(line) < 40 or " " not in line:
            letters = re.sub(r"[^A-Za-z]", "", line)
            if (
                letters
                and letters.isupper()
                and 8 <= len(letters) <= 40
                and "TITLE" not in line
                and "INFONM" not in line
                and not line.endswith("ERE")
                and not re.search(r"(.)\1{2,}", line)
            ):
                pass
            elif title and line.upper().startswith(title.upper()):
                line = title
            else:
                continue
        if line and line not in out:
            out.append(line)
    if any("this lesson is about" in line.lower() for line in out) and title and title not in out:
        out.append(title)
    return out[:8]


def lesson_title(ss_all: list[str], stem: str) -> str:
    for s in ss_all:
        m = re.search(r"Title:\s*([A-Z][A-Z ]*[A-Z])", s)
        if m:
            return m.group(1).strip().title()
    return stem


def assessment_page(page_strings: dict[str, list[str]]) -> str | None:
    for name, ss in page_strings.items():
        for s in ss:
            if 'setupQuizEx("Assessment"' in s:
                return name
    return None


def summary_page(name: str, page_strings: dict[str, list[str]], ids: dict[str, str]) -> str | None:
    """A quoted summary id sometimes is not a page. Use the page that closes this menu."""
    for other, ss in page_strings.items():
        if other == name:
            continue
        if not any("completes" in s.lower() for s in ss):
            continue
        if name in quoted_targets(ss, ids) or any(name.lower() == s.lower() for s in ss):
            return other
    return None


def build_page(
    name: str,
    ss: list[str],
    ids: dict[str, str],
    title: str,
    quiz_page: str | None,
    page_strings: dict[str, list[str]],
) -> dict:
    known = set(ids.values())
    targets = [t for t in quoted_targets(ss, ids) if t != name]
    in_book = [t for t in targets if t in known]
    external = [t for t in targets if t not in known]
    caps = captions(ss)
    show_title = title if "this lesson is about" in " ".join(ss).lower() else ""
    text = prose(ss, show_title)
    if not text and any("setupQuizEx" in s for s in ss):
        text = ["ASSESSMENT"]
    items: list[dict] = []
    used: set[int] = set()

    content = [(i, cap) for i, cap in enumerate(caps) if re.match(r"^\d+\.", cap) or cap in ("Discussion", "Summary")]
    for i, cap in content:
        if not in_book:
            break
        used.add(i)
        items.append({"label": cap, "page": in_book.pop(0)})
    for i, cap in content:
        if i in used:
            continue
        if cap == "Summary":
            dest = summary_page(name, page_strings, ids)
            if dest:
                used.add(i)
                items.append({"label": cap, "page": dest})
                continue
        if quiz_page and "quiz" in cap.lower() and "gotoQuizPage" in " ".join(ss):
            used.add(i)
            items.append({"label": cap, "page": quiz_page})

    for label in ("Next", "Back"):
        if label not in caps or not in_book:
            continue
        if any(item["label"] == label for item in items):
            continue
        items.append({"label": label, "page": in_book.pop(0)})

    joined = " ".join(ss)
    calls_menu = "gotoMenuPage" in joined
    mentions_nida = "nida81.tbk" in joined.lower()
    if calls_menu:
        stray = [t for t in targets if t not in known and t not in ("P20001", "P10020")]
        objective = "Discussion" in caps or "Summary" in caps
        if "Menu" in caps and any(item["label"] == "Back" for item in items):
            label = "Menu"
        elif stray and "Menu" in caps and not objective:
            label = "Menu"
        elif "Back" in caps:
            label = "Back"
        else:
            label = "Menu"
        items.append({"label": label, "page": "P20001", "book": "nida81.tbk"})
    elif mentions_nida and "P20001" in external and "Next" in caps:
        items.append({"label": "Next", "page": "P20001", "book": "nida81.tbk"})
    if "Directions" in caps and mentions_nida:
        items.append({"label": "Directions", "page": "P10020", "book": "nida81.tbk"})
    if "Exit" in caps and mentions_nida and not any(item["label"] == "Exit" for item in items):
        items.append({"label": "Exit", "page": "P20001", "book": "nida81.tbk"})
    if "Begin" in caps and not any(item["label"] == "Begin" for item in items):
        items.append({"label": "Begin", "page": name})

    page: dict = {"id": name, "text": text, "jumps": [], "sends": []}
    if items:
        page["items"] = items
    return page


def translate(path: Path) -> dict:
    data = path.read_bytes()
    raw_pages = pages_of(data)
    ids = {name.lower(): name for name, _ in raw_pages}
    page_strings = {name: strings(blob) for name, blob in raw_pages}
    title = lesson_title([s for ss in page_strings.values() for s in ss], path.stem)
    quiz = assessment_page(page_strings)
    order = [name for name, _ in raw_pages]
    pages = []
    for index, name in enumerate(order):
        page = build_page(name, page_strings[name], ids, title, quiz, page_strings)
        blob = " ".join(page_strings[name]).lower()
        if not page.get("items") and index + 1 < len(order):
            if "federal copyright" in blob and "lesson info" not in blob:
                page["jumps"] = [order[index + 1]]
                page["continue"] = "Acknowledge"
            elif "lesson info" in blob:
                page["jumps"] = [order[index + 1]]
                page["continue"] = "Continue"
        pages.append(page)
    menu = []
    for name in order:
        if any("LESSON MENU" in s.upper() for s in page_strings[name]):
            page = next(p for p in pages if p["id"] == name)
            for item in page.get("items") or []:
                if "book" not in item:
                    menu.append({"label": item["label"], "page": item["page"]})
            break
    shells = []
    for s in (t for ss in page_strings.values() for t in ss):
        low = s.lower().strip().strip('"')
        if low.endswith(".sbk") or low == "nida81.tbk":
            if low not in shells:
                shells.append(low)
    return {"id": path.stem, "title": title, "shells": shells, "pages": pages, "menu": menu}


def write_lesson(path: Path, dest: Path) -> Path:
    lesson = translate(path)
    dest.mkdir(parents=True, exist_ok=True)
    out = dest / f"{path.stem}.json"
    out.write_text(json.dumps(lesson), encoding="utf-8")
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Translate ToolBook lessons into maybe2 JSON shells")
    parser.add_argument("book", help="A .tbk file or a directory of them")
    parser.add_argument("--out", default=str(Path(__file__).resolve().parent / "lessonshells"))
    args = parser.parse_args(argv)
    source = Path(args.book)
    dest = Path(args.out)
    books = sorted(source.glob("*.tbk")) if source.is_dir() else [source]
    if not books:
        print(f"no books in {source}", file=sys.stderr)
        return 1
    for book in books:
        out = write_lesson(book, dest)
        print(f"{book.name} -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
