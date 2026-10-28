/* FLIP-11: strict, shared public-book capability gate.
   Keep special chart/insight manuals on the legacy Reader until parity QA. */
(function (scope) {
  "use strict";
  const allowed = new Set(["title","kicker","paragraphs","bullets","tip"]);
  function supports(book) {
    return Boolean(book && book.status === "published" &&
      typeof book.id === "string" && Array.isArray(book.pages) && book.pages.length > 0 &&
      book.pages.every(page => page && typeof page === "object" && !Array.isArray(page) &&
        Object.keys(page).every(key => allowed.has(key)) &&
        ["title","kicker","tip"].every(key =>
          page[key] === undefined || typeof page[key] === "string") &&
        ["paragraphs","bullets"].every(key =>
          page[key] === undefined || Array.isArray(page[key]) &&
            page[key].every(item => typeof item === "string"))));
  }
  scope.WD_FLIP_CAPABILITY = Object.freeze({ supports });
})(window);
