import type { Book, Lesson, Page } from "./types";

function note(book: Book, line: string): Book {
  return { ...book, log: [...book.log, line].slice(-12) };
}

function at(book: Book, id: string): Book {
  const index = book.pages.findIndex((page) => page.id === id);
  if (index < 0) return note(book, "no page " + id);
  return note({ ...book, index }, "go " + id);
}

export function pageOf(book: Book): Page {
  return book.pages[book.index];
}

export function go(book: Book, id: string): Book {
  return at(book, id);
}

const calls: Record<string, (book: Book, arg?: string) => Book> = {
  initializeBase(book) {
    return note(book, "initializeBase");
  },
  initializeRecs(book) {
    return note(
      { ...book, session: { open: false, responses: [], bookmark: null } },
      "initializeRecs",
    );
  },
  initializeTest(book) {
    return note({ ...book, score: 0 }, "initializeTest");
  },
  initializeTrnr(book) {
    return note(book, "initializeTrnr");
  },
  openSession(book) {
    return note(
      { ...book, session: { ...book.session, open: true } },
      "openSession",
    );
  },
  bookmarkSession(book, arg) {
    const pageId = arg ?? pageOf(book).id;
    return note(
      { ...book, session: { ...book.session, bookmark: pageId } },
      "bookmarkSession " + pageId,
    );
  },
  gotoMenuPage(book) {
    return note(book, "gotoMenuPage");
  },
  gotoPageList(book, arg) {
    const id = arg ?? pageOf(book).jumps[0];
    return id ? at(note(book, "gotoPageList " + id), id) : note(book, "gotoPageList");
  },
  setupQuizPage(book, arg) {
    const id = arg ?? pageOf(book).jumps[0];
    return id ? at(note(book, "setupQuizPage " + id), id) : note(book, "setupQuizPage");
  },
  getObjectiveScore(book) {
    return note(book, "getObjectiveScore " + book.score);
  },
  enterSystem(book) {
    return ["initializeBase", "initializeRecs", "initializeTest", "initializeTrnr", "openSession"].reduce(
      (current, name) => calls[name](current),
      note(book, "enterSystem"),
    );
  },
};

export function send(book: Book, name: string, arg?: string): Book {
  const fn = calls[name];
  if (!fn) return note(book, "send " + name + " (no module)");
  return fn(book, arg);
}

export function openLesson(lesson: Lesson): Book {
  const book: Book = {
    id: lesson.id,
    title: lesson.title,
    pages: lesson.pages,
    index: 0,
    log: [],
    score: 0,
    session: { open: false, responses: [], bookmark: null },
    menu: lesson.menu ?? [],
  };
  const started = send(book, "enterSystem");
  return (pageOf(started).sends ?? []).reduce(
    (current, name) => send(current, name),
    started,
  );
}
