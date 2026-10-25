// Offline-only smoke tests: node tests/library.smoke.cjs
// No network, npm install, CI or real school data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const load = (file) => fs.readFileSync(path.join(root, file), 'utf8');

class FakeElement {
  constructor(tag) {
    this.tagName = tag; this.children = []; this.handlers = {};
    this.style = { setProperty() {} }; this.className = ''; this.textContent = '';
    this.hidden = false; this.open = false; this.disabled = false;
    this.attrs = {}; this.isConnected = true; this.scrollTop = 0;
    this.classList = { toggle() {}, add() {}, remove() {}, contains() { return false; } };
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = value; }
  removeAttribute(key) { delete this.attrs[key]; }
  addEventListener(type, fn) { this.handlers[type] = fn; }
  focus() {}
  showModal() { this.open = true; }
  close() { this.open = false; this.handlers.close?.({}); }
}
const ids = [
  'categoryNav','categoryChips','statPublished','statPending','statCategories',
  'manualGrid','resultsText','emptyResults','readerDialog','bookSpread',
  'readerTitle','readerCategory','pageLeft','pageRight','prevPage','nextPage',
  'pageCounter','progressBar','tocItems','readerClose','fontDecrease',
  'fontIncrease','searchInput'
];
const nodes = Object.fromEntries(ids.map(id => [id, new FakeElement('div')]));
nodes.readerDialog = new FakeElement('dialog');
const document = {
  createElement: tag => new FakeElement(tag),
  createElementNS: (_ns, tag) => new FakeElement(tag),
  getElementById: id => nodes[id] ?? (nodes[id] = new FakeElement('div')),
  querySelector: () => new FakeElement('div'),
  querySelectorAll: () => [],
  body: new FakeElement('body'),
  activeElement: null
};
const media = { matches: false, addEventListener() {} };
const window = { matchMedia: () => media, setTimeout: callback => callback(), clearTimeout() {}, innerWidth: 390 };
const context = vm.createContext({ window, document, requestAnimationFrame: callback => callback(), NodeFilter: { SHOW_TEXT: 4 } });
vm.runInContext(load('assets/manuals-data.js'), context, { filename: 'assets/manuals-data.js' });
vm.runInContext(load('assets/wd-growth-individual-guide.js'), context, { filename: 'assets/wd-growth-individual-guide.js' });
vm.runInContext(load('assets/catalog-core.js'), context, { filename: 'assets/catalog-core.js' });
vm.runInContext(load('assets/catalog-ui.js'), context, { filename: 'assets/catalog-ui.js' });
vm.runInContext(load('assets/mybooks-selectors.js'), context, { filename: 'assets/mybooks-selectors.js' });
vm.runInContext(load('assets/reader-coordinator.js'), context, { filename: 'assets/reader-coordinator.js' });
vm.runInContext(load('assets/app.js'), context, { filename: 'assets/app.js' });

const catalog = window.WD_LIBRARY_DATA;
assert.ok(catalog.categories.length > 0);
assert.ok(catalog.manuals.length > 0);
assert.ok(catalog.manuals.some(b => b.status === 'published'));
assert.ok(catalog.manuals.filter(b => b.status !== 'published').every(b => b.pages.length === 0),
  'Only demo/publicly approved contents should have pages');
assert.equal(nodes.manualGrid.children.length, catalog.manuals.length);
assert.equal(nodes.statPublished.textContent, String(catalog.manuals.filter(b => b.status === 'published').length));
assert.equal(nodes.statPending.textContent, String(catalog.manuals.filter(b => b.status !== 'published').length));
const guide = catalog.manuals.find(b => b.id === 'wd-growth-individual-plan');
assert.ok(guide && ['review', 'published'].includes(guide.status));
if (guide.status === 'published') assert.ok(guide.pages.length > 0);
else assert.equal(guide.pages.length, 0);

function openFirstBook() {
  const cardBody = nodes.manualGrid.children[0].children[2];
  const footer = cardBody.children.at(-1);
  const button = footer.children.find(el => el.tagName === 'button');
  assert.ok(button, 'Published demo should have an open action');
  button.handlers.click();
}
const firstPageCount = catalog.manuals[0].pages.length;
openFirstBook();
assert.equal(nodes.readerDialog.open, true);
assert.equal(nodes.pageCounter.textContent, `หน้า 1–2 / ${firstPageCount}`);
assert.equal(nodes.tocItems.children.length, firstPageCount);
nodes.nextPage.handlers.click();
assert.equal(nodes.pageCounter.textContent, `หน้า 3–4 / ${firstPageCount}`);
nodes.prevPage.handlers.click();
assert.equal(nodes.pageCounter.textContent, `หน้า 1–2 / ${firstPageCount}`);
nodes.readerClose.handlers.click();
assert.equal(nodes.readerDialog.open, false);

nodes.searchInput.handlers.input({ target: { value: 'unmatched-zzzz' } });
assert.equal(nodes.manualGrid.children.length, 0);
assert.equal(nodes.emptyResults.hidden, false);
nodes.searchInput.handlers.input({ target: { value: '' } });
assert.equal(nodes.manualGrid.children.length, catalog.manuals.length);

media.matches = true;
openFirstBook();
assert.equal(nodes.pageCounter.textContent, `หน้า 1 / ${firstPageCount}`);
nodes.nextPage.handlers.click();
assert.equal(nodes.pageCounter.textContent, `หน้า 2 / ${firstPageCount}`);
nodes.readerClose.handlers.click();
// Open the new public essay and verify its table of contents and mobile rendering.
const article = catalog.manuals.find(b => b.id === 'homework-in-ai-age-primary-leadership');
assert.ok(article && article.status === 'published' && article.pages.length >= 20);
const articleCard = nodes.manualGrid.children.find(card =>
  card.children[2].children.some(el => el.tagName === 'h3' && el.textContent === article.title)
);
assert.ok(articleCard, 'Homework in AI age article must appear in catalog');
const articleOpen = articleCard.children[2].children.at(-1).children.find(el => el.tagName === 'button' && el.textContent.includes('เปิดอ่าน'));
assert.ok(articleOpen, 'Public article must be readable');
articleOpen.handlers.click();
assert.equal(nodes.readerDialog.open, true);
assert.equal(nodes.tocItems.children.length, article.pages.length);
assert.equal(nodes.pageCounter.textContent, `หน้า 1–2 / ${article.pages.length}`);
nodes.readerClose.handlers.click();
media.matches = true;
articleOpen.handlers.click();
assert.equal(nodes.pageCounter.textContent, `หน้า 1 / ${article.pages.length}`);
nodes.readerClose.handlers.click();
console.log('Manual Library — offline smoke tests PASS (dynamic catalog + published AI/homework essay)');
