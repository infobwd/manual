/* ARCH-01B: pure catalog search/filter/sort, no DOM or storage writes. */
(() => {
  "use strict";
  const normalized = value => String(value || "").toLocaleLowerCase("th-TH").trim();
  const isReady = book => book.status === "published" && Boolean(book.pages?.length);
  function createCatalogCore(data) {
    const lookup = Object.fromEntries(data.categories.map(cat => [cat.id, cat]));
    const index = new Map(data.manuals.map(book => [book.id, normalized([
      book.title, book.subtitle, book.description, book.audience,
      lookup[book.category]?.label, ...(book.tags || [])
    ].join(" "))]));
    const collator = new Intl.Collator("th-TH", {sensitivity:"base", numeric:true});
    function select(options, history = []) {
      const {availability = "all", category = "all", query = "", sort = "default"} = options;
      const needle = normalized(query);
      const rank = new Map(history.map((id, position) => [id, position]));
      return data.manuals.filter(book => {
        const ready = isReady(book);
        if (availability === "ready" && !ready) return false;
        if (availability === "upcoming" && ready) return false;
        if (category !== "all" && book.category !== category) return false;
        return !needle || (index.get(book.id) || "").includes(needle);
      }).sort((a, b) => {
        if (sort === "title") return collator.compare(a.title, b.title);
        if (sort === "recent") {
          const aRank = rank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const bRank = rank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          if (aRank !== bRank) return aRank - bRank;
        }
        return Number(isReady(b)) - Number(isReady(a));
      });
    }
    return Object.freeze({select, isReady, normalized});
  }
  window.WD_CATALOG_CORE = Object.freeze({createCatalogCore});
})();
