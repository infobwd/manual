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
    this.classList = { toggle() {}, add() {}, remove() {} };
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = value; }
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
const document = { createElement: tag => new FakeElement(tag), getElementById: id => nodes[id] };
const media = { matches: false, addEventListener() {} };
const window = { matchMedia: () => media, setTimeout: callback => callback() };
const context = vm.createContext({ window, document });
vm.runInContext(load('assets/manuals-data.js'), context, { filename: 'assets/manuals-data.js' });
vm.runInContext(load('assets/wd-growth-individual-guide.js'), context, { filename: 'assets/wd-growth-individual-guide.js' });
vm.runInContext(load('assets/catalog-core.js'), context, { filename: 'assets/catalog-core.js' });
vm.runInContext(load('assets/app.js'), context, { filename: 'assets/app.js' });

const catalog = window.WD_LIBRARY_DATA;
assert.equal(catalog.categories.length, 7);
assert.equal(catalog.manuals.length, 7);
assert.equal(catalog.manuals.filter(b => b.status === 'published').length, 2);
assert.ok(catalog.manuals.filter(b => b.status !== 'published').every(b => b.pages.length === 0),
  'Only demo/publicly approved contents should have pages');
assert.equal(nodes.manualGrid.children.length, 7);
assert.equal(nodes.statPublished.textContent, '2');
assert.equal(nodes.statPending.textContent, '5');
const guide = catalog.manuals.find(b => b.id === 'wd-growth-individual-plan');
assert.ok(guide && guide.status === 'published');
assert.equal(guide.pages.length, 15);
for (let n = 1; n <= 7; n++) assert.ok(guide.pages.some(p => p.title.startsWith('0' + n + ' ')));
assert.ok(guide.pages.some(p => p.title.includes('ปฐมวัย')));
assert.ok(guide.pages.some(p => p.title.includes('ประถมศึกษา')));

function openFirstBook() {
  const cardBody = nodes.manualGrid.children[0].children[2];
  const footer = cardBody.children.at(-1);
  const button = footer.children.find(el => el.tagName === 'button');
  assert.ok(button, 'Published demo should have an open action');
  button.handlers.click();
}
openFirstBook();
assert.equal(nodes.readerDialog.open, true);
assert.equal(nodes.pageCounter.textContent, 'หน้า 1–2 / 8');
assert.equal(nodes.tocItems.children.length, 8);
nodes.nextPage.handlers.click();
assert.equal(nodes.pageCounter.textContent, 'หน้า 3–4 / 8');
nodes.prevPage.handlers.click();
assert.equal(nodes.pageCounter.textContent, 'หน้า 1–2 / 8');
nodes.readerClose.handlers.click();
assert.equal(nodes.readerDialog.open, false);

nodes.searchInput.handlers.input({ target: { value: 'unmatched-zzzz' } });
assert.equal(nodes.manualGrid.children.length, 0);
assert.equal(nodes.emptyResults.hidden, false);
nodes.searchInput.handlers.input({ target: { value: '' } });
assert.equal(nodes.manualGrid.children.length, 7);

media.matches = true;
openFirstBook();
assert.equal(nodes.pageCounter.textContent, 'หน้า 1 / 8');
nodes.nextPage.handlers.click();
assert.equal(nodes.pageCounter.textContent, 'หน้า 2 / 8');
nodes.readerClose.handlers.click();
// Reader works for the newly published individual plan, not only for the demo book.
media.matches = false;
const guideCard = nodes.manualGrid.children.find(card =>
  card.children[2].children.some(el => el.tagName === 'h3' && el.textContent.includes('พัฒนาผู้เรียนรายบุคคล'))
);
assert.ok(guideCard, 'Public individual-plan guide must appear in catalog');
const guideOpen = guideCard.children[2].children.at(-1).children.find(el => el.tagName === 'button');
assert.ok(guideOpen, 'Public guide must be readable');
guideOpen.handlers.click();
assert.equal(nodes.readerDialog.open, true);
assert.equal(nodes.tocItems.children.length, 15);
assert.equal(nodes.pageCounter.textContent, 'หน้า 1–2 / 15');
nodes.readerClose.handlers.click();
console.log('Manual Library — offline smoke tests PASS (catalog + 15-page guide)');
