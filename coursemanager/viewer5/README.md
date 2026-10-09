# Maybe3

courses.xml is the stub of what should exist. The library program matches that stub to a course directory and writes library.json. The interpreter dumps each book into courses/<id>.json. The viewer reads the listing and draws a page with the system modules.

    python library.py D:\courses\courses --xml courses.xml
    python interpreter.py D:\courses\courses --out courses

Serve this folder and open viewer.html. A missing lesson stays in the stub with present false. A book that is not in the stub is filed under Not categorized.
