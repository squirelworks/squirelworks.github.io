/* tb80r.sbk stub. ToolBook runtime book, not Nida's. */
(function (shell) {
  shell.runtime = {
    enterSystem(book) {
      book.log.push("enterSystem");
      shell.base.initializeBase(book);
      shell.recs.initializeRecs(book);
      shell.test.initializeTest(book);
      shell.trnr.initializeTrnr(book);
      shell.recs.openSession(book);
    }
  };
})(window.SystemShell);
