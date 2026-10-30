// UI-MIG-02R3 local-only browser visual QA. Requires Node 24 and Chrome/Edge.
// CDP Emulation.setDeviceMetricsOverride sets the CSS viewport, unlike --window-size.
// Reported PASS means simulated browser QA only; never iPhone/iPad acceptance.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { spawn, spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
assert(fs.existsSync(path.join(dist, "index.html")),
  "dist/index.html missing: run node scripts/gate2-evidence.cjs --install-build");
assert(typeof WebSocket === "function",
  "Node 24+ global WebSocket required for built-in CDP (no npm browser dependencies)");
const out = path.resolve(process.env.WD_UI_CAPTURE_DIR ||
  path.join(os.tmpdir(), "wd-books-ui-mig02r3-captures"));
fs.mkdirSync(out, { recursive: true });
const browsers = [
  process.env.CHROME_BIN,
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES,"Google","Chrome","Application","chrome.exe"),
  process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"],"Microsoft","Edge","Application","msedge.exe"),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA,"Google","Chrome","Application","chrome.exe"),
  "chrome", "msedge", "chromium", "chromium-browser", "google-chrome"
].filter(Boolean);
const browser = browsers.find(file => {
  if ((file.includes("/") || file.includes("\\") ) && !fs.existsSync(file)) return false;
  const test = spawnSync(file, ["--version"], { encoding:"utf8", timeout:5000, windowsHide:true });
  return test.status === 0 && !test.error;
});
assert(browser, "Chrome/Edge not found; set CHROME_BIN to full chrome.exe or msedge.exe path");

const mime = {
  ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8", ".png":"image/png", ".svg":"image/svg+xml",
  ".ico":"image/x-icon", ".woff2":"font/woff2", ".json":"application/json; charset=utf-8"
};
const server = http.createServer((req,res) => {
  if (req.method !== "GET") { res.writeHead(405).end(); return; }
  let url, parts;
  try {
    url = new URL(req.url,"http://localhost");
    parts = decodeURIComponent(url.pathname).split("/").filter(Boolean);
  } catch { res.writeHead(400).end(); return; }
  if (parts.some(part => part === "." || part === ".." || part.startsWith("."))) {
    res.writeHead(404).end(); return;
  }
  const filename = path.resolve(dist,...(parts.length ? parts : ["index.html"]));
  if (!filename.startsWith(dist + path.sep) || !mime[path.extname(filename).toLowerCase()]) {
    res.writeHead(404).end(); return;
  }
  fs.stat(filename, (err,stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, {
      "Content-Type":mime[path.extname(filename).toLowerCase()],
      "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff",
      "Content-Length":stat.size
    });
    fs.createReadStream(filename).on("error",() => res.destroy()).pipe(res);
  });
});
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
function getJson(url) {
  return new Promise((resolve,reject) => {
    http.get(url,res => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data",chunk => { if (body.length < 200000) body += chunk; });
      res.on("end",() => {
        try { assert.equal(res.statusCode,200); resolve(JSON.parse(body)); }
        catch (error) { reject(error); }
      });
    }).on("error",reject);
  });
}
function connectCdp(wsUrl) {
  return new Promise((resolve,reject) => {
    const socket = new WebSocket(wsUrl);
    const pending = new Map();
    let nextId = 0;
    socket.addEventListener("message",event => {
      let msg;
      try { msg = JSON.parse(String(event.data)); } catch { return; }
      const request = pending.get(msg.id);
      if (!request) return;
      pending.delete(msg.id); clearTimeout(request.timer);
      if (msg.error) request.reject(new Error(request.method+": "+JSON.stringify(msg.error)));
      else request.resolve(msg.result || {});
    });
    socket.addEventListener("open",() => resolve({
      call(method,params = {},timeout = 12000) {
        return new Promise((resolveCall,rejectCall) => {
          const id = ++nextId;
          const timer = setTimeout(() => {
            pending.delete(id); rejectCall(new Error("CDP timeout: "+method));
          },timeout);
          pending.set(id,{method,resolve:resolveCall,reject:rejectCall,timer});
          socket.send(JSON.stringify({id,method,params}));
        });
      },
      close() { socket.close(); }
    }));
    socket.addEventListener("error",reject);
    socket.addEventListener("close",() => {
      for(const request of pending.values()) {
        clearTimeout(request.timer);
        request.reject(new Error("CDP socket closed: "+request.method));
      }
      pending.clear();
    });
  });
}
// All widths are CSS pixels. Real desktop browser zoom is a separate manual gate.
const matrix = [
  {name:"phone-home-320x720",width:320,height:720,view:"home",theme:"light"},
  {name:"phone-books-320x720",width:320,height:720,view:"books",theme:"light"},
  {name:"phone-books-360x800",width:360,height:800,view:"books",theme:"light"},
  {name:"phone-home-390x844",width:390,height:844,view:"home",theme:"light"},
  {name:"phone-books-390x844",width:390,height:844,view:"books",theme:"light"},
  {name:"phone-settings-390x844",width:390,height:844,view:"settings",theme:"light"},
  {name:"phone-books-430x932",width:430,height:932,view:"books",theme:"light"},
  {name:"tablet-books-768x1024",width:768,height:1024,view:"books",theme:"light"},
  {name:"tablet-books-1024x768",width:1024,height:768,view:"books",theme:"light"},
  {name:"desktop-books-1366x768",width:1366,height:768,view:"books",theme:"light"},
  {name:"desktop-books-night-1366x768",width:1366,height:768,view:"books",theme:"night"},
  {name:"desktop-category-1920x1080",width:1920,height:1080,view:"books",
    theme:"light",category:"งานบริหาร"},
  {name:"desktop-settings-sepia-1366x768",width:1366,height:768,view:"settings",theme:"sepia"}
];
const metricsExpression = "JSON.stringify((function(){" +
  "const r=s=>{const e=document.querySelector(s);if(!e)return null;" +
  "const b=e.getBoundingClientRect();return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,width:b.width,height:b.height};};" +
  "const nav=[...document.querySelectorAll('.bottom-nav button')].map(e=>{" +
  "const b=e.getBoundingClientRect();return {label:e.innerText.trim(),left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};});" +
  "const over=[...document.querySelectorAll('body *')].filter(e=>{" +
  "const s=getComputedStyle(e),b=e.getBoundingClientRect();" +
  "return s.display!=='none'&&s.visibility!=='hidden'&&b.width>1&&" +
  "(b.left < -1||b.right>document.documentElement.clientWidth+1);}).slice(0,12)" +
  ".map(e=>({tag:e.tagName,cls:String(e.className).slice(0,90),text:(e.innerText||'').slice(0,45)}));" +
  "return {location:location.search,innerWidth:innerWidth,clientWidth:document.documentElement.clientWidth," +
  "scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth," +
  "visualViewportWidth:visualViewport?.width??null,devicePixelRatio:devicePixelRatio," +
  "rects:{root:r('#root'),shell:r('.shell'),header:r('header'),brand:r('.brand')," +
  "main:r('main'),layout:r('.catalog-layout'),sidebar:r('.catalog-sidebar')," +
  "bookshelf:r('#bookshelfTitle'),search:r('.catalog-search'),grid:r('.book-grid')," +
  "firstCard:r('.book-grid > *'),bottomNav:r('.bottom-nav')}," +
  "nav:nav,visibleCards:document.querySelectorAll('.book-grid > *').length," +
  "debugLabelVisible:!!document.querySelector('.preview-label')&&" +
  "getComputedStyle(document.querySelector('.preview-label')).display!=='none'," +
  "theme:document.querySelector('[data-theme]')?.getAttribute('data-theme')," +
  "offenders:over};})())";
async function evaluate(cdp,expression) {
  const response = await cdp.call("Runtime.evaluate",{
    expression,returnByValue:true,awaitPromise:true
  });
  if (response.exceptionDetails) throw new Error("JS evaluation error: "+JSON.stringify(response.exceptionDetails));
  return response.result?.value;
}
async function until(cdp,condition,description) {
  for(let i=0;i<100;i++) {
    try { if(await evaluate(cdp,condition)) return; } catch {}
    await delay(100);
  }
  throw new Error("Page did not reach state: "+description);
}
async function navigate(cdp,base,scene) {
  await cdp.call("Emulation.setDeviceMetricsOverride",{
    width:scene.width,height:scene.height,deviceScaleFactor:1,
    mobile:scene.width<768,screenWidth:scene.width,screenHeight:scene.height
  });
  const target = new URL(base);
  target.searchParams.set("view",scene.view);
  target.searchParams.set("theme",scene.theme);
  if(scene.category) target.searchParams.set("category",scene.category);
  await cdp.call("Page.navigate",{url:target.href});
  const heading=scene.view==="books" ? "bookshelfTitle" : null;
  const checks="location.search==="+JSON.stringify(target.search)+
    "&&!!document.querySelector('#root .shell')"+
    (heading ? "&&!!document.getElementById("+JSON.stringify(heading)+")" :
      scene.view==="settings" ? "&&document.querySelector('h1')?.textContent==='ตั้งค่าการอ่าน'" :
      "&&document.querySelector('h1')?.textContent==='หนังสือดี ๆ อ่านต่อได้ทุกวัน'");
  await until(cdp,checks,"React "+scene.view+" "+scene.name);
  await evaluate(cdp,"document.fonts.ready.then(()=>true)");
  await delay(80);
}
const { checkScene } = require("./responsive-checks.cjs");
async function interactions(cdp,base) {
  const evidence={status:"FAIL",checks:[]};
  const record=(name,ok)=>{evidence.checks.push({name,status:ok?"PASS":"FAIL"});};
  await navigate(cdp,base,{name:"interaction-home",width:390,height:844,view:"home",theme:"light"});
  // Genuine CDP Tab keyboard event: first focusable control is the Home search.
  await cdp.call("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  await cdp.call("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
  record("keyboard_tab_home_search",await evaluate(cdp,
    "document.activeElement?.id==='reactHomeSearch'"));
  record("keyboard_focus_visible",await evaluate(cdp,
    "getComputedStyle(document.activeElement).outlineStyle!=='none'"));
  await cdp.call("Input.insertText",{text:"ครู"});
  await cdp.call("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await cdp.call("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
  await until(cdp,"!!document.getElementById('bookshelfTitle')","Thai Home search submit");
  record("thai_search",await evaluate(cdp,
    "document.querySelectorAll('.book-grid > *').length===1"));
  // Clear search through native value setter + input event (React controlled input).
  await evaluate(cdp,"(function(){const e=document.getElementById('reactBookSearch');" +
    "Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'');" +
    "e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()");
  await until(cdp,"document.querySelectorAll('.book-grid > *').length===4","clear query");
  await evaluate(cdp,"[...document.querySelectorAll('.catalog-tools button')].find(b=>b.textContent.trim()==='รายการโปรด').click()");
  await until(cdp,"document.querySelectorAll('.book-grid > *').length===2","favorites selected");
  record("favorite_filter",await evaluate(cdp,
    "document.querySelectorAll('.book-grid > *').length===2"));
  await evaluate(cdp,"[...document.querySelectorAll('.catalog-category')].find(b=>b.textContent.trim()==='งานบริหาร').click()");
  await until(cdp,"document.querySelector('.catalog-empty')!==null","favorite/category empty state");
  record("category_and_favorite_intersection",await evaluate(cdp,
    "document.querySelectorAll('.book-grid > *').length===0"));
  await evaluate(cdp,"[...document.querySelectorAll('.bottom-nav button')].find(b=>b.textContent.trim()==='ตั้งค่า').click()");
  await until(cdp,"document.querySelector('h1')?.textContent==='ตั้งค่าการอ่าน'","settings navigation");
  await evaluate(cdp,"[...document.querySelectorAll('main button')].find(b=>b.textContent.trim()==='กลางคืน').click()");
  await until(cdp,"document.querySelector('[data-theme]')?.getAttribute('data-theme')==='night'","night theme");
  record("theme_switching",await evaluate(cdp,
    "document.querySelector('[data-theme]')?.getAttribute('data-theme')==='night'"));
  evidence.status=evidence.checks.every(x=>x.status==="PASS")?"PASS":"FAIL";
  return evidence;
}
async function main() {
  const report={
    gate:"UI-MIG-02R3_BROWSER_CDP_SIMULATION",date:new Date().toISOString(),
    browser,chrome_viewports_not_real_mobile_devices:true,
    actual_browser_zoom:"NOT_TESTED",real_iphone_ipad:"NOT_TESTED",
    no_production_integration:true,cases:[],interaction:{status:"NOT_TESTED"}
  };
  let child,cdp,profile;
  try {
    await new Promise((resolve,reject) => server.listen(0,"127.0.0.1",
      error=>error?reject(error):resolve()));
    const port=server.address().port;
    const url="http://127.0.0.1:"+port+"/";
    profile=fs.mkdtempSync(path.join(os.tmpdir(),"wd-ui-r3-chrome-"));
    child=spawn(browser,[
      "--headless=new","--remote-debugging-port=0","--user-data-dir="+profile,
      "--no-first-run","--no-default-browser-check","--disable-extensions",
      "--disable-gpu","--disable-dev-shm-usage","--no-sandbox",
      "--hide-scrollbars","about:blank"
    ],{windowsHide:true,stdio:"ignore"});
    const active=path.join(profile,"DevToolsActivePort");
    let debugPort=null;
    for(let i=0;i<150;i++) {
      if(fs.existsSync(active)) {
        debugPort=Number(fs.readFileSync(active,"utf8").split(/\r?\n/)[0]);
        if(Number.isInteger(debugPort)&&debugPort>0) break;
      }
      if(child.exitCode!==null) throw new Error("Chrome exited before CDP opened");
      await delay(100);
    }
    assert(debugPort,"Chrome did not create DevToolsActivePort");
    const targets=await getJson("http://127.0.0.1:"+debugPort+"/json/list");
    const page=targets.find(t=>t.type==="page"&&t.webSocketDebuggerUrl);
    assert(page,"Chrome CDP page target missing");
    cdp=await connectCdp(page.webSocketDebuggerUrl);
    await cdp.call("Page.enable");
    await cdp.call("Runtime.enable");
    for(const scene of matrix) {
      try {
        await navigate(cdp,url,scene);
        const metrics=JSON.parse(await evaluate(cdp,metricsExpression));
        const problems=checkScene(scene,metrics);
        const screenshot=await cdp.call("Page.captureScreenshot",{
          format:"png",fromSurface:true,captureBeyondViewport:false
        });
        const filename=path.join(out,scene.name+".png");
        const png=Buffer.from(screenshot.data,"base64");
        assert.equal(png.subarray(1,4).toString(),"PNG");
        fs.writeFileSync(filename,png);
        const pngSize={width:png.readUInt32BE(16),height:png.readUInt32BE(20)};
        if(pngSize.width!==scene.width || pngSize.height!==scene.height)
          problems.push("PNG_DIMENSION_MISMATCH");
        const status=problems.length ? "FAIL" : "PASS";
        report.cases.push({
          name:scene.name,view:scene.view,theme:scene.theme,
          category:scene.category||"all",requested:{width:scene.width,height:scene.height},
          css_metrics:metrics,png:pngSize,checks:problems,status,file:filename
        });
        console.log(status,scene.name,"CSS",metrics.innerWidth+"/"+metrics.clientWidth+
          "/"+metrics.scrollWidth,"PNG",pngSize.width+"x"+pngSize.height,
          problems.join(","));
      } catch(error) {
        report.cases.push({name:scene.name,status:"FAIL",error:String(error)});
        console.error("FAIL",scene.name,String(error));
      }
    }
    try { report.interaction=await interactions(cdp,url); }
    catch(error) { report.interaction={status:"FAIL",error:String(error)}; }
    report.status=report.cases.length===matrix.length &&
      report.cases.every(x=>x.status==="PASS")&&report.interaction.status==="PASS"
      ? "PASS_BROWSER_SIMULATION_ONLY" : "FAIL";
  } catch(error) {
    report.status="FAIL";report.error=String(error);console.error("CDP FAIL:",String(error));
  } finally {
    const destination=path.join(out,"capture-report.json");
    fs.writeFileSync(destination,JSON.stringify(report,null,2)+"\n","utf8");
    console.log("Browser QA report:",destination,"status:",report.status);
    if(cdp) { try {await cdp.call("Browser.close",{},1500);}catch{} cdp.close(); }
    if(child) child.kill();
    if(server.listening) await new Promise(resolve=>server.close(resolve));
    if(profile) {try{fs.rmSync(profile,{recursive:true,force:true});}catch{}}
    if(report.status!=="PASS_BROWSER_SIMULATION_ONLY")process.exitCode=1;
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
