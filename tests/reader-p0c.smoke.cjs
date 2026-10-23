// UX-P0C: swipe, page-edge tap and accessible reading-focus smoke.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html"), sw = read("sw.js"), css = read("assets/reader-p0c.css");
for (const id of ["readerFocusToggle", "bookSpread", "readerTopbar", "readerBottom", "readerCloseThumb"]) {
  assert.match(html, new RegExp('id="' + id + '"'));
}
assert.match(html, /assets\/reader-p0c\.css/);
assert.match(sw, /assets\/reader-p0c\.css/);
assert.match(sw, /wd-manual-public-v8-p0c-swipe-focus-20261023/);
assert.match(css, /\.reader-dialog\.reader-focus \.reader-close-thumb/);
assert.match(css, /position:static/);
class El {
  constructor(tag,doc) {
    this.tagName=tag;this.doc=doc;this.children=[];this.handlers={};this.attrs={};
    this.className="";this.hidden=false;this.open=false;this.inert=false;this.isConnected=true;
    this.textContent="";this.dataset={};this.style={width:"",setProperty(){}};
    this.classes = new Set();
    this.classList = {add: name=>this.classes.add(name),remove:name=>this.classes.delete(name),
      toggle:(name,force)=>{const on=force===undefined?!this.classes.has(name):force;
        if(on)this.classes.add(name);else this.classes.delete(name);return on;}};
  }
  append(...args){this.children.push(...args);}
  replaceChildren(...args){this.children=args;}
  setAttribute(a,b){this.attrs[a]=b;}
  removeAttribute(a){delete this.attrs[a];}
  addEventListener(name,handler){(this.handlers[name] ||= []).push(handler);}
  focus(){this.doc.activeElement=this;}
  showModal(){this.open=true;}
  close(){this.open=false;(this.handlers.close||[]).forEach(fn=>fn());}
  contains(x){return this===x;}
  querySelector(s){return s==="span"?this.children.find(c=>c.tagName==="span"):null;}
  closest(s){
    if(s===".book-page")return this.isBookPage?this:null;
    if(this.tagName==="button"&&s.includes("button"))return this;
    return null;
  }
  getBoundingClientRect(){return {left:30,width:300};}
}
const nodes={};
const document={
  body:null,documentElement:null,activeElement:null,
  getElementById:id=>nodes[id] ||= new El("div",document),
  createElement:tag=>new El(tag,document),
  querySelector:selector=>selector===".reader-topbar"?nodes.readerTopbar ||= new El("div",document)
    :selector===".reader-content"?nodes.readerContent ||= new El("div",document):null,
  querySelectorAll:()=>[],addEventListener(){}
};
document.body=new El("body",document);
document.documentElement=new El("html",document);
nodes.readerFocusToggle=new El("button",document);
nodes.readerFocusToggle.append(new El("span",document));
nodes.pageLeft=new El("article",document);nodes.pageLeft.isBookPage=true;
nodes.pageRight=new El("article",document);nodes.pageRight.isBookPage=true;
document.getElementById("mobileTocSheet").hidden=true;
const stored={};const localStorage={
  getItem:key=>stored[key]||null,setItem:(key,val)=>{stored[key]=String(val);}
};
const sessionStorage={getItem:()=>null,setItem(){}};
const location={protocol:"https:",hostname:"infobwd.github.io",hash:"",reload(){}};
let reducedMotion=false,hasSelection=false;
const navigator={};
const mobileQuery={matches:true,addEventListener(){}};
const window={
  navigator,location,innerWidth:390,scrollY:0,
  matchMedia:q=>q.includes("max-width: 850")?mobileQuery:({
    matches:q.includes("max-width: 1000")?true:reducedMotion,addEventListener(){}
  }),
  getSelection:()=>({toString:()=>hasSelection?"selected words":""}),
  setTimeout:fn=>fn(),clearTimeout(){},addEventListener(){}
};
const context=vm.createContext({document,window,location,navigator,localStorage,sessionStorage});
for(const file of ["assets/manuals-data.js","assets/wd-growth-individual-guide.js","assets/experience.js","assets/app.js"]){
  vm.runInContext(read(file),context,{filename:file});
}
const fire=(node,type,event={})=>(node.handlers[type]||[]).forEach(fn=>fn(event));
const book=window.WD_LIBRARY_DATA.manuals[0];
const openButton=nodes.manualGrid.children[0].children[2].children.at(-1).children.find(x=>x.className==="open-book");
fire(openButton,"click");
assert.equal(nodes.readerDialog.open,true);
assert.equal(nodes.readerFocusToggle.attrs["aria-pressed"],"false");
assert.equal(nodes.pageCounter.textContent,"หน้า 1 / 8");
const current=()=>window.WD_EXPERIENCE.getProgress(book.id);
const point=(x,y)=>({clientX:x,clientY:y});
const touch=(name,x,y,target=nodes.pageLeft)=>fire(nodes.bookSpread,name,{
  target,touches:name==="touchend"?[]:[point(x,y)],
  changedTouches:[point(x,y)]
});
const gesture=(x1,y1,x2,y2,target=nodes.pageLeft)=>{
  touch("touchstart",x1,y1,target);touch("touchmove",x2,y2,target);touch("touchend",x2,y2,target);
};
// Edge taps, middle taps and selected text are separate from swipes.
fire(nodes.bookSpread,"click",{target:nodes.pageLeft,clientX:310,detail:1});
assert.equal(current(),1,"Right-side tap should open next page");
fire(nodes.bookSpread,"click",{target:nodes.pageLeft,clientX:40,detail:1});
assert.equal(current(),0,"Left-side tap should open previous page");
fire(nodes.bookSpread,"click",{target:nodes.pageLeft,clientX:180,detail:1});
assert.equal(nodes.readerDialog.classes.has("reader-focus"),true,"Center tap enters focus mode");
assert.equal(nodes.readerFocusToggle.attrs["aria-pressed"],"true");
assert.equal(nodes.readerFocusToggle.children[0].textContent,"แสดงเมนู");
fire(nodes.readerDialog,"keydown",{key:"Escape",preventDefault(){this.done=true;}});
assert.equal(nodes.readerDialog.open,true);
assert.equal(nodes.readerDialog.classes.has("reader-focus"),false,"Escape restores chrome before closing");
fire(nodes.readerFocusToggle,"click");
assert.equal(nodes.readerDialog.classes.has("reader-focus"),true,"Focusable toggle enters focus");
const cancel={preventDefault(){this.prevented=true;}};
fire(nodes.readerDialog,"cancel",cancel);
assert.equal(cancel.prevented,true);
assert.equal(nodes.readerDialog.classes.has("reader-focus"),false);
gesture(245,170,135,174);
assert.equal(current(),1,"Left swipe advances");
const saved=JSON.parse(stored["wd-manual-reader-v2"]);
assert.equal(saved.progress[book.id],1,"Swipe saves old storage format");
gesture(140,170,250,172);
assert.equal(current(),0,"Right swipe goes back");
gesture(180,100,187,220);
assert.equal(current(),0,"Vertical scroll must not flip");
gesture(240,100,150,190);
assert.equal(current(),0,"Diagonal scrolling must not flip");
gesture(16,110,150,110);
assert.equal(current(),0,"Starting at OS edge must not flip");
gesture(160,110,240,110,new El("button",document));
assert.equal(current(),0,"Interactive content must not swipe");
hasSelection=true;gesture(230,150,130,150);hasSelection=false;
assert.equal(current(),0,"Text selection disables swipe");
touch("touchstart",230,150);touch("touchmove",150,150);fire(nodes.bookSpread,"touchcancel");
touch("touchend",150,150);assert.equal(current(),0,"Cancelled gesture does nothing");
// Synthetic click after a touch swipe must not trigger an extra page turn.
gesture(240,170,130,171);
assert.equal(current(),1);
fire(nodes.bookSpread,"click",{target:nodes.pageLeft,clientX:310,detail:1});
assert.equal(current(),1,"Click after swipe must be suppressed");
fire(nodes.openMobileToc,"click");
assert.equal(nodes.mobileTocSheet.hidden,false);
gesture(140,140,250,140);assert.equal(current(),1,"Gesture blocked behind open table of contents");
fire(nodes.closeMobileToc,"click");
reducedMotion=true;
gesture(240,170,130,172);
assert.equal(current(),2,"Reduced-motion swipe still navigates");
reducedMotion=false;
fire(nodes.readerFocusToggle,"click");
assert.equal(nodes.readerDialog.classes.has("reader-focus"),true);
fire(nodes.readerCloseThumb,"click");
assert.equal(nodes.readerDialog.open,false);
assert.equal(nodes.readerDialog.classes.has("reader-focus"),false,"Closing resets focus mode");
fire(openButton,"click");
assert.equal(nodes.readerDialog.classes.has("reader-focus"),false,"Reopening starts with normal controls");
assert.equal(nodes.pageCounter.textContent,"หน้า 3 / 8","Progress survives closing");
console.log("WD Books UX-P0C PASS (swipes, edges, vertical/diagonal/selection, ToC, focus, Esc, reduce-motion, storage)");
