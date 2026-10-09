/* Dispatcher. The viewer calls this. It does not read a lesson by itself. */
window.SystemShell = window.SystemShell || { calls: {} };

window.SystemShell.open = function (lesson) {
  const book = {
    id: lesson.id,
    title: lesson.title,
    pages: lesson.pages,
    index: 0,
    log: [],
    score: 0,
    session: { open: false, responses: [], bookmark: null },
    go(id) {
      const n = book.pages.findIndex(p => p.id === id);
      if (n < 0) throw new Error("no page " + id);
      book.index = n;
      book.log.push("go " + id);
      return book.pages[n];
    },
    page() { return book.pages[book.index]; }
  };
  window.SystemShell.runtime.enterSystem(book);
  const page = book.page();
  (page.sends || []).forEach(name => window.SystemShell.send(book, name));
  return book;
};

window.SystemShell.send = function (book, name, arg) {
  const table = {
    initializeBase: window.SystemShell.base.initializeBase,
    initializeRecs: window.SystemShell.recs.initializeRecs,
    initializeTest: window.SystemShell.test.initializeTest,
    initializeTrnr: window.SystemShell.trnr.initializeTrnr,
    openSession: window.SystemShell.recs.openSession,
    bookmarkSession: window.SystemShell.recs.bookmarkSession,
    gotoMenuPage: window.SystemShell.base.gotoMenuPage,
    gotoPageList: window.SystemShell.base.gotoPageList,
    setupQuizPage: window.SystemShell.base.setupQuizPage,
    getObjectiveScore: window.SystemShell.base.getObjectiveScore,
    enterSystem: window.SystemShell.runtime.enterSystem
  };
  const fn = table[name];
  if (!fn) {
    book.log.push("send " + name + " (no module)");
    return null;
  }
  return fn(book, arg);
};
