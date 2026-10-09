/* nc81recs.sbk plus nc81rec.dll: session and NIDAREC-style record. */
(function (shell) {
  shell.recs = {
    initializeRecs(book) {
      book.log.push("initializeRecs");
      book.session = book.session || { open: false, responses: [] };
    },
    openSession(book) {
      book.log.push("openSession");
      book.session.open = true;
    },
    bookmarkSession(book, pageId) {
      book.log.push("bookmarkSession " + pageId);
      book.session.bookmark = pageId;
    },
    writeResponse(book, pageId, value) {
      book.log.push("writeResponse " + pageId + " " + value);
      book.session.responses.push({ pageId: pageId, value: value });
    }
  };
})(window.SystemShell);
