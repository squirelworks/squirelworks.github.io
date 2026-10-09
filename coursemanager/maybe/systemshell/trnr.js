/* nc81trnr.sbk: trainer console hook. nida81.tbk is the shell it jumps to. */
(function (shell) {
  shell.trnr = {
    initializeTrnr(book) {
      book.log.push("initializeTrnr");
    }
  };
})(window.SystemShell);
