// Run: node tests/pwa-update-lifecycle.smoke.cjs
// Synthetic Service Worker lifecycle; NOT a substitute for Safari/Android device QA.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const source=fs.readFileSync(path.join(root,"assets/experience.js"),"utf8");
const begin=source.indexOf("  function registerWorker() {");
const end=source.indexOf("  window.WD_EXPERIENCE = {",begin);
assert.ok(begin>0 && end>begin,"PWA registration function must exist");
const fragment=source.slice(begin,end);
function emitter() {
  return {
    listeners:{},addEventListener(type,fn){(this.listeners[type] ||= []).push(fn);},
    fire(type){for(const fn of(this.listeners[type]||[]))fn({type});}
  };
}
function harness({controlled=true,online=true}={}) {
  const nodes={};
  const node=(name)=>nodes[name] ||= {...emitter(),hidden:true,disabled:false,textContent:"",open:false,focus(){this.focused=true;},close(){this.open=false;}};
  let now=1000000, reloads=0, updates=0, registeredOpts, registerOrder=[];
  const worker={...emitter(),state:"installing",posts:[],postMessage(m){this.posts.push(m);}};
  const registration={
    ...emitter(),waiting:null,installing:null,
    async update(){registerOrder.push("update");updates++;}
  };
  const serviceWorker={
    ...emitter(),controller:controlled?{}:null,
    async register(url,options) {
      registerOrder.push("register");
      registeredOpts=options;
      assert.equal(url,"./sw.js");
      return registration;
    }
  };
  const navigator={serviceWorker,onLine:online};
  const location={protocol:"https:",hostname:"infobwd.github.io"};
  const win={
    ...emitter(),WD_BOOKS_VERSION:"1.3.37",
    location:{reload(){reloads++;}}
  };
  const document={...emitter(),hidden:false};
  const FakeDate={now(){return now;}};
  const $=node;
  const registerWorker=new Function("$","navigator","location","window","document","Date",
    fragment+"return registerWorker;")($,navigator,location,win,document,FakeDate);
  const settle=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
  return {
    nodes,node,worker,registration,serviceWorker,document,win,navigator,
    get registeredOpts(){return registeredOpts;},
    get order(){return [...registerOrder];},
    get updates(){return updates;},
    get reloads(){return reloads;},
    setNow(v){now=v;},settle,launch(){registerWorker();}
  };
}
async function main() {
  const a=harness();
  a.launch();await a.settle();
  assert.equal(a.registeredOpts.updateViaCache,"none");
  assert.equal(a.registeredOpts.scope,"./");
  assert.deepEqual(a.order.slice(0,2),["register","update"]);
  assert.ok(a.registration.listeners.updatefound?.length,
    "Install watcher must be attached before update call");
  assert.equal(a.updates,1,"Initial online launch checks for updates");
  assert.equal(a.node("appUpdateNotice").hidden,true,"No false update prompt");
  // Background/foreground events are throttled.
  a.win.fire("focus");await a.settle();assert.equal(a.updates,1);
  a.setNow(1061000);
  a.document.fire("visibilitychange");await a.settle();assert.equal(a.updates,2);
  // New worker enters installing and later waiting state.
  a.registration.installing=a.worker;
  a.registration.fire("updatefound");
  a.registration.waiting=a.worker;
  a.worker.state="installed";a.worker.fire("statechange");
  assert.equal(a.node("appUpdateNotice").hidden,false);
  assert.match(a.node("appUpdateStatus").textContent,/พบเวอร์ชันใหม่/);
  a.node("laterAppUpdate").fire("click");
  assert.equal(a.node("appUpdateNotice").hidden,true,"Later hides update without reload");
  assert.equal(a.reloads,0);
  a.node("settingsDialog").open=true;
  a.node("checkAppUpdate").fire("click");await a.settle();
  assert.equal(a.node("appUpdateNotice").hidden,false,"Manual check makes dismissed update accessible");
  assert.equal(a.node("settingsDialog").open,false);
  assert.equal(a.node("applyAppUpdate").focused,true);
  a.node("applyAppUpdate").fire("click");
  assert.deepEqual(a.worker.posts,[{type:"SKIP_WAITING"}]);
  assert.equal(a.reloads,0,"No reload before controller actually changes");
  a.serviceWorker.fire("controllerchange");
  assert.equal(a.reloads,1,"Accepted version triggers one reload");
  a.serviceWorker.fire("controllerchange");assert.equal(a.reloads,1);

  // No reload on initial first-install claim.
  const fresh=harness({controlled:false});
  fresh.launch();await fresh.settle();
  fresh.serviceWorker.controller={};
  fresh.serviceWorker.fire("controllerchange");
  assert.equal(fresh.reloads,0);

  // Manual offline check must not network-fetch an update or remove data.
  const offline=harness({controlled:true,online:false});
  offline.launch();await offline.settle();
  assert.equal(offline.updates,0);
  offline.node("checkAppUpdate").fire("click");await offline.settle();
  assert.equal(offline.updates,0);
  assert.match(offline.node("appUpdateStatus").textContent,/ออฟไลน์/);
  console.log("PASS: PWA update on resume / waiting / later / manual / activate / offline / initial install");
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports=main;
