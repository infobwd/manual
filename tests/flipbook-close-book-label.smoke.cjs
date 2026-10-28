// FLIP-13 — book close and title-formatting safeguards.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const app=read("assets/app.js"),child=read("experiments/flipbook-pilot/corner.js");
const html=read("index.html"),childHtml=read("experiments/flipbook-pilot/corner.html");
const css=read("assets/reader-flip-choice.css");
const v=read("assets/app-version.js"),sw=read("sw.js");
const catalog=read("assets/manuals-data.js"),cap=read("assets/flipbook-capability.js");
new vm.Script(app);new vm.Script(child);
const begin=app.indexOf("  const bookLabel =");
const end=app.indexOf("  const state = {",begin);
assert(begin>=0&&end>begin,"isolated display formatter exists");
const format=new Function(app.slice(begin,end)+"\nreturn bookLabel;")();
assert.equal(format("คู่มือ\\nงานบริหาร"),"คู่มือ งานบริหาร");
assert.equal(format("คู่มือ/nงานบริหาร"),"คู่มือ งานบริหาร");
assert.equal(format("คู่มือ\nงานบริหาร"),"คู่มือ งานบริหาร");
assert.equal(format("คู่มือ\\nงานบริหาร",true),"คู่มือ\nงานบริหาร");
assert.equal(format("คู่มือ/nงานบริหาร",true),"คู่มือ\nงานบริหาร");
assert.equal(format("RT/NT 2569"),"RT/NT 2569","valid slash title unchanged");
assert(app.includes('bookLabel(book.coverTitle || book.title, true)') &&
  app.includes('bookLabel(book.title)'),"catalog covers and book titles normalized on display");
assert(child.includes("inlineBookTitle(book.title)"),
  "Flipbook standalone and embedded title normalized on display");
assert(html.includes('id="wdFlipbookDismiss"')&&
  html.includes('id="wdFlipbookClose"')&&
  html.includes('id="wdFlipbookReturnBottom"'),
  "desktop close and classic choices + mobile close present");
assert(childHtml.includes('id="flipClassicMode"'),"mobile classic option is explicit");
assert(childHtml.includes('aria-label="ปิดหนังสือและกลับชั้นหนังสือ"'),
  "bottom X means close book, not classic mode");
assert(app.includes('let flipExitIntent = "close"')&&
  app.includes('if (intent === "close")')&&
  app.includes('dialog.close();'),"default exit fully closes the Reader");
assert(app.includes('flipExitIntent = "classic"')&&
  app.includes('WD_BOOKS_FLIP_CLASSIC ='),"explicit old Reader switch available");
assert(app.includes('if (data.type === "wd:flip11:unavailable")')&&
  app.includes("flipAudioRequested"),
  "reader-error fallback and real narration preserved");
assert(css.includes(".wd-flip-desktop-actions")&&
  css.includes("#wdFlipbookDismiss"),"desktop close button visible");
const context={window:{}};vm.runInNewContext(catalog,context);vm.runInNewContext(cap,context);
const manuals=context.window.WD_LIBRARY_DATA.manuals;
const published=manuals.filter(b=>b.status==="published");
assert.equal(published.length,15);
assert.equal(published.filter(context.window.WD_FLIP_CAPABILITY.supports).length,15);
assert.equal(published.filter(b=>!context.window.WD_FLIP_CAPABILITY.supports(b)).length,0,
 "both SAR charts and insights qualify after renderer parity");
assert(/WD_BOOKS_VERSION = "1\.3\.68"/.test(v)&&html.includes("เวอร์ชัน 1.3.68")&&
  sw.includes("Update 1.3.68:"),"PWA release version synchronized");
console.log("FLIP-13 PASS: close vs classic separated; safe 15/15 gate; escaped /n and \\n normalized on display; release 1.3.68.");
