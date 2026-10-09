/* nc81base.sbk: menu, page list, lesson placement. */
(function (shell) {
  shell.base = {
    initializeBase(book) {
      book.log.push("initializeBase");
      book.flags = book.flags || {};
    },
    gotoMenuPage(book) {
      book.log.push("gotoMenuPage");
      return book.go("P0");
    },
    gotoPageList(book, id) {
      book.log.push("gotoPageList " + id);
      return book.go(id);
    },
    setupQuizPage(book, id) {
      book.log.push("setupQuizPage " + id);
      return book.go(id);
    },
    getObjectiveScore(book) {
      return book.score || 0;
    }
  };
})(window.SystemShell);
