// WD Books UX-P0B mobile ToC smoke (Node built-ins only).
// Run: node tests/mobile-toc-p0b.smoke.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const sw = read("sw.js");
for (const id of ["openMobileToc", "mobileTocSheet", "mobileTocBackdrop", "mobileTocItems", "closeMobileToc", "mobileTocStatus"]) {
  assert.match(html, new RegExp('id="' + id + '"'));
}
assert.match(html, /assets\/toc-p0b\.css/);
assert.match(sw, /assets\/toc-p0b\.css/);
assert.match(sw, /wd-manual-public-v7-p0b-mobile-toc-20261023/);
assert.match(html, /aria-controls="mobileTocSheet"/);
class El {
  constructor(tag = "div", doc) {
    this.tagName = tag; this.doc = doc; this.children = []; this.handlers = {};
    this.attrs = {}; this.className = ""; this.hidden = false; this.open = false;
    this.isConnected = true; this.inert = false; this.textContent = ""; this.dataset = {};
    this.style = { width: "", setProperty() {} };
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  append(...parts) { this.children.push(...parts); }
  replaceChildren(...parts) { this.children = parts; }
  setAttribute(k,v) { this.attrs[k] = v; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(k,v) { (this.handlers[k] ||= []).push(v); }
  focus() { this.doc.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; (this.handlers.close || []).forEach(fn => fn()); }
  closest() { return null; }
}
function makePage(isMobile = true) {
  const nodes = {};
  const document = {
    activeElement: null, body: null, documentElement: null,
    getElementById: id => nodes[id] ||= new El("div",document),
    createElement: tag => new El(tag,document),
    querySelector: selector => selector === ".reader-topbar" ? nodes.readerTopbar ||= new El("div",document)
      : selector === ".reader-content" ? nodes.readerContent ||= new El("div",document) : null,
    querySelectorAll: () => [], addEventListener() {}
  };
  document.body = new El("body", document);
  document.documentElement = new El("html",document);
  document.getElementById("mobileTocSheet").hidden = true;
  const store = {};
  const localStorage = {getItem: k => store[k] || null,setItem: (k,v) => store[k] = String(v)};
  const sessionStorage = {getItem:()=>null,setItem(){}};
  const location = {protocol:"https:",hostname:"infobwd.github.io",hash:"",reload(){}};
  const navigator = {};
  const listeners = {};
  const mobileQuery = {
    matches:isMobile, addEventListener: (event,cb) => listeners.mobileChange=cb
  };
  const window = {
    navigator,location,scrollY:0,
    matchMedia:q=>q.includes("max-width: 850")?mobileQuery:{
      matches:q.includes("max-width: 1000"),addEventListener(){}
    },
    setTimeout:cb=>cb(),clearTimeout(){},addEventListener(){}
  };
  const ctx = vm.createContext({document,window,localStorage,sessionStorage,location,navigator});
  for (const p of ["assets/manuals-data.js", "assets/wd-growth-individual-guide.js", "assets/experience.js", "assets/app.js"])
    vm.runInContext(read(p),ctx,{filename:p});
  const fire = (el,type,evt={}) => (el.handlers[type] || []).forEach(fn=>fn(evt));
  return {nodes,document,window,store,fire,mobileQuery,listeners};
}
const page = makePage(), {nodes,window,document,fire} = page;
const book = window.WD_LIBRARY_DATA.manuals[0];
assert.equal(nodes.readerDialog.open, false);
const button = nodes.manualGrid.children[0].children[2].children.at(-1).children.find(el=>el.className==="open-book");
fire(button,"click");
assert.equal(nodes.readerDialog.open, true);
assert.equal(nodes.mobileTocItems.children.length,book.pages.length);
assert.equal(nodes.mobileTocStatus.textContent.includes(book.title),true);
assert.equal(nodes.mobileTocItems.children[0].attrs["aria-current"],"page");
const previousFocus = nodes.readerCloseThumb;
assert.equal(document.activeElement,previousFocus);
fire(nodes.openMobileToc,"click");
assert.equal(nodes.mobileTocSheet.hidden,false);
assert.equal(nodes.openMobileToc.attrs["aria-expanded"],"true");
assert.equal(document.activeElement,nodes.closeMobileToc);
assert.equal(nodes.readerContent.inert,true);
assert.equal(nodes.readerTopbar.inert,true);
const earlierPage=window.WD_EXPERIENCE.getProgress(book.id);
const arrow={key:"ArrowRight",preventDefault(){this.prevented=true}};
fire(nodes.readerDialog,"keydown",arrow);
assert.equal(window.WD_EXPERIENCE.getProgress(book.id),earlierPage,"Arrow must not flip page under ToC");
const shiftTab={key:"Tab",shiftKey:true,preventDefault(){this.prevented=true}};
fire(nodes.mobileTocSheet,"keydown",shiftTab);
assert.equal(shiftTab.prevented,true);
assert.equal(document.activeElement,nodes.mobileTocItems.children.at(-1));
const forwardTab={key:"Tab",shiftKey:false,preventDefault(){this.prevented=true}};
fire(nodes.mobileTocSheet,"keydown",forwardTab);
assert.equal(forwardTab.prevented,true);
assert.equal(document.activeElement,nodes.closeMobileToc);
fire(nodes.mobileTocItems.children[4],"click");
assert.equal(nodes.mobileTocSheet.hidden,true);
assert.equal(nodes.openMobileToc.attrs["aria-expanded"],"false");
assert.equal(nodes.readerContent.inert,false);
assert.equal(nodes.readerTopbar.inert,false);
assert.equal(document.activeElement,previousFocus);
assert.equal(window.WD_EXPERIENCE.getProgress(book.id),4);
assert.equal(nodes.pageCounter.textContent,"หน้า 5 / 8");
fire(nodes.openMobileToc,"click");
const esc={key:"Escape",preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}};
fire(nodes.mobileTocSheet,"keydown",esc);
assert.equal(esc.prevented,true);
assert.equal(nodes.mobileTocSheet.hidden,true);
assert.equal(nodes.readerDialog.open,true);
fire(nodes.openMobileToc,"click");
const cancel={preventDefault(){this.prevented=true}};
fire(nodes.readerDialog,"cancel",cancel);
assert.equal(cancel.prevented,true);
assert.equal(nodes.mobileTocSheet.hidden,true);
fire(nodes.openMobileToc,"click");
fire(nodes.mobileTocBackdrop,"click");
assert.equal(nodes.mobileTocSheet.hidden,true);
fire(nodes.openMobileToc,"click");
page.mobileQuery.matches=false;
page.listeners.mobileChange();
assert.equal(nodes.mobileTocSheet.hidden,true,"Closing when changing to desktop");
fire(nodes.readerCloseThumb,"click");
assert.equal(nodes.readerDialog.open,false);
assert.equal(window.WD_EXPERIENCE.getProgress(book.id),4,"Saved page survives closing");
console.log("WD Books UX-P0B ToC PASS (chapters/current/focus/Escape/Back/backdrop/resizing/progress)");
