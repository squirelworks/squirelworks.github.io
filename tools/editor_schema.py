"""Write editor/schema.json from FoolbookEditor's author/schema.py.

The Python schema is the source. The web editor reads this copy.

    python3 tools/editor_schema.py /path/to/FoolbookEditor > editor/schema.json
    python3 tools/editor_schema.py /path/to/FoolbookEditor --check
"""

import json
import sys
from pathlib import Path


def build(editor_repo):
    sys.path.insert(0, str(Path(editor_repo).resolve()))
    from author import document, files, schema

    return {
        "source": "FoolbookEditor author/schema.py",
        "fbk": document.BOOK_VERSION,
        "book": list(schema.BOOK_FIELDS),
        "page": list(schema.PAGE_FIELDS),
        "shape": list(schema.SHAPE_FIELDS),
        "shape_extra": {kind: list(fields) for kind, fields in schema.SHAPE_EXTRA.items()},
        "not_written": list(schema.NOT_WRITTEN),
        "envelope": list(files.ENVELOPE),
    }


def text(editor_repo):
    return json.dumps(build(editor_repo), indent=2) + "\n"


def main(argv):
    if not argv:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    out = text(argv[0])
    if "--check" in argv[1:]:
        here = Path(__file__).resolve().parent.parent / "editor" / "schema.json"
        if here.read_text(encoding="utf-8") != out:
            print("editor/schema.json is stale; regenerate it", file=sys.stderr)
            return 1
        return 0
    sys.stdout.write(out)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
