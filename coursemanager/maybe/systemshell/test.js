/* nc81test.sbk: quiz setup. The question pages stay in the lesson. */
(function (shell) {
  shell.test = {
    initializeTest(book) {
      book.log.push("initializeTest");
      book.score = book.score || 0;
    }
  };
})(window.SystemShell);
