#!/usr/bin/env python3
"""Fix the library listing the viewer reads.

courses.xml is the stub of what should exist. This walks a course directory,
matches each lesson id to a .tbk, and writes library.json.

    python library.py D:\\courses\\courses
    python library.py D:\\courses\\courses --xml courses.xml --out library.json
"""

from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent


def master(root: ET.Element) -> ET.Element:
    for menu in root.findall("Menu"):
        if menu.get("courseid") == "0_MASTER3" or menu.get("title") == "ATT Master_3":
            return menu
    return root


def stub(xml_path: Path) -> list[dict]:
    menu = master(ET.parse(xml_path).getroot())
    topics = []
    for topic_el in menu.findall("Menu"):
        topic = {"title": topic_el.get("title") or "Untitled", "modules": []}
        topics.append(topic)
        for module_el in topic_el.findall("Menu"):
            module = {"title": module_el.get("title") or "Untitled", "courses": []}
            topic["modules"].append(module)
            for item in module_el.findall("Item"):
                lesson_id = (item.get("lessonid") or "").strip()
                module["courses"].append({
                    "id": lesson_id,
                    "title": item.get("title") or lesson_id,
                    "file": None,
                    "json": None,
                    "present": False,
                })
    return topics


def books(directory: Path) -> dict[str, str]:
    found = {}
    for path in list(directory.glob("*.tbk")) + list(directory.glob("*.TBK")):
        found[path.stem.lower()] = str(path)
    return found


def fix(directory: Path, xml_path: Path, out: Path) -> dict:
    topics = stub(xml_path)
    on_disk = books(directory)
    known = set()
    for topic in topics:
        for module in topic["modules"]:
            for course in module["courses"]:
                key = course["id"].lower()
                known.add(key)
                if key in on_disk:
                    course["file"] = on_disk[key]
                    course["json"] = f"courses/{key}.json"
                    course["present"] = True
    extra = []
    for key, path in sorted(on_disk.items()):
        if key not in known:
            extra.append({"id": key, "title": key, "file": path, "json": f"courses/{key}.json", "present": True})
    if extra:
        topics.append({"title": "Not categorized", "modules": [{"title": "On disk", "courses": extra}]})
    payload = {"directory": str(directory), "xml": str(xml_path), "topics": topics}
    out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    present = sum(1 for t in topics for m in t["modules"] for c in m["courses"] if c["present"])
    print(f"{out} present {present} extra {len(extra)}")
    return payload


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("usage: python library.py <course directory> [--xml courses.xml] [--out library.json]")
    directory = Path(sys.argv[1])
    xml_path = HERE / "courses.xml"
    out = HERE / "library.json"
    if "--xml" in sys.argv:
        xml_path = Path(sys.argv[sys.argv.index("--xml") + 1])
    if "--out" in sys.argv:
        out = Path(sys.argv[sys.argv.index("--out") + 1])
    fix(directory, xml_path, out)
