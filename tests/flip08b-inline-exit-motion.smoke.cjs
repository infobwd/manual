// FLIP-08B — inline thumb exit + accessible/visible motion status.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const js=read("experiments/flipbook-pilot/corner.js");
const html=read("experiments/flipbook-pilot/corner.html");
const css=read("experiments/flipbook-pilot/corner.css");
const parentCss=read("assets/reader-flip-choice.css");
const app=read("assets/app.js"),index=read("index.html"),sw=read("sw.js");
const version=read("assets/app-version.js").match(/WD_BOOKS_VERSION = "([^"]+)"/)?.[1];
assert(version&&index.includes("เวอร์ชัน "+version)&&sw.includes("Update "+version),"PWA release synchronized");
new vm.Script(js,{filename:"corner.js"});
assert(html.includes('id="returnToReader"')&&html.includes('aria-label="ปิดโหมดพลิกกระดาษและกลับไปอ่านแบบเดิม"'),
  "a labeled inline return is in the flipbook footer");
assert(html.indexOf('id="next"') < html.indexOf('id="returnToReader"') &&
  html.indexOf('id="returnToReader"') < html.indexOf('class="help"'),
  "return follows Next, with no extra footer");
assert(css.includes("body.flip-embedded .navigator{")&&
  css.includes("grid-template-columns:minmax(72px,1.05fr)")&&
  css.includes("body.flip-embedded .return-reader{"),
  "mobile navigation has four accessible columns");
assert(parentCss.includes(".wd-flip-shell::after{content:none}")&&
  parentCss.includes(".wd-flip-close-label{display:none}")&&
  parentCss.includes(".wd-flip-header #wdFlipbookClose{"),
  "no duplicate bottom row; parent X remains fallback for iframe failures");
assert(css.includes('body[data-flip-theme="night"].flip-embedded #motionButton[aria-pressed="true"]')&&
  css.includes('body[data-flip-theme="night"].flip-embedded #motionButton[aria-pressed="false"]')&&
  css.includes('body.flip-embedded #motionButton[aria-pressed="true"]::after{content:"ลดแล้ว"')&&
  css.includes('body.flip-embedded #motionButton[aria-pressed="false"]::after{content:"โมชั่น"'),
  "motion on/off are visibly distinct and high contrast in night mode");
assert(html.includes("corner.css?v="+version)&&html.includes("corner.js?v="+version) &&
  app.includes('v: String(window.WD_BOOKS_VERSION || "'+version+'")'),
  "iframe CSS/JS and query version are current");
assert(app.includes('data.type === "wd:flip08b:exit"')&&
  app.includes('event.source !== flipFrame.contentWindow') &&
  app.includes('event.origin !== window.location.origin') &&
  app.includes('data.bookId !== flipSession.bookId'),
  "exit respects the existing strict origin/source/book gate");
assert(!js.includes("localStorage.setItem("),"no new storage");
const start=js.indexOf("  function requestReturnToReader() {");
const middle=js.indexOf("  function syncMotionButton() {",start);
const end=js.indexOf("  function init() {",middle);
assert(start>0&&middle>start&&end>middle,"purely testable functions for return/motion");
const messages=[];
const book={id:"ai-five-questions-speaker-cheatsheet-25691026",pages:Array.from({length:12},()=>({}))};
const state={pages:[{dataset:{chapter:"0"}},{dataset:{chapter:"4"}}],motionOff:false};
let embedded=true;
const doc={body:{classList:{contains:() => embedded}}};
const win={parent:{postMessage:(data,origin)=>messages.push({data,origin})},location:{origin:"https://infobwd.github.io"}};
const returnFn=new Function("book","document","window","state","visibleSourceIndex",
  js.slice(start,middle)+"return requestReturnToReader;")(book,doc,win,state,()=>1);
returnFn();
assert.deepEqual(messages,[{data:{type:"wd:flip08b:exit",bookId:book.id,chapter:4},origin:win.location.origin}],
  "return posts current chapter with explicit origin");
embedded=false;returnFn();assert.equal(messages.length,1,"standalone pilot cannot close parent");
embedded=true;state.pages[1].dataset.chapter="100";returnFn();
assert.equal(messages.at(-1).data.chapter,null,"invalid chapter cannot drive position");
const attrs={}, motionButton={title:"",setAttribute(name,value){attrs[name]=value;}};
const syncFn=new Function("motionButton","state",js.slice(middle,end)+"return syncMotionButton;")(motionButton,state);
syncFn();
assert.equal(attrs["aria-pressed"],"false");
assert.match(attrs["aria-label"],/ลดการเคลื่อนไหว/);
state.motionOff=true;syncFn();
assert.equal(attrs["aria-pressed"],"true");
assert.match(attrs["aria-label"],/ลดการเคลื่อนไหวแล้ว/);
assert.equal(motionButton.title,attrs["aria-label"]);
assert(js.includes('el("returnToReader").addEventListener("click", requestReturnToReader)'),
  "visible bottom button has a real click handler");
assert(js.includes("syncMotionButton();"),"runtime synchronizes motion states");
console.log("FLIP-08B PASS: inline return with chapter, strict parent gate, night motion states, fallback X, PWA version.");
