// WD Books UX-P0A smoke test (Node built-ins only).
// Run: node tests/home-p0a.smoke.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const sw = read("sw.js");
assert.match(html, /id="homeSearchInput"/);
assert.match(html, /id="continueFeature"/);
assert.match(html, /id="continueFeatureCard"/);
assert.ok(html.indexOf('id="quickFind"') < html.indexOf('id="library"'));
assert.ok(html.indexOf('id="continueFeature"') < html.indexOf('id="library"'));
assert.ok(html.indexOf('id="library"') < html.indexOf('id="myBooks"'));
assert.ok(html.indexOf('id="myBooks"') < html.indexOf('id="heroTitle"'));
assert.equal((html.match(/class="bottom-nav-item/g) || []).length, 3);
assert.match(html, /assets\/home-p0a\.css/);
assert.match(sw, /wd-manual-public-v6-p0a-home-reading-first-20261023/);
assert.match(sw, /assets\/home-p0a\.css/);

class FakeElement {
  constructor(tag = "div") {
    this.tagName = tag; this.children = []; this.handlers = {};
    this.attrs = {}; this.textContent = ""; this.className = "";
    this.hidden = false; this.open = false; this.disabled = false; this.isConnected = true;
    this.dataset = {}; this.style = { width: "", setProperty() {} };
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  append(...parts) { this.children.push(...parts); }
  replaceChildren(...parts) { this.children = parts; }
  setAttribute(name, value) { this.attrs[name] = value; }
  removeAttribute(name) { delete this.attrs[name]; }
  addEventListener(name, fn) { (this.handlers[name] ||= []).push(fn); }
  closest() { return null; }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; (this.handlers.close || []).forEach(fn => fn()); }
}
const dataStore = Object.create(null);
const storage = {
  getItem: k => dataStore[k] || null,
  setItem: (k,v) => { dataStore[k] = String(v); }
};
function launch() {
  const nodes = new Proxy(Object.create(null), {
    get: (obj, key) => obj[key] ||= new FakeElement()
  });
  const document = {
    body: new FakeElement("body"), documentElement: new FakeElement("html"),
    createElement: tag => new FakeElement(tag),
    getElementById: id => nodes[id],
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}
  };
  const location = { protocol:"https:", hostname:"infobwd.github.io",hash:"",reload() {} };
  const sessionStorage = { getItem: () => null, setItem() {} };
  const navigator = {};
  const window = {
    navigator, location, scrollY:0,
    matchMedia: query => ({
      matches: query.includes("max-width: 850") || query.includes("max-width: 1000"),
      addEventListener() {}
    }),
    setTimeout: fn => fn(), clearTimeout() {}, addEventListener() {}
  };
  const context = vm.createContext({document,window,localStorage:storage,sessionStorage,navigator,location});
  for (const file of [
    "assets/manuals-data.js", "assets/wd-growth-individual-guide.js",
    "assets/experience.js", "assets/app.js"
  ]) vm.runInContext(read(file), context, {filename:file});
  const fire = (el, event, args) => (el.handlers[event] || []).forEach(fn => fn(args));
  return {nodes,window,fire};
}
const first = launch();
const {nodes,window,fire} = first;
assert.equal(nodes.continueFeature.hidden, true, "Resume card is absent for new readers");
assert.equal(nodes.manualGrid.children.length, 7);
assert.equal(nodes.manualGrid.children[0].children[1].textContent.includes("พร้อมอ่าน") ||
  nodes.manualGrid.children[0].children[1].textContent.includes("สาธิต"), true);
assert.equal(nodes.manualGrid.children[1].children[1].textContent.includes("พร้อมอ่าน"), true);
assert.equal(nodes.manualGrid.children[2].children[1].textContent.includes("พร้อมอ่าน"), false);
const published = window.WD_LIBRARY_DATA.manuals.filter(book => book.status === "published");
assert.equal(published.length, 2);
const search = nodes.homeSearchInput;
search.value = "WD Growth";
fire(search, "input", {target:search});
assert.equal(nodes.searchInput.value, "WD Growth", "Both search fields synchronize");
assert.ok(nodes.manualGrid.children.length >= 1);
nodes.searchInput.value = "";
fire(nodes.searchInput, "input", {target:nodes.searchInput});
assert.equal(search.value, "");
assert.equal(nodes.manualGrid.children.length, 7);
const book = window.WD_LIBRARY_DATA.manuals[0];
const cardFooter = nodes.manualGrid.children[0].children[2].children.at(-1);
const open = cardFooter.children.find(child => child.className === "open-book");
fire(open, "click");
assert.equal(nodes.readerDialog.open, true);
assert.equal(nodes.continueFeature.hidden, false, "Resume becomes visible after opening");
assert.equal(nodes.continueFeatureCard.children.length, 1);
fire(nodes.nextPage, "click");
assert.equal(window.WD_EXPERIENCE.getProgress(book.id), 1);
assert.match(nodes.continueFeatureCard.children[0].children[1].children[3].textContent, /หน้า 2 จาก 8/);
fire(nodes.readerCloseThumb, "click");
assert.equal(nodes.readerDialog.open, false);
const original = JSON.parse(dataStore["wd-manual-reader-v2"]);
assert.equal(original.progress[book.id], 1);
const second = launch();
assert.equal(second.nodes.continueFeature.hidden, false, "Resume survives restart");
assert.match(second.nodes.continueFeatureCard.children[0].children[1].children[3].textContent, /หน้า 2 จาก 8/);
const action = second.nodes.continueFeatureCard.children[0].children[1].children.at(-1);
second.fire(action, "click");
assert.equal(second.nodes.readerDialog.open, true);
assert.equal(second.nodes.pageCounter.textContent, "หน้า 2 / 8", "Resume returns to saved page");
assert.equal(second.nodes.continueFeatureCard.children[0].children[1].children.at(-1), action,
  "Saving progress does not destroy the active resume button");
console.log("WD Books UX-P0A smoke PASS: homepage/search/published-first/resume/localStorage/PWA shell");
