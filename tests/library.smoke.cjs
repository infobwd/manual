// WD Books offline library regression — actual public catalog, filter UI and My Books selectors.
// Node-only; no PWA deployment, private/student data or mocked book counts.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");

class Element {
  constructor(dataset={}) {
    this.handlers={};this.attrs={};this.dataset=dataset;
    this.children=[];this.hidden=false;this.textContent="";
    this.value="";this.classList={toggle(){}};
  }
  replaceChildren(...children){this.children=children;}
  setAttribute(key,value){this.attrs[key]=String(value);}
  addEventListener(type,callback){this.handlers[type]=callback;}
  fire(type,event={}){if(!this.handlers[type])throw Error("Missing "+type+" listener");this.handlers[type](event);}
  focus(){this.focused=true;}
}
const nodes={};
const $=id=>nodes[id] ||= new Element();
const filters=[new Element({discoveryFilter:"all"}),new Element({discoveryFilter:"ready"}),new Element({discoveryFilter:"upcoming"})];
const document={querySelectorAll:selector=>selector==="[data-discovery-filter]"?filters:[]};
const window={};
const context=vm.createContext({window,document});
for(const file of [
  "assets/manuals-data.js",
  "assets/bwd-teacher-growth-draft-review-2569.js",
  "assets/wd-growth-insights-review-2569.js",
  "assets/wd-growth-individual-guide.js",
  "assets/wd-growth-plc-information-guide.js",
  "assets/bwd-term2-supervision-readiness-2569.js",
  "assets/catalog-core.js",
  "assets/catalog-ui.js",
  "assets/mybooks-selectors.js",
])vm.runInContext(read(file),context,{filename:file});

const data=window.WD_LIBRARY_DATA;
assert(data.manuals.length>=32,"retain all existing catalog entries");
const publishedCount=data.manuals.filter(b=>b.status==="published").length;
assert(publishedCount>=27,"retain the public review books");
assert.equal(data.categories.length,8);
assert.equal(new Set(data.manuals.map(b=>b.id)).size,data.manuals.length,"no duplicated books");
assert(data.manuals.filter(b=>b.status!=="published").every(b=>b.pages.length===0),
  "unpublished drafts must not expose content");
const core=window.WD_CATALOG_CORE.createCatalogCore(data);
const state={category:"all",availability:"all",sort:"default",query:""};
let categoryRenders=0;
const catalog=window.WD_CATALOG_UI.create({
  data,state,$,catalogCore:core,
  normalized:value=>String(value||"").toLocaleLowerCase("th-TH").trim(),
  cardFor:book=>({id:book.id,title:book.title}),
  renderCategories:()=>{categoryRenders++;},
});
catalog.renderCatalog();
assert.equal($("manualGrid").children.length,data.manuals.length,"all public catalog entries render");
assert.equal($("manualGrid").attrs["aria-busy"],"false");
assert($("resultsText").textContent.includes(publishedCount+" เล่ม"),"published count shown");
catalog.bindDiscovery();

// The real Catalog UI input handlers share a query across Home/Books searches.
$("homeSearchInput").fire("input",{target:{value:"  คู่มือครู  "}});
assert.equal($("searchInput").value,"  คู่มือครู  ");
assert($("manualGrid").children.length>0,"Thai text search should match");
assert($("manualGrid").children.length<data.manuals.length,"Thai text search must filter");
$("searchInput").fire("input",{target:{value:"no-such-title-zzzz"}});
assert.equal($("manualGrid").children.length,0,"not-found result shown");
assert.equal($("emptyResults").hidden,false);
$("resetDiscoveryFilters").fire("click");
assert.equal($("manualGrid").children.length,data.manuals.length,"reset restores catalog");
assert.equal(state.query,"");
assert(categoryRenders>0,"reset re-renders categories");

// Category and availability must compose, and published content remains separate.
state.category="academic";
state.availability="ready";
catalog.renderCatalog();
const expected=core.select(state,[]);
assert.equal($("manualGrid").children.length,expected.length);
assert(expected.every(b=>b.status==="published"&&b.category==="academic"));
assert.equal($("resultsText").textContent.includes("จาก "+data.manuals.length+" รายการ"),true);
state.availability="all";state.category="all";state.sort="title";
catalog.renderCatalog();
assert.equal($("manualGrid").children.length,data.manuals.length);
assert.equal($("manualGrid").children[0].id,core.select(state,[])[0].id);

// My Books must resolve only published IDs, and bookmarks must retain source page indices.
const selectors=window.WD_MYBOOKS_SELECTORS.createMyBooksSelectors(data.manuals);
// Materialize the expected IDs as a host-realm array, not a VM-realm array.
// Keep deepStrictEqual exact: book order and IDs must still match.
const ids=Array.from(data.manuals.filter(b=>b.status==="published").slice(0,2),b=>b.id);
const unpublished=data.manuals.find(b=>b.status!=="published").id;
assert.equal(selectors.resume([unpublished,ids[0]]),null,"recent must reject unpublished book");
assert.equal(selectors.resume([ids[0],unpublished]).id,ids[0],"recent published book resumes");
assert.deepEqual(Array.from(selectors.favorites([ids[0],unpublished,ids[1]]).map(b=>b.id)),ids);
assert.deepEqual(Array.from(selectors.recent([ids[1],ids[0]],2).map(b=>b.id)),[ids[1],ids[0]]);
const groups=selectors.bookmarks(id=>id===ids[0]?[0,2,999,-1]:[],[ids[0]]);
assert.equal(groups.length,1);
assert.deepEqual(Array.from(groups[0].indices),[0,2]);

const essay=data.manuals.find(b=>b.id==="homework-in-ai-age-primary-leadership");
assert(essay&&essay.status==="published"&&essay.pages.length>=20);
const app=read("assets/app.js");
assert(app.includes("const renderCatalog = catalogUI.renderCatalog;"),"real App binds catalog UI");
assert(app.includes("function openBook(book, opener"),"real App retains Reader action");
assert(app.includes("const readerCoordinator = window.WD_READER_COORDINATOR"),"real App binds reader coordinator");
console.log("Library PASS: " + data.manuals.length + "/" + publishedCount + " public catalog, Thai discovery/reset, filters, My Books, essay and Reader bridge.");
