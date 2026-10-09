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
  return at({ ...book, helpFrom: null }, id);
}

export function openHelp(book: Book, id: string): Book {
  return at({ ...book, helpFrom: book.index }, id);
}

export function answerQuiz(book: Book, correct: boolean): Book {
  const page = pageOf(book);
  const responses = book.session.responses.filter((item) => item.pageId !== page.id);
  responses.push({ pageId: page.id, value: correct ? "correct" : "wrong" });
  const graded = responses.filter((item) => item.value === "correct" || item.value === "wrong");
  const right = graded.filter((item) => item.value === "correct").length;
  const score = graded.length ? Math.round((100 * right) / graded.length) : 0;
  const next = page.quiz?.next;
  const updated = { ...book, session: { ...book.session, responses }, score };
  return next ? at(updated, next) : note(updated, "answer");
}

export function closeHelp(book: Book): Book {
  if (book.helpFrom == null) return book;
  return note({ ...book, index: book.helpFrom, helpFrom: null }, "closeHelp");
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
    helpFrom: null,
  };
  const started = send(book, "enterSystem");
  return (pageOf(started).sends ?? []).reduce(
    (current, name) => send(current, name),
    started,
  );
}
