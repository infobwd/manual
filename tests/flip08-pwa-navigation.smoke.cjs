// FLIP-08 regression: deterministic navigation and iPhone PWA viewport contracts.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"), path=require("node:path"), vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const prefix="experiments/flipbook-pilot/";
const scope={window:{}};
vm.runInNewContext(read(prefix+"corner-model.js"),scope);
const model=scope.window.WD_CORNER_MODEL;
for(const single of [true,false]){
  for(const count of [2,3,12,38,39,40]){
    const order=model.order(count,single), steps=[0];
    for(let current=0; ;){
      const next=model.adjacent(current,1,order.length,single);
      if(next===null)break;
      assert(next>current && steps.length<=order.length,"next must advance and terminate");
      steps.push(next);current=next;
    }
    assert.equal(steps.at(-1),single?order.length-1:order.length-1,
      "last navigation reaches back cover");
    for(let i=steps.length-1;i>0;i--){
      assert.equal(model.adjacent(steps[i],-1,order.length,single),steps[i-1],
        "previous must invert next, including cover");
    }
    assert.equal(model.adjacent(0,-1,order.length,single),null);
    assert.equal(model.adjacent(steps.at(-1),1,order.length,single),null);
  }
}
const js=read(prefix+"corner.js");
new vm.Script(js,{filename:"corner.js"});
const start=js.indexOf("  function move(direction) {");
const end=js.indexOf("  function repaginate() {",start);
assert(start>0 && end>start,"isolated navigation function exists");
const block=js.slice(start,end);
assert(block.includes("engine.turnToPage(target)") && !block.includes("engine.flipPrev("),
  "buttons must not use the intermittently dropped animated flipPrev event");
function harness(single,index,count=40){
  const jumps=[];let statuses=0;
  const engine={
    current:index,getCurrentPageIndex(){return this.current;},
    getPageCount(){return count;},
    turnToPage(page){jumps.push(page);this.current=page;}
  };
  const state={engine,rebuilding:false,renderSingle:single,hasInteracted:false};
  const stage={classList:{add(name){assert.equal(name,"has-interacted");}}};
  const move=new Function("state","stage","cornerModel","renderStatus",
    block+"return move;")(state,stage,model,()=>{statuses++});
  return {move,engine,state,jumps,get statuses(){return statuses}};
}
const mobile=harness(true,3,40);
mobile.move(-1);assert.equal(mobile.engine.current,2,"iPhone page 3 → 2");
mobile.move(-1);assert.equal(mobile.engine.current,1,"iPhone page 2 → 1");
mobile.move(-1);assert.equal(mobile.engine.current,0,"iPhone page 1 → cover");
mobile.move(-1);assert.deepEqual(mobile.jumps,[2,1,0],"cover cannot flip backwards");
mobile.move(1);assert.equal(mobile.engine.current,1,"cover → page 1");
assert.equal(mobile.statuses,4,"navigation controls update synchronously");
const desktop=harness(false,5,14);
desktop.move(-1);assert.equal(desktop.engine.current,3,"desktop spread 5 → 3");
desktop.move(-1);assert.equal(desktop.engine.current,1,"desktop spread 3 → 1");
desktop.move(-1);assert.equal(desktop.engine.current,0,"desktop spread 1 → cover");
desktop.move(1);assert.equal(desktop.engine.current,1,"desktop cover → first spread");
desktop.state.rebuilding=true;desktop.move(1);assert.equal(desktop.engine.current,1,"rebuild blocks navigation");
const css=read(prefix+"corner.css");
const parent=read("assets/reader-flip-choice.css");
const html=read(prefix+"corner.html");
const appVersion=read("assets/app-version.js");
const shell=read("index.html"),sw=read("sw.js");
assert(css.includes("body.flip-embedded .reading-surface{") &&
  css.includes("body.flip-embedded .book-stage{") &&
  css.includes("flex:1 1 auto;min-height:0;overflow:hidden"),
  "PWA embedded reading stage owns remaining viewport height");
assert(css.includes("body.flip-embedded .navigator{") &&
  css.includes("env(safe-area-inset-bottom,0px)") &&
  css.includes("body.flip-embedded .help{display:none}"),
  "navigation stays visible above home indicator");
assert(css.includes("body.flip-embedded .book-information{display:none}") &&
  css.includes("body.flip-embedded .settings{"),
  "duplicate title removed from phone toolbar; reader settings remain");
assert(parent.includes(".wd-flip-eyebrow,.wd-flip-header p{display:none}") &&
  parent.includes("#wdFlipbookClose"),"mobile parent header condensed with Close intact");
assert(html.includes('id="motionButton"')&&html.includes('aria-label="เปิดหรือปิดแอนิเมชันพลิกหน้า"'),
  "icon control retains accessible label");
assert.equal((appVersion.match(/1\.3\.60/g)||[]).length,1);
assert(shell.includes("เวอร์ชัน 1.3.60")&&sw.includes("Update 1.3.60"),
  "versioned PWA update is consistent");
console.log("FLIP-08 PASS: 12 page-walk scenarios, live button behavior, viewport CSS and PWA version.");
