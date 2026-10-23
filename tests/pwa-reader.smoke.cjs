// WD Books PWA reader smoke tests. Local-only; no npm, network or user data.
// Run: node tests/pwa-reader.smoke.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

class FakeElement {
  constructor(tag = "div") {
    this.tagName = tag; this.children = []; this.handlers = {};
    this.attrs = {}; this.dataset = {}; this.textContent = "";
    this.className = ""; this.hidden = false; this.open = false;
    this.disabled = false; this.isConnected = true; this.style = { setProperty() {} };
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  append(...args) { this.children.push(...args); }
  replaceChildren(...args) { this.children = args; }
  setAttribute(name, value) { this.attrs[name] = value; }
  removeAttribute(name) { delete this.attrs[name]; }
  addEventListener(name, cb) { (this.handlers[name] ||= []).push(cb); }
  closest() { return null; }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() {
    this.open = false;
    (this.handlers.close || []).forEach(fn => fn());
  }
}
const saved = {};
const localStorage = {
  getItem: key => saved[key] ?? null,
  setItem: (key, val) => { saved[key] = String(val); }
};
const sessionStorage = { getItem: () => null, setItem() {} };

function launch() {
  const nodes = new Proxy({}, {
    get(target, id) { return target[id] ||= new FakeElement(); }
  });
  const document = {
    body: new FakeElement("body"),
    documentElement: new FakeElement("html"),
    createElement: tag => new FakeElement(tag),
    getElementById: id => nodes[id],
    querySelector: () => null,
    querySelectorAll: () => [],
    handlers: {},
    addEventListener(type, cb) { (this.handlers[type] ||= []).push(cb); }
  };
  let reloads = 0;
  const location = {
    protocol: "https:", hostname: "infobwd.github.io", hash: "",
    reload() { reloads++; }
  };
  const navigator = {};
  const window = {
    navigator, location, scrollY: 0,
    matchMedia: query => ({
      matches: query.includes("max-width: 850") || query.includes("max-width: 1000"),
      addEventListener() {}
    }),
    addEventListener() {},
    setTimeout: callback => callback(),
    clearTimeout() {}
  };
  const context = vm.createContext({
    window, document, localStorage, sessionStorage, navigator, location
  });
  for (const file of ["assets/manuals-data.js", "assets/wd-growth-individual-guide.js",
    "assets/experience.js", "assets/app.js"]) {
    vm.runInContext(read(file), context, { filename: file });
  }
  const fire = (node, type, event) => (node.handlers[type] || []).forEach(fn => fn(event));
  const gesture = (type, x, y) => fire(document, type, {
    touches: type === "touchend" ? [] : [{ clientX: x, clientY: y }],
    target: new FakeElement(), cancelable: true, preventDefault() {}
  });
  return { nodes, window, fire, gesture, getReloads: () => reloads };
}

const a = launch();
assert.equal(a.nodes.appSplash.hidden, true, "Splash should dismiss");
assert.equal(a.nodes.manualGrid.children.length, 7);
assert.equal(a.nodes.favoritesShelf.children.length, 1, "Empty-state message appears");
const demoId = a.window.WD_LIBRARY_DATA.manuals[0].id;
const firstCard = a.nodes.manualGrid.children[0];
const footer = firstCard.children[2].children.at(-1);
const [open, favorite] = footer.children.filter(el => el.tagName === "button");
assert.ok(open && favorite);
a.fire(favorite, "click");
assert.equal(a.window.WD_EXPERIENCE.isFavorite(demoId), true);
assert.equal(a.nodes.favoritesShelf.children.length, 1);
assert.equal(a.nodes.favoritesCount.textContent, "1 เล่ม");
a.fire(open, "click");
assert.equal(a.nodes.readerDialog.open, true);
assert.equal(a.nodes.readerCloseThumb.focused, true, "One-handed close should receive focus");
a.fire(a.nodes.nextPage, "click");
assert.equal(a.window.WD_EXPERIENCE.getProgress(demoId), 1);
assert.equal(a.window.WD_EXPERIENCE.getHistory()[0], demoId);
a.gesture("touchstart", 20, 10);
a.gesture("touchmove", 20, 155);
a.gesture("touchend", 20, 155);
assert.equal(a.getReloads(), 0, "Pull must not reload while reading");
a.fire(a.nodes.readerCloseThumb, "click");
assert.equal(a.nodes.readerDialog.open, false);
a.gesture("touchstart", 20, 10);
a.gesture("touchmove", 20, 155);
a.gesture("touchend", 20, 155);
assert.equal(a.getReloads(), 1, "Pull on Home at top should reload");
const stored = JSON.parse(saved["wd-manual-reader-v2"]);
assert.deepEqual(stored.favorites, [demoId]);
assert.deepEqual(stored.history, [demoId]);
assert.equal(stored.progress[demoId], 1);

const b = launch();
assert.equal(b.window.WD_EXPERIENCE.isFavorite(demoId), true, "Favorite should survive reopening");
assert.equal(b.window.WD_EXPERIENCE.getProgress(demoId), 1, "Last page should survive reopening");
assert.equal(b.nodes.recentShelf.children.length, 1, "Recent shelf should be restored");
assert.equal(b.nodes.favoritesShelf.children.length, 1, "Favorites shelf should be restored");
const again = b.nodes.manualGrid.children[0].children[2].children.at(-1).children.find(el => el.className === "open-book");
b.fire(again, "click");
assert.equal(b.nodes.pageCounter.textContent, "หน้า 2 / 8", "Reader resumes exact saved page");
b.fire(b.nodes.readerCloseThumb, "click");
const savedRow = b.nodes.favoritesShelf.children[0];
const remove = savedRow.children[1].children.at(-1).children.find(el => el.className === "remove-favorite");
b.fire(remove, "click");
assert.equal(b.window.WD_EXPERIENCE.getFavorites().length, 0);
console.log("WD Books — PWA reader smoke PASS (splash/favorites/history/resume/thumb close/pull)");
