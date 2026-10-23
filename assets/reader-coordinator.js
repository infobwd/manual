/* ARCH-01D2: coordinate My Books updates and Reader opening without owning storage. */
(() => {
  "use strict";
  function createReaderCoordinator({experience, renderShelf, renderContinueFeature, openBook}) {
    const refreshMyBooks = () => {
      renderShelf();
      renderContinueFeature();
    };
    const openReadable = (book, opener) => {
      if (!book || book.status !== "published" || !Array.isArray(book.pages) || !book.pages.length) return false;
      openBook(book, opener);
      return true;
    };
    const connect = () => {
      experience?.subscribeBooks?.(refreshMyBooks);
      refreshMyBooks();
    };
    return Object.freeze({refreshMyBooks, openReadable, connect});
  }
  window.WD_READER_COORDINATOR = Object.freeze({createReaderCoordinator});
})();
