/* FLIP-14: fail-closed parity gate for public books, including the Reader's
   two SAR chart kinds and insight schema. Unknown fields always stay in Reader. */
(function (scope) {
  "use strict";
  const allowed = new Set(["title", "kicker", "paragraphs", "bullets", "tip", "chart", "insight"]);
  const chartFields = new Set(["kind", "title", "labels", "rows"]);
  const rowFields = new Set(["label", "target", "result"]);
  const insightFields = new Set(["headline", "primary", "detail"]);
  const text = value => typeof value === "string";
  const fieldText = (obj, keys) => keys.every(key => obj[key] === undefined || text(obj[key]));
  const keysAllowed = (obj, keys) => Object.keys(obj).every(key => keys.has(key));
  const percentage = value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
  function supportsChart(chart) {
    return Boolean(chart && typeof chart === "object" && !Array.isArray(chart) &&
      keysAllowed(chart, chartFields) &&
      ["target-result", "year-comparison"].includes(chart.kind) &&
      fieldText(chart, ["title"]) &&
      (chart.labels === undefined || Array.isArray(chart.labels) && chart.labels.length === 2 &&
        chart.labels.every(text)) &&
      Array.isArray(chart.rows) && chart.rows.length > 0 &&
      chart.rows.every(row => row && typeof row === "object" && !Array.isArray(row) &&
        keysAllowed(row, rowFields) && text(row.label) && percentage(row.target) &&
        percentage(row.result)));
  }
  function supportsInsight(insight) {
    return Boolean(insight && typeof insight === "object" && !Array.isArray(insight) &&
      keysAllowed(insight, insightFields) && text(insight.headline) &&
      fieldText(insight, ["primary", "detail"]));
  }
  function supports(book) {
    return Boolean(book && book.status === "published" &&
      typeof book.id === "string" && Array.isArray(book.pages) && book.pages.length > 0 &&
      book.pages.every(page => page && typeof page === "object" && !Array.isArray(page) &&
        keysAllowed(page, allowed) &&
        fieldText(page, ["title", "kicker", "tip"]) &&
        ["paragraphs", "bullets"].every(key =>
          page[key] === undefined || Array.isArray(page[key]) && page[key].every(text)) &&
        (page.chart === undefined || supportsChart(page.chart)) &&
        (page.insight === undefined || supportsInsight(page.insight))));
  }
  scope.WD_FLIP_CAPABILITY = Object.freeze({ supports });
})(window);
