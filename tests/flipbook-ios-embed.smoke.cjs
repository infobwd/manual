// FLIP-07 iframe layout recovery and Sarabun typography gate
// Run: node tests/flipbook-ios-embed.smoke.cjs
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const read = name => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const app = read("experiments/flipbook-pilot/corner.js");
const css = read("experiments/flipbook-pilot/corner.css");
const html = read("experiments/flipbook-pilot/corner.html");
const host = read("assets/app.js");
const main = read("index.html");
new vm.Script(app);
new vm.Script(host);
assert(html.includes("family=Sarabun") && html.includes("fonts.googleapis.com"), "looped Sarabun available");
assert(css.includes('font-family:"Sarabun"') && css.includes('"TH Sarabun New"'),
  "headed Sarabun with Thai fallback");
assert(css.includes(".measure .paper{height:100%"), "measured page size follows actual frame");
assert(css.includes("body.flip-embedded") && css.includes("--page-h:clamp("),
  "iframe mobile view gets explicit page height");
assert(app.includes("if (w < 120 || h < 300)") &&
       app.includes("area.clientHeight < 100") &&
       app.includes("area.clientWidth < 90"), "reflow is guarded against zero-size iframe");
assert(app.includes("window.requestAnimationFrame(() => window.requestAnimationFrame(repaginate))"),
  "deferred startup follows two paints");
assert(app.includes('window.ResizeObserver'), "observe iOS embedded frame changes");
assert(app.includes("document.fonts.ready"), "font-loaded reflow");
assert(main.includes('id="wdFlipbookFrame"') && main.includes('loading="eager"'),
  "dialog iframe loads eagerly once shown");
assert(host.indexOf("flipDialog.showModal();") < host.indexOf('flipFrame.src = "./experiments/flipbook-pilot/corner.html?'),
  "dialog is shown before iframe navigation");
assert(app.includes("state.layoutRetries++ < 20"), "retry is finite");
assert(!app.includes("localStorage.setItem(") &&
       !app.includes("navigator.serviceWorker"), "no new data writes or SW");

const start = app.indexOf("  function repaginate() {");
const end = app.indexOf("  function init() {", start);
assert(start >= 0 && end > start, "retry function can be isolated");
const code = app.slice(start,end);
const factory = new Function("state", "window", "paginate", "el", "document",
  "bookNode", "fail", "console", code + "\nreturn repaginate;");
function runScenario(failures) {
  const queue = [], errors = [], failed = [];
  const state = {rebuilding:false, retryTimer:0, layoutRetries:0};
  const node = { hidden:false };
  const surface = {dataset:{error:"true"}};
  let calls=0;
  const window = {
    clearTimeout() {},
    setTimeout(callback,ms) { assert.equal(ms,130);queue.push(callback);return queue.length; },
    innerWidth:390, innerHeight:670
  };
  const paginate=() => {calls++;if(calls<=failures)throw new Error("FLIP_LAYOUT_PENDING");};
  const runner = factory(state,window,paginate,()=>node,
    {querySelector:()=>surface},{getBoundingClientRect:()=>({toJSON:()=>({width:0,height:0})})},
    msg=>failed.push(msg),{error:(...a)=>errors.push(a)});
  runner();
  let limit=0;
  while(queue.length && limit++<40)queue.shift()();
  return {calls,queue,errors,failed,state,node,surface};
}
const eventual = runScenario(3);
assert.equal(eventual.calls,4, "three 0-size layouts retry then paint");
assert.equal(eventual.failed.length,0);
assert.equal(eventual.state.layoutRetries,0);
assert.equal(eventual.node.hidden,true, "transient banner clears");
assert.equal(eventual.surface.dataset.error,undefined, "error class clears");
const never = runScenario(99);
assert.equal(never.calls,21,"retry limit prevents an infinite loop");
assert.equal(never.failed.length,1,"clear fallback when frame never measures");
assert.match(never.failed[0],/ลองเปิดใหม่/);
console.log("FLIP-07 smoke PASS: Sarabun, deferred iframe, zero-size layout retries/recovery, finite fallback and PWA isolation.");
