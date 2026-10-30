// PWA reading preferences regression against the current WD Books Experience module.
// Node-only, no browser/network or real student/user data. Not a Safari test.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const saved = Object.create(null);
const localStorage = {
  getItem: key => saved[key] ?? null,
  setItem: (key, value) => { saved[key] = String(value); },
};
const sessionStorage = { getItem: () => null, setItem() {} };

function launch() {
  const elements = {};
  class FakeElement {
    constructor() {
      this.handlers = {}; this.attributes = {}; this.children = [];
      this.style = { setProperty() {} }; this.dataset = {};
      this.hidden = false; this.open = false; this.disabled = false;
      this.textContent = ""; this.value = ""; this.classSet = new Set();
      this.classList = {
        add: (...names) => names.forEach(name => this.classSet.add(name)),
        remove: (...names) => names.forEach(name => this.classSet.delete(name)),
        toggle: (name, forced) => {
          const yes = forced === undefined ? !this.classSet.has(name) : forced;
          yes ? this.classSet.add(name) : this.classSet.delete(name);
          return yes;
        },
        contains: name => this.classSet.has(name),
      };
    }
    addEventListener(type, callback) { (this.handlers[type] ||= []).push(callback); }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    removeAttribute(name) { delete this.attributes[name]; }
    closest() { return null; }
    focus() { this.focused = true; }
    showModal() { this.open = true; }
    close() { this.open = false; this.fire("close", {}); }
    fire(type, event) { (this.handlers[type] || []).forEach(fn => fn(event)); }
  }
  const get = id => elements[id] ||= new FakeElement();
  const events = {};
  const document = {
    body: get("body"), documentElement: get("html"),
    getElementById: get, querySelector: () => null, querySelectorAll: () => [],
    addEventListener(type, callback) { (events[type] ||= []).push(callback); },
  };
  let reloads = 0;
  const location = { protocol: "https:", hostname: "infobwd.github.io", hash: "",
    reload() { reloads++; } };
  const navigator = { userAgent: "Test", onLine: true };
  const releaseSource = read("assets/app-version.js");
  const release = releaseSource.match(/WD_BOOKS_VERSION\s*=\s*"(\d+\.\d+\.\d+)"/);
  assert(release, "the test must read the published version source");
  const window = { navigator, location, scrollY: 0, WD_BOOKS_VERSION: release[1],
    matchMedia: query => ({
      matches: /max-width:\s*(?:850|1000)px/.test(query),
      addEventListener() {},
    }),
    addEventListener() {}, setTimeout: fn => { fn(); return 1; }, clearTimeout() {},
  };
  const context = vm.createContext({window,document,localStorage,sessionStorage,navigator,location});
  for(const file of [
    "assets/manuals-data.js",
    "assets/bwd-teacher-growth-draft-review-2569.js",
    "assets/wd-growth-insights-review-2569.js",
    "assets/wd-growth-individual-guide.js",
    "assets/wd-growth-plc-information-guide.js",
    "assets/bwd-term2-supervision-readiness-2569.js",
    "assets/experience.js",
  ]) vm.runInContext(read(file), context, {filename:file});
  const fireDocument = (type, x, y) => {
    const fingers = type === "touchend" ? [] : [{clientX:x,clientY:y}];
    for(const cb of events[type] || [])cb({
      touches:fingers, target:new FakeElement(), cancelable:true, preventDefault() {}
    });
  };
  return {elements,get,window,fireDocument,reloads:()=>reloads};
}

const a=launch(), exp=a.window.WD_EXPERIENCE;
const books=a.window.WD_LIBRARY_DATA.manuals;
const published=books.filter(book=>book.status==="published");
assert.equal(books.length,32,"all six public catalog modules must load");
assert.equal(published.length,27,"public published books present");
assert.equal(a.get("appSplash").hidden,true,"splash dismisses");
const first=published[0], id=first.id;
const draft=books.find(book=>book.status!=="published");
assert(draft,"unpublished content must remain protected");
assert.equal(exp.toggleFavorite(draft.id),false,"draft cannot be favorited");
assert.equal(exp.toggleFavorite(id),true);
assert.equal(exp.isFavorite(id),true);
assert.equal(exp.toggleBookmark(id,2),true);
assert.equal(exp.isBookmarked(id,2),true);
assert.equal(exp.toggleBookmark(id,-1),false,"invalid index denied");
exp.recordProgress(id,3);
assert.equal(exp.getProgress(id),3);
assert.equal(exp.getHistory()[0],id);
assert.equal(exp.getFavorites().length,1);
assert.equal(exp.getBookmarks(id).length,1);
const persisted=JSON.parse(saved["wd-manual-reader-v2"]);
assert.deepEqual(Array.from(persisted.favorites),[id]);
assert.deepEqual(Array.from(persisted.history),[id]);
assert.equal(persisted.progress[id],3);
assert.deepEqual(Array.from(persisted.bookmarks[id]),[2]);

// The actual Experience module blocks pull-refresh during a native book dialog.
a.get("readerDialog").open=true;
for(const [event,x,y] of [["touchstart",20,10],["touchmove",20,155],["touchend",20,155]])
  a.fireDocument(event,x,y);
assert.equal(a.reloads(),0,"reading must not trigger pull-refresh");
a.get("readerDialog").open=false;
for(const [event,x,y] of [["touchstart",20,10],["touchmove",20,155],["touchend",20,155]])
  a.fireDocument(event,x,y);
assert.equal(a.reloads(),1,"Home pull-refresh should reload");

// The same saved key restores state and the Continue callback opens the saved book.
const b=launch(), restored=b.window.WD_EXPERIENCE;
assert.equal(restored.getProgress(id),3);
assert.equal(restored.isFavorite(id),true);
assert.deepEqual(Array.from(restored.getBookmarks(id)),[2]);
let resumed=null;
restored.bindReader(()=>{},(book,opener)=>{resumed={book,opener};});
b.get("navContinue").fire("click",{});
assert.equal(resumed?.book?.id,id,"Continue must open the persisted book");
assert.equal(resumed?.opener,b.get("navContinue"));
assert.equal(restored.toggleFavorite(id),false);
assert.equal(restored.getFavorites().length,0);
// Static bridge contracts are verified in addition to executing the real Experience module.
const app=read("assets/app.js");
assert(app.includes("window.WD_EXPERIENCE?.bindReader?.("));
assert(app.includes('dialog.addEventListener("close"'));
assert(app.includes('$("readerClose").addEventListener("click"'));
console.log("PWA reader PASS: 32/27 catalog, favorites/bookmarks/history/progress, resume and pull-refresh blocked in Reader.");
