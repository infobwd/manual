/* WD Books FLIP-03 engine map. Pure helper; testable without a browser. */
(function (scope) {
  "use strict";
  const COVER = 0, BLANK = -1, BACK_COVER = -2;
  function order(sourcePageCount, single) {
    const n = Math.max(1, Math.trunc(sourcePageCount));
    const pages = [COVER];
    if (!single) pages.push(BLANK);
    for (let page = 1; page < n; page++) pages.push(page);
    // Ensure the last (hard) back cover is on a right-hand physical sheet on desktop.
    if (!single && pages.length % 2 === 0) pages.push(BLANK);
    pages.push(BACK_COVER);
    return pages;
  }
  function spreadStart(enginePage, single) {
    const page = Math.max(0, Math.trunc(enginePage) || 0);
    return single || page === 0 ? page : (page % 2 ? page : page - 1);
  }
  function visiblePages(enginePage, pages, single) {
    const start = spreadStart(enginePage, single);
    return (single || start === 0 ? [pages[start]] : [pages[start], pages[start + 1]])
      .filter(page => typeof page === "number");
  }
  function firstReadable(enginePage, pages, single) {
    const current = visiblePages(enginePage, pages, single);
    return current.find(page => page >= 0) ?? BACK_COVER;
  }
  function sourceToEngine(sourcePage, single) {
    return sourcePage <= 0 ? 0 : (single ? sourcePage : sourcePage + 1);
  }
  function status(enginePage, pages, single) {
    const current = visiblePages(enginePage, pages, single);
    if (current.includes(COVER)) return { label: "หน้าปก", shown: 0 };
    const reading = current.filter(page => page > 0);
    const contentTotal = Math.max(...pages.filter(page => page > 0), 0);
    if (!reading.length) return { label: "ปกหลัง", shown: contentTotal };
    const first = reading[0], last = reading[reading.length - 1];
    return { label: "หน้า " + first + (first === last ? "" : "–" + last) + " / " + contentTotal, shown: last };
  }
  scope.WD_CORNER_MODEL = Object.freeze({ order, spreadStart, visiblePages, firstReadable, sourceToEngine, status });
})(window);
