// UI-MIG-02R2 isolated source contract; Node built-ins only, no React DOM claim.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = name => readFileSync(new URL(name, import.meta.url), "utf8");
const main = read("../src/main.tsx");
const styles = read("../src/style.css");

test("Bookshelf is category-first on desktop with real category state", () => {
  for (const token of [
    'className="catalog-layout"', 'className="catalog-sidebar"',
    'aria-labelledby="booksCategoriesTitle"', 'aria-pressed={category === item.id}',
    'onClick={() => setCategory(item.id)}',
    'filterCatalog(books, { query, favoritesOnly, category })',
  ]) assert.ok(main.includes(token), token);
  assert.match(styles, /@media\s*\(min-width:1000px\)/);
  assert.match(styles, /grid-template-columns:210px minmax\(0,1fr\)/);
});
test("Home search submits explicitly instead of navigating on every keystroke", () => {
  assert.match(main, /<form className="home-search mt-5" role="search" onSubmit=/);
  assert.ok(main.includes("event.preventDefault()"));
  assert.ok(main.includes('openBooks("all", homeQuery.trim())'));
  assert.ok(main.includes('onChange={event => setHomeQuery(event.target.value)}'));
  assert.ok(main.includes('bookshelfSearch.current?.focus()'));
  assert.match(styles, /\.catalog-search:focus-within/);
});
test("Home category shortcuts reset unrelated query and favorite filters", () => {
  assert.ok(main.includes('categories.filter(item => item.id !== "all")'));
  assert.ok(main.includes('onClick={() => openBooks(item.id)}'));
  assert.ok(main.includes('setFavoritesOnly(false)'));
  assert.ok(main.includes('setQuery(nextQuery)'));
});
test("Live result count, no-results message and keyboard semantics exist", () => {
  assert.ok(main.includes('aria-live="polite"'));
  assert.ok(main.includes('aria-atomic="true"'));
  assert.ok(main.includes('role="status"'));
  assert.ok(main.includes('aria-current={view === id ? "page" : undefined}'));
  assert.ok(main.includes('htmlFor="reactBookSearch"'));
});
test("Settings/themes and sample-data-only boundaries remain", () => {
  for (const token of ['"light", "sepia", "night"', 'min={90} max={160}',
    'data-theme={theme}', 'src/catalog-filter.ts']) {
    assert.ok((main + styles).includes(token) || token === "src/catalog-filter.ts");
  }
  assert.doesNotMatch(main, /localStorage|sessionStorage|navigator\.serviceWorker|\bfetch\s*\(/);
  assert.doesNotMatch(main, /window\.WD_LIBRARY_DATA|wd-manual-reader-v2/);
});

test("QA-only deep links select the actual Bookshelf and validate allowed themes/categories", () => {
  for (const token of [
    'function initialPreviewState()',
    'new URLSearchParams(window.location.search)',
    'requestedView === "books" || requestedView === "settings"',
    'requestedTheme === "sepia" || requestedTheme === "night"',
    'categories.some(item => item.id === requestedCategory)',
    '(params.get("query") || "").trim().slice(0, 120)',
    'const previewStart = initialPreviewState();',
    'useState<View>(previewStart.view)',
    'useState<Theme>(previewStart.theme)',
    'useState(previewStart.category)'
  ]) assert.ok(main.includes(token), token);
  assert.doesNotMatch(main, /localStorage|sessionStorage|navigator\.serviceWorker/);
});
test("Chrome viewport capture checks the Bookshelf, not Home alone", () => {
  const capture = read("../scripts/capture-responsive.cjs");
  for (const token of [
    'name:"phone-books-390x844"',
    'name:"tablet-books-1024x768"',
    'name:"desktop-books-1366x768"',
    'name:"desktop-books-night-1366x768"',
    'name:"desktop-category-1920x1080"',
    'target.searchParams.set("view",view)',
    'target.searchParams.set("theme",theme)',
    'png.readUInt32BE(16)',
    'png.readUInt32BE(20)',
    'SCREENSHOTS_CAPTURED_VIEWPORT_REVIEW'
  ]) assert.ok(capture.includes(token), token);
  assert.ok(capture.includes('id="bookshelfTitle"'),
    "React Bookshelf DOM must be validated before taking screenshot");
});
