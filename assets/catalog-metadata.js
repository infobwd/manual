/* CAT-01B: read-only metadata projection; no fetching or storage writes. */
(() => {
  "use strict";
  const FIELDS = ["id","category","status","title","subtitle","description","audience","updated","edition","readTime","color","coverTitle","coverTop"];
  function createMetadataView(manuals) {
    const books = (Array.isArray(manuals) ? manuals : []).map(book => Object.freeze({
      ...Object.fromEntries(FIELDS.filter(key => Object.prototype.hasOwnProperty.call(book,key)).map(key => [key,book[key]])),
      tags: Object.freeze(Array.isArray(book.tags) ? [...book.tags] : []),
      pageCount: Array.isArray(book.pages) ? book.pages.length : 0,
      readable: book.status === "published" && Array.isArray(book.pages) && book.pages.length > 0
    }));
    const byId = new Map(books.map(book => [book.id,book]));
    return Object.freeze({books:Object.freeze(books), getById:id=>byId.get(id)||null});
  }
  window.WD_CATALOG_METADATA = Object.freeze({createMetadataView});
})();
