/* ARCH-01D1: read-only My Books selectors; never writes browser storage. */
(() => {
  "use strict";
  function createMyBooksSelectors(manuals) {
    const readable = new Map(manuals.filter(book => book.status === "published" && Array.isArray(book.pages) && book.pages.length).map(book => [book.id, book]));
    const resolve = ids => (Array.isArray(ids) ? ids : []).map(id => readable.get(id)).filter(Boolean);
    const recent = (history, limit = 3) => resolve(history).slice(0, limit);
    const favorites = ids => resolve(ids);
    const resume = history => readable.get(Array.isArray(history) ? history[0] : null) || null;
    const bookmarks = (getBookmarks, history) => {
      const order = new Map((Array.isArray(history) ? history : []).map((id, i) => [id, i]));
      return [...readable.values()].map(book => ({
        book,
        indices: (getBookmarks?.(book.id) || []).filter(i => Number.isInteger(i) && i >= 0 && i < book.pages.length)
      })).filter(group => group.indices.length).sort((a,b) =>
        (order.get(a.book.id) ?? Infinity) - (order.get(b.book.id) ?? Infinity) ||
        a.book.title.localeCompare(b.book.title, "th")
      );
    };
    return Object.freeze({recent, favorites, resume, bookmarks});
  }
  window.WD_MYBOOKS_SELECTORS = Object.freeze({createMyBooksSelectors});
})();
