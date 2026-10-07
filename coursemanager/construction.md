# Making a book

The viewer is a catalog in front of a page frame. `course.xml` lists the books. Each book is one XML file in `courses/`. The frame does not run OpenScript. It reads tags.

Serve the folder. Opening `viewer.html` as a file cannot fetch a course that is not already embedded. GitHub Pages is enough: publish this folder and open `viewer.html`.

## Catalog

`course.xml` is three lists.

- Main Course List: a `<main>`.
- Modules: a `<sub>` inside that main.
- Course List: a `<course>` inside that module. Open loads `file`.

```xml
<main id="m0" title="DC Circuits">
  <sub id="m0s0" title="Mod 02 Introduction to Electricity">
    <course id="93951108" title="Introduction to Technical Graphics" file="courses/93951108.xml"/>
  </sub>
</main>
```

`id` on `<course>` is the course id. `title` is the name in the Course List. `file` is the book. Write `&` as `&`. A bare `&` stops the catalog parser, and every course after that line disappears.

## A book

One file, `courses/<id>.xml`. The blue bar and the window title are the `title` attribute. The page id stays in the status line.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<book id="93951108" title="Introduction to Technical Graphics">
  <page id="PINFO" n="1">
    <p>First page.</p>
    <go id="next" to="P400"/>
  </page>
</book>
```

`id` on `<book>` should match the course id. It is not what the bar shows.

## A page

A page is a `<page>` with an `id` and an `n`.

- `id` is the jump target. `P400`, `Q1`, and `PDONE` are all just ids. Use the same id only once in the book.
- `n` is the number in the status bar. It is not used for navigation.
- The status bar shows `n /` the count of every `<page>` in the file, including wrong-answer pages.

Children the frame draws:

- `<p>` is a paragraph, in order.
- `<image>` is a picture. See Images.
- `<go>` is a jump.
- `<choice>` is a button that jumps, if the page has no `<quiz>`.
- `<quiz>` is a graded question.
- `<booktitle/>` prints the book title. Use it on the finish page.

`kind` is a note for you (`menu`, `quiz`, `finish`). The frame does not read it.

```xml
<page id="P400" n="2">
  <p>TTL uses 5 volts.</p>
  <image src="../images/ttl.bmp" x="40" y="88" w="240" h="320"/>
  <go id="next" to="Q1"/>
  <go id="back" to="PINFO"/>
  <go id="fig" to="P1082" label="Figures"/>
</page>
```

## Special commands

The status bar has Next, Back, and Courses. Exit is on the blue bar. Anything else is a `<go>` you write.

| Command | Where | Effect |
|---|---|---|
| `<go id="next" to="P410"/>` | status Next | Goes to that page. Next is disabled if the page has no `next`. |
| `<go id="back" to="P400"/>` | status Back | Goes to that page. |
| `<go id="back" to="last"/>` | status Back | Returns to the page that opened this one. |
| any other `<go>` | button on the page | Label is `label`, or the `id` if you omit it. `fig`, `menu`, `start`, and `quiz` are ordinary names. |
| `<booktitle/>` | page text | Prints the book `title`. |
| Courses | status bar | Returns to the three lists. Not a tag. |
| Exit | blue bar | Asks "Are you sure you want to Exit the Lesson?" Not a tag. |

`to` is always a page id in this book. A `go` with no matching page does nothing.

Arrow Right is Next. Arrow Left is Back.

## A quiz

A quiz is a page. The question text is a `<p>`. The key is a `<quiz>`.

Choice, two to four answers. `correct="yes"` is the key. Each choice names the page it opens.

```xml
<page id="Q1" n="3">
  <p>How many inputs can a fan-out of 5 drive?</p>
  <quiz type="choice">
    <choice to="Q1ok" correct="yes">5</choice>
    <choice to="Q1bad">2</choice>
    <choice to="Q1bad">10</choice>
  </quiz>
  <go id="back" to="P400"/>
</page>
```

A typed number. Blank does not match. `tolerance` is how far from `match` still passes. `0` means exact.

```xml
<quiz type="number" match="5" tolerance="0" ok="Q2ok" bad="Q2bad"/>
```

A typed string. `case="no"` ignores case. Extra space is collapsed.

```xml
<quiz type="text" match="TTL" case="no" ok="Q3ok" bad="Q3bad"/>
```

`ok` and `bad` are page ids. A wrong answer is not a skip. Send `bad` back to the question if they should try again.

```xml
<page id="Q1bad" n="4">
  <p>Not that count.</p>
  <go id="back" to="Q1" label="Return"/>
</page>
```

Finish on the last right answer:

```xml
<page id="PDONE" n="5">
  <p>Congratulations on finishing:</p>
  <booktitle/>
  <go id="menu" to="PINFO" label="Lesson menu"/>
</page>
```

## Images

Store pictures in `images/` next to `viewer.html`, not inside `courses/`. A book is loaded from `courses/<id>.xml`, so the path in the tag steps up one level.

```text
viewer.html
course.xml
images/ttl.bmp
courses/93951108.xml
```

```xml
<image src="../images/ttl.bmp" x="40" y="88" w="240" h="320"/>
```

- `src` is relative to the course file.
- `x` and `y` place it on the page, origin at the top left of the stage. The stage is 952 by 420.
- `w` and `h` are the drawn size. Use the file's pixel size.
- Leave `x` and `y` off to stack the picture under the text.
- `role="chrome"` is skipped. Do not use it for a figure.
- BMP and PNG both work. The frame does not smooth them.

Carved ToolBook art lives in `artifacts/tbk_images`. Copy the file you want into `images/` and point `src` at that copy. Do not point `src` at a path outside this folder if the site is on GitHub Pages.

## Replace a stub

The catalog already points every course at `courses/<id>.xml`. Edit that file. Do not add a second `<course>` for the same id. Keep the `title` on `<book>` equal to the catalog title unless you mean to change the blue bar only.

After a change, commit the XML and any new file under `images/`. Pages serves the new file on the next build.
