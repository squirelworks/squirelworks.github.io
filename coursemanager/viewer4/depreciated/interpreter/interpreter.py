#!/usr/bin/env python3
"""Place translated ToolBook courses into the 03_ATT_Master layout.

The master catalog (ATT Master_3 in courses.xml) has three levels:

    Main Topic  ->  Module  ->  Course

A book whose id is not in that master is filed under the main topic
"Not categorized".

Translate one course or a whole directory:

    python interpreter.py path/to/93954302.tbk
    python interpreter.py path/to/tbk-directory

With no path, the script asks which of those two you want.
"""

from __future__ import annotations

import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import translate

HERE = Path(__file__).resolve().parent
DEFAULT_XML = HERE / "courses.xml"
DEFAULT_OUT = HERE.parent / "courses"
UNCATEGORIZED = "Not categorized"


def safe(name: str) -> str:
    cleaned = "".join(ch if ch not in '<>:"/\\|?*' else "-" for ch in name)
    return " ".join(cleaned.split()).strip(" .") or "untitled"


def master_menu(xml_path: Path) -> ET.Element:
    """The 03_ATT_Master list is the ATT Master_3 menu, not the other curricula."""
    root = ET.parse(xml_path).getroot()
    for menu in root.findall("Menu"):
        title = menu.get("title") or ""
        courseid = menu.get("courseid") or ""
        if courseid == "0_MASTER3" or title == "ATT Master_3":
            return menu
    raise SystemExit(f"03_ATT_Master (ATT Master_3) was not in {xml_path}")


def empty_tree(xml_path: Path) -> tuple[list[dict], dict[str, tuple[int, int, int]]]:
    """Skeleton of every main topic, module, and course. Index maps a lesson id."""
    topics: list[dict] = []
    index: dict[str, tuple[int, int, int]] = {}
    for topic_el in master_menu(xml_path).findall("Menu"):
        topic = {"title": topic_el.get("title") or "Untitled", "modules": []}
        topics.append(topic)
        for module_el in topic_el.findall("Menu"):
            module = {"title": module_el.get("title") or "Untitled", "courses": []}
            topic["modules"].append(module)
            for item in module_el.findall("Item"):
                lesson_id = (item.get("lessonid") or "").strip()
                course = {
                    "id": lesson_id,
                    "title": item.get("title") or lesson_id,
                    "file": None,
                }
                module["courses"].append(course)
                if lesson_id and lesson_id.lower() not in index:
                    index[lesson_id.lower()] = (
                        len(topics) - 1,
                        len(topic["modules"]) - 1,
                        len(module["courses"]) - 1,
                    )
    topics.append({"title": UNCATEGORIZED, "modules": [{"title": UNCATEGORIZED, "courses": []}]})
    return topics, index


def books_in(path: Path) -> list[Path]:
    if path.is_file():
        return [path]
    if not path.is_dir():
        raise SystemExit(f"not a course or a directory: {path}")
    found = [item for item in path.iterdir() if item.is_file() and item.suffix.lower() == ".tbk"]
    return sorted(found, key=lambda item: item.name.lower())


def relative_file(topic: str, module: str, lesson_id: str) -> str:
    return f"{safe(topic)}/{safe(module)}/{lesson_id}.json"


def place(topics: list[dict], index: dict[str, tuple[int, int, int]], lesson: dict, out: Path) -> Path:
    lesson_id = str(lesson.get("id") or "course")
    slot = index.get(lesson_id.lower())
    if slot is None:
        topic = topics[-1]
        module = topic["modules"][0]
        course = next((item for item in module["courses"] if item["id"].lower() == lesson_id.lower()), None)
        if course is None:
            course = {"id": lesson_id, "title": lesson.get("title") or lesson_id, "file": None}
            module["courses"].append(course)
        topic_title, module_title = topic["title"], module["title"]
    else:
        topic = topics[slot[0]]
        module = topic["modules"][slot[1]]
        course = module["courses"][slot[2]]
        topic_title, module_title = topic["title"], module["title"]
    lesson["topic"] = topic_title
    lesson["module"] = module_title
    lesson["course"] = course["title"]
    rel = relative_file(topic_title, module_title, lesson_id)
    dest = out / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(lesson), encoding="utf-8")
    course["file"] = rel.replace("\\", "/")
    if slot is None:
        course["title"] = lesson.get("title") or course["title"]
    return dest


def write_catalog(topics: list[dict], out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    (out / "catalog.json").write_text(
        json.dumps({"master": "03_ATT_Master", "topics": topics}, indent=2) + "\n",
        encoding="utf-8",
    )


def translate_one(path: Path) -> dict | None:
    try:
        return translate.translate(path)
    except Exception as exc:
        print(f"FAILED {path.name}: {exc}", file=sys.stderr)
        return None


def run(source: Path, xml_path: Path, out: Path) -> int:
    books = books_in(source)
    if not books:
        print(f"no .tbk files in {source}", file=sys.stderr)
        return 1
    topics, index = empty_tree(xml_path)
    known = {lesson_id for lesson_id in index}
    # Keep courses already translated, so one file does not wipe the directory.
    if (out / "catalog.json").exists():
        previous = json.loads((out / "catalog.json").read_text(encoding="utf-8"))
        for topic in previous.get("topics") or []:
            for module in topic.get("modules") or []:
                for course in module.get("courses") or []:
                    rel = course.get("file")
                    if not rel:
                        continue
                    lesson_id = str(course.get("id") or "")
                    if lesson_id.lower() in {book.stem.lower() for book in books}:
                        continue
                    if not (out / rel).exists():
                        continue
                    slot = index.get(lesson_id.lower())
                    if slot is None and lesson_id.lower() not in known:
                        topics[-1]["modules"][0]["courses"].append(
                            {"id": lesson_id, "title": course.get("title") or lesson_id, "file": rel}
                        )
                    elif slot is not None:
                        topics[slot[0]]["modules"][slot[1]]["courses"][slot[2]]["file"] = rel
    done = 0
    for book in books:
        lesson = translate_one(book)
        if lesson is None:
            continue
        dest = place(topics, index, lesson, out)
        print(f"{book.name} -> {dest.relative_to(out)}  [{lesson.get('topic')} / {lesson.get('module')}]")
        done += 1
    write_catalog(topics, out)
    print(f"{done} course(s) -> {out / 'catalog.json'}")
    return 0 if done else 1


def ask() -> Path:
    print("Translate")
    print("  1  one course")
    print("  2  a whole directory")
    choice = input("Select 1 or 2: ").strip()
    entered = input("Path: ").strip().strip('"')
    path = Path(entered)
    if choice == "1" and path.is_dir():
        raise SystemExit("that is a directory; select 2 to translate all of it")
    if choice == "2" and path.is_file():
        raise SystemExit("that is one course; select 1 to translate it")
    return path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Translate one ToolBook course or a directory into the 03_ATT_Master layout")
    parser.add_argument("path", nargs="?", help="A .tbk file, or a directory of them")
    parser.add_argument("--xml", default=str(DEFAULT_XML), help="03_ATT_Master courses.xml")
    parser.add_argument("--out", default=str(DEFAULT_OUT), help="Where Main Topic/Module/Course files are written")
    args = parser.parse_args(argv)
    source = Path(args.path) if args.path else ask()
    return run(source, Path(args.xml), Path(args.out))


if __name__ == "__main__":
    sys.exit(main())
