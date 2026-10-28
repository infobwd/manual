// FLIP-08A: thumb-zone return, true flipbook dark theme, distinct motion button.
// Run: node tests/flip08a-thumb-theme.smoke.cjs
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const js=read("experiments/flipbook-pilot/corner.js");
const html=read("experiments/flipbook-pilot/corner.html");
const css=read("experiments/flipbook-pilot/corner.css");
const parentCss=read("assets/reader-flip-choice.css");
const app=read("assets/app.js");
const index=read("index.html");
const sw=read("sw.js");
const version=read("assets/app-version.js").match(/WD_BOOKS_VERSION = "([^"]+)"/)?.[1];
new vm.Script(js,{filename:"corner.js"});
assert(version,"single release version exists");
assert(index.includes("เวอร์ชัน "+version)&&sw.includes("Update "+version));
assert(app.includes('theme: document.body?.dataset?.theme || "light"'),
  "reader theme flows into iframe via query parameter");
assert(app.includes('data.type === "wd:flip08a:theme"')&&
  app.includes('event.origin !== window.location.origin')&&
  app.includes('event.source !== flipFrame.contentWindow')&&
  app.includes('data.bookId !== flipSession.bookId'),
  "incoming change limited to same origin, active iframe and selected book");
assert(app.includes("window.WD_EXPERIENCE?.setTheme?.(data.theme)"),
  "only existing Reader owns theme persistence");
assert(!js.includes("localStorage.setItem(")&&!js.includes("sessionStorage.setItem("),
  "iframe does not create its own preference storage");
assert(html.includes('id="themeButton"')&&
  html.includes('aria-label="เปิดโหมดมืด"')&&
  html.includes('id="motionButton"')&&
  html.includes('aria-label="เปิดหรือปิดแอนิเมชันพลิกหน้า"'),
  "night mode and motion are independent accessible buttons");
assert(css.includes('body.flip-embedded #motionButton::after{content:"โมชั่น"'),
  "motion must have visible text, not ambiguous half-moon");
assert(css.includes('body[data-flip-theme="night"] .paper:not(.cover)')&&
  css.includes('body[data-flip-theme="night"] .page-content')&&
  css.includes('body[data-flip-theme="night"] .nav-button.primary'),
  "night mode styles paper, content and navigation");
assert(parentCss.includes("padding-bottom:calc(62px + env(safe-area-inset-bottom,0px))")&&
  parentCss.includes(".wd-flip-shell::after")&&
  parentCss.includes(".wd-flip-header #wdFlipbookClose{")&&
  parentCss.includes("bottom:calc(8px + env(safe-area-inset-bottom,0px))")&&
  parentCss.includes("(min-height:501px)"),
  "iPhone close has dedicated thumb area below inner navigator; landscape retains fallback");
assert(html.includes("corner.css?v="+version)&&html.includes("corner.js?v="+version),
  "updated iframe assets bypass stale PWA browser cache");

const start=js.indexOf("  function applyTheme(theme, notifyParent = false) {");
const end=js.indexOf("  function init() {",start);
assert(start>=0&&end>start,"pure theme sync function can be exercised");
const attrs={},messages=[],body={dataset:{},classList:{contains:name=>name==="flip-embedded"}};
const icon={textContent:""},themeButton={
  setAttribute(k,v){attrs[k]=v;},
  querySelector(selector){assert.equal(selector,"span");return icon;},
  title:""
};
const doc={body};
const parent={postMessage:(msg,target)=>messages.push({msg,target})};
const win={parent,location:{origin:"https://infobwd.github.io"}};
const book={id:"ai-five-questions-speaker-cheatsheet-25691026"};
const applyTheme=new Function("document","window","book","themeButton",
  js.slice(start,end)+"return applyTheme;")(doc,win,book,themeButton);
applyTheme("sepia",false);
assert.equal(body.dataset.flipTheme,"sepia");
assert.equal(messages.length,0,"initial state cannot emit parent mutation");
applyTheme("night",true);
assert.equal(body.dataset.flipTheme,"night");
assert.equal(icon.textContent,"☀");
assert.equal(attrs["aria-pressed"],"true");
assert.equal(attrs["aria-label"],"เปลี่ยนเป็นโหมดสว่าง");
assert.deepEqual(messages[0],{msg:{type:"wd:flip08a:theme",bookId:book.id,theme:"night"},target:win.location.origin});
applyTheme("light",true);
assert.equal(body.dataset.flipTheme,"light");
assert.equal(icon.textContent,"☾");
assert.equal(attrs["aria-pressed"],"false");
assert.equal(messages.length,2);
applyTheme("<script>",true);
assert.equal(messages.length,2,"invalid theme fails closed");
body.classList.contains=()=>false;
applyTheme("night",true);
assert.equal(messages.length,2,"standalone preview never changes parent Reader");
console.log("FLIP-08A PASS: thumb-right exit, separate dark/motion controls, theme behavior and safe bridge.");
