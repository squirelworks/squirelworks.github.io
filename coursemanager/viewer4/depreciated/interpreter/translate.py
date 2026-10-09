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
        if "?" in line:
            line = re.sub(r"\?\.+$", "?", line)
        if re.fullmatch(r"[\W_]+", line):
            continue
        if line.startswith("Title:"):
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


def clean_choice(raw: str) -> str:
    text = raw.strip()
    text = re.sub(r"(irst|cond|ird|st|nd|rd)\s+Choice.*$", "", text, flags=re.I)
    text = re.sub(r"(ceett|oicett).*$", "", text, flags=re.I)
    text = re.sub(r"74N\s+E\d+.*$", "", text)
    if re.fullmatch(r"\d{5}", text) and text.endswith("0"):
        text = text[:-1]
    text = re.sub(r"ett+$", "", text)
    text = re.sub(r"t{3,}$", "", text)
    return text.strip()


def quiz_choices(ss: list[str]) -> list[dict]:
    starts = [i for i, s in enumerate(ss) if s == "Back"]
    start = None
    for i in starts:
        window = ss[i + 1 : i + 12]
        if any(re.fullmatch(r"incorrect\d*|correct", s, re.I) for s in window):
            start = i
            break
    if start is None:
        return []
    pending: bool | None = None
    found = []
    for s in ss[start + 1 : start + 24]:
        if s.startswith("ASYM") or s in ("Question", "questionbox", "true", "false"):
            if found:
                break
            continue
        if re.fullmatch(r"incorrect\d*|correct", s, re.I):
            pending = s.lower() == "correct"
            continue
        if len(s.strip()) < 2:
            continue
        label = clean_choice(s)
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9 .+/_-]{0,40}", label or ""):
            continue
        if pending is None:
            if found and label not in {choice["label"] for choice in found}:
                found.append({"label": label, "correct": False})
            continue
        found.append({"label": label, "correct": pending})
        pending = None
    choices = []
    seen = set()
    for choice in found:
        if choice["label"] in seen:
            continue
        seen.add(choice["label"])
        choices.append(choice)
    if len(choices) < 2 or not any(choice["correct"] for choice in choices):
        return []
    return choices


def question_text(ss: list[str]) -> str:
    best = ""
    for s in ss:
        line = " ".join(s.split())
        line = re.sub(r"\?\.+$", "?", line)
        if "?" not in line or len(line) < 24 or not line[:1].isalpha():
            continue
        if len(line) > len(best):
            best = line
    return best


def quiz_next(ss: list[str], ids: dict[str, str], questions: set[str], again: str | None) -> str | None:
    assigned = []
    for s in ss:
        m = re.fullmatch(r'\s*=\s*"([Pp]\d+)"\s*', s)
        if not m:
            continue
        name = canonical(m.group(1), ids)
        if name and name != again:
            assigned.append(name)
    for name in assigned:
        if name in questions:
            return name
    return assigned[0] if assigned else None


def quiz_again(ss: list[str], ids: dict[str, str]) -> str | None:
    armed = False
    for s in ss:
        if "incorrectEmbedded" in s:
            armed = True
            continue
        if not armed:
            continue
        m = re.search(r'"([Pp]\d+)"', s)
        if m:
            return canonical(m.group(1), ids)
    return None


def is_help_page(ss: list[str]) -> bool:
    return "HelpBack" in ss or "HelpNext" in ss


def definition_text(ss: list[str]) -> list[str]:
    lines = []
    for s in ss:
        line = " ".join(s.split())
        if line == "DEFINITION" or (len(line) > 24 and " - " in line and line[:1].isalpha()):
            if line not in lines:
                lines.append(line)
    return lines or ["Definition"]


def hotword(ss: list[str], text: list[str], definition: list[str]) -> str | None:
    blob = " ".join(text)
    for line in definition:
        if " - " not in line:
            continue
        term = line.split(" - ", 1)[0].strip()
        if re.search(rf"\b{re.escape(term)}\b", blob, re.I):
            return term.title() if term.isupper() else term
    skip = {"next", "back", "definition", "true", "false", "helpback", "helpnext"}
    for s in ss:
        word = s.strip()
        if word.lower() in skip or not re.fullmatch(r"[A-Za-z][A-Za-z-]{2,30}", word):
            continue
        if re.search(rf"\b{re.escape(word)}\b", blob, re.I):
            return word
    return None


def clean_stem(raw: str) -> str:
    text = " ".join(raw.split())
    for junk in ("chased him", "brown dog", "the fence", "him over"):
        at = text.lower().find(junk)
        if at > 0:
            text = text[:at]
    mark = re.search(r"_+", text)
    if mark:
        text = text[: mark.end()]
    elif "?" in text:
        text = text[: text.index("?") + 1]
    return text.strip()


def clean_pool_choice(raw: str) -> str:
    text = " ".join(raw.split())
    text = re.sub(r"\.?\s*choice is d.*$", "", text, flags=re.I)
    text = re.sub(r"\.?(?:hoice|oice).*$", "", text, flags=re.I)
    text = re.sub(r"ice\s+[ABCD]$", "", text)
    text = re.sub(r"(?:ce|e)\s+[ABCD]$", "", text)
    text = re.sub(r"[\s.][ABCD]$", "", text)
    text = re.sub(r"(?<=\d)[ABCD]$", "", text)
    return text.strip(" .")


def question_number(ss: list[str]) -> int | None:
    for index, token in enumerate(ss):
        if token == "QuestionNo" and index and ss[index - 1].isdigit():
            return int(ss[index - 1])
    return None


def pool_key(blob: bytes) -> str | None:
    at = blob.find(b"Answer\x00")
    if at < 0:
        return None
    letters = [chr(byte) for byte in blob[max(0, at - 8) : at] if chr(byte) in "ABCD"]
    return letters[-1] if letters else None


def pool_choices(ss: list[str], key: str | None) -> list[dict]:
    start = next((i for i, s in enumerate(ss) if "?" in s and len(s) > 20 and "distractor" not in s.lower()), None)
    if start is None or key is None:
        return []
    window = ss[start + 1 : start + 90]
    found: list[tuple[str, str | None]] = []
    for index, token in enumerate(window):
        low = token.lower().strip()
        if token in ("true", "false", "XXXX") or token.startswith("ASYM") or low.startswith("this is the "):
            continue
        if low.startswith("choice is d") or re.fullmatch(r"P\d+", token):
            continue
        nxt = window[index + 1].lower() if index + 1 < len(window) else ""
        remnant = re.search(r"hoice|oice|ce [ABCD]|e [ABCD]", token, re.I)
        attached = "choice is d" in low
        followed = "distractor" in nxt or nxt.strip().startswith("choice is d")
        label = clean_pool_choice(token)
        plain = bool(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9 .+/x_-]{0,28}", label or ""))
        if not (remnant or attached or followed or plain):
            continue
        if not label or len(label) > 40:
            continue
        if len(label) < 2 and not (label.isdigit() and remnant):
            continue
        if any(label == earlier for earlier, _ in found):
            continue
        letter = None
        mark = re.search(r"(?:hoice|oice|ice|ce|e|[\s.])\s*([ABCD])\s*$", token.strip(), re.I)
        if mark:
            letter = mark.group(1).upper()
        found.append((label, letter))
        if len(found) == 4:
            break
    if len(found) < 2:
        return []
    used = {letter for _, letter in found if letter}
    spare = [letter for letter in "ABCD" if letter not in used]
    choices = []
    for label, letter in found:
        if letter is None and spare:
            letter = spare.pop(0)
        choices.append({"label": label, "correct": letter == key})
    if not any(choice["correct"] for choice in choices):
        return []
    return choices


def attach_assessment(pages: list[dict], page_strings: dict[str, list[str]], blobs: dict[str, bytes]) -> None:
    """Begin starts the pool named on the assessment page. Attempts stay first-time."""
    numbered = []
    for page in pages:
        ss = page_strings[page["id"]]
        number = question_number(ss)
        stem = clean_stem(next((s for s in ss if "?" in s and len(s) > 20 and "distractor" not in s.lower()), ""))
        choices = pool_choices(ss, pool_key(blobs[page["id"]]))
        if number is None or not stem or not choices:
            continue
        page["text"] = [stem]
        page["quiz"] = {"choices": choices, "scored": True, "number": number}
        numbered.append((number, page["id"]))
    by_number = {number: page_id for number, page_id in numbered}
    for page in pages:
        ss = page_strings[page["id"]]
        joined = " ".join(ss)
        setup = re.search(
            r'setupQuizEx\("([^"]+)",\s*(\d+),\s*"(P\d+)",\s*"(P\d+)",\s*"(P\d+)"\)',
            joined,
        )
        if not setup:
            continue
        ranges = [
            (int(objective), int(start), int(end))
            for objective, start, end, _count in re.findall(
                r"(?:addObjectiveToPool|\(\()\s*\(?\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)",
                joined,
            )
        ]
        picked = []
        for objective, start, end in ranges:
            for number in range(start, end + 1):
                page_id = by_number.get(number)
                if not page_id:
                    continue
                current = next(item for item in pages if item["id"] == page_id)
                current["quiz"]["objective"] = objective
                picked.append(page_id)
        review_id = next(
            (
                item["id"]
                for item in pages
                if any("Review These Objectives" in s for s in page_strings[item["id"]])
            ),
            setup.group(5),
        )
        if not picked:
            continue
        sequence = picked + [review_id]
        for index, page_id in enumerate(picked):
            current = next(item for item in pages if item["id"] == page_id)
            current["quiz"]["next"] = sequence[index + 1]
        targets = {}
        for item in pages:
            for button in item.get("items") or []:
                label = re.sub(r"\s+", " ", button["label"]).strip()
                if re.match(r"^\d+\.", label) and "book" not in button:
                    targets.setdefault(label, button["page"])
        review_lines = []
        for token in page_strings[review_id]:
            label = re.sub(r"X+$", "", " ".join(token.split())).strip()
            label = re.sub(r"\s+", " ", label)
            if re.match(r"^\d+\.\s+[A-Za-z]", label) and len(label) < 80:
                review_lines.append(label)
        review = []
        for index, label in enumerate(review_lines):
            objective = ranges[index][0] if index < len(ranges) else index + 1
            dest = targets.get(label)
            if dest:
                review.append({"label": label, "objective": objective, "page": dest})
        closing = next(item for item in pages if item["id"] == review_id)
        closing["text"] = ["Review These Objectives"]
        closing["review"] = review
        if not any(button["label"] == "Menu" for button in closing.get("items") or []):
            closing.setdefault("items", []).append({"label": "Menu", "page": "P20001", "book": "nida81.tbk"})
        for item in page.get("items") or []:
            if item["label"] == "Begin":
                item["page"] = picked[0]
                item.pop("book", None)


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


def nearest_lower(token: str, pages: list[str]) -> str | None:
    """A quoted page id sometimes is not in the book. Use the closest earlier page."""
    if not re.fullmatch(r"P\d+", token):
        return None
    number = int(token[1:])
    best = None
    gap = None
    for page in pages:
        if not re.fullmatch(r"P\d+", page):
            continue
        current = int(page[1:])
        if current >= number:
            continue
        distance = number - current
        if gap is None or distance < gap:
            best, gap = page, distance
    return best


def nearest_higher(token: str, pages: list[str]) -> str | None:
    if not re.fullmatch(r"P\d+", token):
        return None
    number = int(token[1:])
    best = None
    gap = None
    for page in pages:
        if not re.fullmatch(r"P\d+", page):
            continue
        current = int(page[1:])
        if current <= number:
            continue
        distance = current - number
        if gap is None or distance < gap:
            best, gap = page, distance
    return best


def safeguard(pages: list[dict], page_strings: dict[str, list[str]], ids: dict[str, str]) -> None:
    """Repair buttons that point at a page the book does not contain.

    A Back or Next caption sometimes names an id that was never a page, as
    P2930 names P2920. Point Back at the closest earlier real page and Next
    at the closest later one. If Back is still missing, use the page whose
    Next opens this one.
    """
    known = {page["id"] for page in pages}
    order = [page["id"] for page in pages]
    system = {"P20001", "P10020"}

    for page in pages:
        kept = []
        for item in page.get("items") or []:
            if item.get("book") or item["page"] in known or item["page"] in system:
                kept.append(item)
                continue
            dest = None
            if item["label"] == "Back":
                dest = nearest_lower(item["page"], order)
            elif item["label"] == "Next":
                dest = nearest_higher(item["page"], order)
            if dest and dest != page["id"] and dest in known:
                kept.append({**item, "page": dest})
        if kept:
            page["items"] = kept
        else:
            page.pop("items", None)

    for page in pages:
        if page.get("kind") == "help":
            continue
        caps = captions(page_strings.get(page["id"], []))
        have = {item["label"] for item in page.get("items") or []}
        targets = [t for t in quoted_targets(page_strings.get(page["id"], []), ids) if t != page["id"]]
        if "Back" in caps and "Back" not in have:
            dest = None
            for token in targets:
                if token in known or token in system:
                    continue
                dest = nearest_lower(token, order)
                if dest == page["id"]:
                    dest = None
            if dest is None:
                for other in pages:
                    if any(
                        item["label"] == "Next" and item.get("page") == page["id"] and not item.get("book")
                        for item in other.get("items") or []
                    ):
                        dest = other["id"]
                        break
            if dest and dest != page["id"]:
                page.setdefault("items", []).append({"label": "Back", "page": dest})
        if "Next" in caps and "Next" not in have:
            dest = None
            for token in targets:
                if token in known or token in system:
                    continue
                dest = nearest_higher(token, order)
                if not dest or dest == page["id"]:
                    dest = None
                    continue
                break
            if dest and dest != page["id"]:
                page.setdefault("items", []).append({"label": "Next", "page": dest})


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
    help_ids = {n for n, page_ss in page_strings.items() if is_help_page(page_ss)}
    if name in help_ids:
        return {"id": name, "kind": "help", "text": definition_text(ss), "jumps": [], "sends": []}
    targets = [t for t in quoted_targets(ss, ids) if t != name]
    in_book = [t for t in targets if t in known and t not in help_ids]
    help_targets = [t for t in targets if t in help_ids]
    external = [t for t in targets if t not in known]
    caps = captions(ss)
    show_title = title if "this lesson is about" in " ".join(ss).lower() else ""
    text = prose(ss, show_title)
    if not text and any("setupQuizEx" in s for s in ss):
        text = ["ASSESSMENT"]
    items: list[dict] = []
    used: set[int] = set()
    rank = {page_name: index for index, page_name in enumerate(page_strings)}

    if "Next" in caps:
        later = [t for t in in_book if rank.get(t, -1) > rank.get(name, 0)]
        earlier = [t for t in in_book if rank.get(t, -1) < rank.get(name, 0)]
        if "Next" in caps:
            dest = later[0] if later else (in_book[0] if in_book else None)
            if dest:
                items.append({"label": "Next", "page": dest})
                if dest in in_book:
                    in_book.remove(dest)
        if "Back" in caps:
            choices = [t for t in earlier if t in in_book] or list(in_book)
            if choices:
                dest = choices[0]
                items.append({"label": "Back", "page": dest})
                in_book.remove(dest)
        if "Back" in caps and not any(item["label"] == "Back" for item in items):
            for token in targets:
                if token in known or token in ("P20001", "P10020"):
                    continue
                dest = nearest_lower(token, list(page_strings))
                if dest and dest != name:
                    items.append({"label": "Back", "page": dest})
                    break
    else:
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
    if help_targets and text:
        link = {"page": help_targets[0]}
        word = hotword(ss, text, definition_text(page_strings.get(help_targets[0], [])))
        if word:
            link["word"] = word
        page["help"] = link
    return page


def translate(path: Path) -> dict:
    data = path.read_bytes()
    raw_pages = pages_of(data)
    ids = {name.lower(): name for name, _ in raw_pages}
    page_strings = {name: strings(blob) for name, blob in raw_pages}
    blobs = {name: blob for name, blob in raw_pages}
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
    questions = set()
    for page in pages:
        ss = page_strings[page["id"]]
        choices = quiz_choices(ss)
        question = question_text(ss)
        if not choices or not question:
            continue
        questions.add(page["id"])
        quiz = {"choices": choices}
        again = quiz_again(ss, ids)
        if again:
            quiz["again"] = again
        page["text"] = [question]
        page["quiz"] = quiz
    for page in pages:
        if "quiz" not in page:
            continue
        nxt = quiz_next(page_strings[page["id"]], ids, questions, page["quiz"].get("again"))
        if nxt and nxt != page["id"]:
            page["quiz"]["next"] = nxt
    attach_assessment(pages, page_strings, blobs)
    safeguard(pages, page_strings, ids)
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


def write_catalog(dest: Path) -> None:
    courses = []
    for path in sorted(dest.glob("*.json")):
        if path.name == "catalog.json":
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict) or not isinstance(data.get("pages"), list):
            continue
        courses.append({
            "id": data.get("id", path.stem),
            "title": data.get("title", path.stem),
            "file": f"lessonshells/{path.name}",
        })
    (dest / "catalog.json").write_text(json.dumps({"courses": courses}, indent=2) + "\n", encoding="utf-8")


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
    write_catalog(dest)
    return 0


if __name__ == "__main__":
    sys.exit(main())
