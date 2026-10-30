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
test("R3 responsive layout keeps the desktop rail but never forces two phone columns", () => {
  for (const token of [
    'className="book-grid"', 'className="preview-label',
    'className="nav-item', 'min-w-0 p-3', 'className="book-title',
  ]) assert.ok(main.includes(token), token);
  for (const token of [
    'grid-template-columns: minmax(0, 1fr)',
    'grid-template-columns: repeat(2,minmax(0,1fr))',
    'grid-template-columns: repeat(3,minmax(0,1fr))',
    'grid-template-columns: repeat(4,minmax(0,1fr))',
    'grid-template-columns: repeat(3,minmax(0,1fr))',
    'env(safe-area-inset-bottom,0px)', '.preview-label { display: none; }',
    'min-height: 52px'
  ]) assert.ok(styles.includes(token), token);
  assert.doesNotMatch(styles, /overflow-x:\s*hidden/);
});
test("R3 uses CDP CSS pixel viewport and reports browser metrics, not window PNG alone", () => {
  const capture = read("../scripts/capture-responsive.cjs");
  const checker = read("../scripts/responsive-checks.cjs");
  for (const token of [
    'name:"phone-books-320x720"', 'name:"phone-books-360x800"',
    'name:"phone-books-390x844"', 'name:"phone-books-430x932"',
    'name:"tablet-books-768x1024"', 'name:"tablet-books-1024x768"',
    'name:"desktop-books-1366x768"', 'name:"desktop-books-night-1366x768"',
    'name:"desktop-category-1920x1080"',
    'Emulation.setDeviceMetricsOverride', 'Page.captureScreenshot',
    'document.documentElement.clientWidth', 'document.documentElement.scrollWidth',
    'visualViewport?.width', 'devicePixelRatio',
    'getBoundingClientRect()', 'BOTTOM_NAV', 'PASS_BROWSER_SIMULATION_ONLY',
    'actual_browser_zoom:"NOT_TESTED"', 'real_iphone_ipad:"NOT_TESTED"',
    'const { checkScene } = require("./responsive-checks.cjs")'
  ]) assert.ok((capture+checker).includes(token), token);
  assert.ok(capture.includes('document.getElementById("+JSON.stringify(heading)+")'),
    "React view must be validated before screenshot");
  for(const token of ["HORIZONTAL_OVERFLOW","CSS_VIEWPORT_MISMATCH",
    "BOTTOM_NAV_ITEMS_MISSING","BOTTOM_NAV_NOT_TOUCH_VISIBLE"]) {
    assert.ok(checker.includes(token),token);
  }
  assert.doesNotMatch(capture, /--window-size=/,
    "Screenshot-only window size is not an actual CSS viewport guarantee");
});


test("R3 keyboard Enter vs mouse submit diagnostic must never hide a failed step", () => {
  const capture=read("../scripts/capture-responsive.cjs");
  for(const token of [
    'type:"rawKeyDown",key:"Enter"',
    'type:"char",text:"\\r"',
    'type:"keyUp",key:"Enter"',
    'async function interactionSnapshot',
    'async function clickWithMouse',
    'Input.dispatchMouseEvent',
    'record("thai_home_input",typed)',
    'record("thai_enter_submit",enterSubmitted)',
    'record("thai_mouse_submit",clickSubmitted)',
    'record("favorite_filter",favorites)',
    'record("theme_switching",night)',
    'status:"NOT_TESTED"',
    'evidence.checks.every(x=>x.status==="PASS")?"PASS":"FAIL"'
  ]) assert.ok(capture.includes(token),token);
  assert.doesNotMatch(capture,/if\s*\(!enterSubmitted\)\s*throw/,
    "Enter failure must preserve diagnostics and independently test the actual button");
});
