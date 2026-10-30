// UI-MIG-02 local browser screenshot matrix after an ACTUAL Vite Build.
// node scripts/capture-responsive.cjs
// Uses only Node built-ins + installed Chrome/Edge. Does not touch Production.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const http=require("node:http");
const {spawn,spawnSync}=require("node:child_process");

const root=path.resolve(__dirname,"..");
const dist=path.join(root,"dist");
assert(fs.existsSync(path.join(dist,"index.html")),
  "dist/index.html missing: first run node scripts/gate2-evidence.cjs --install-build");
const out=path.resolve(process.env.WD_UI_CAPTURE_DIR ||
  path.join(os.tmpdir(),"wd-books-ui-mig02-captures"));
fs.mkdirSync(out,{recursive:true});
const candidates=[
  process.env.CHROME_BIN,
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES,"Google","Chrome","Application","chrome.exe"),
  process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"],"Microsoft","Edge","Application","msedge.exe"),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA,"Google","Chrome","Application","chrome.exe"),
  "chrome","msedge","chromium","chromium-browser","google-chrome",
].filter(Boolean);
const browser=candidates.find(file=>{
  if((file.includes("/") || file.includes("\\")) && !fs.existsSync(file))return false;
  const r=spawnSync(file,["--version"],{encoding:"utf8",timeout:5000,windowsHide:true});
  return r.status===0&&!r.error;
});
assert(browser,"Chrome/Edge not found; set CHROME_BIN to the browser executable");

const mime={
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".png":"image/png",".svg":"image/svg+xml",
  ".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json; charset=utf-8"
};
const server=http.createServer((req,res)=>{
  if(req.method!=="GET"){res.writeHead(405);res.end();return;}
  let url;try{url=new URL(req.url,"http://localhost");}
  catch{res.writeHead(400);res.end();return;}
  let parts;
  try{parts=decodeURIComponent(url.pathname).split("/").filter(Boolean);}
  catch{res.writeHead(400);res.end();return;}
  if(parts.some(part=>part===".."||part==="."||part.startsWith("."))){
    res.writeHead(404);res.end();return;
  }
  const filename=path.resolve(dist,...(parts.length?parts:["index.html"]));
  if(!filename.startsWith(dist+path.sep)){res.writeHead(404);res.end();return;}
  const type=mime[path.extname(filename).toLowerCase()];
  if(!type){res.writeHead(404);res.end();return;}
  fs.stat(filename,(err,stat)=>{
    if(err || !stat.isFile()){res.writeHead(404);res.end();return;}
    res.writeHead(200,{"Content-Type":type,"Cache-Control":"no-store",
      "Content-Length":stat.size,"X-Content-Type-Options":"nosniff"});
    fs.createReadStream(filename).on("error",()=>res.destroy()).pipe(res);
  });
});
function headless(args){
  return new Promise((resolve,reject)=>{
    const child=spawn(browser,args,{windowsHide:true,
      env:{...process.env},stdio:["ignore","pipe","pipe"]});
    let stdout="",stderr="",done=false;
    const timer=setTimeout(()=>{
      if(done)return;done=true;child.kill();
      reject(new Error("Browser timeout: "+stderr.slice(-600)));
    },30000);
    child.stdout.on("data",d=>{if(stdout.length<2_000_000)stdout+=String(d)});
    child.stderr.on("data",d=>{if(stderr.length<250_000)stderr+=String(d)});
    child.on("error",e=>{if(done)return;done=true;clearTimeout(timer);reject(e)});
    child.on("close",code=>{
      if(done)return;done=true;clearTimeout(timer);
      if(code!==0)reject(new Error("Chrome exit "+code+": "+stderr.slice(-1400)));
      else resolve({stdout,stderr});
    });
  });
}
// Include the actual Category-first Bookshelf, not just Home screenshots.
// These query parameters only change the isolated sample React preview state.
const matrix=[
  {name:"phone-home-390x844",width:390,height:844,view:"home",theme:"light"},
  {name:"phone-books-390x844",width:390,height:844,view:"books",theme:"light"},
  {name:"tablet-books-1024x768",width:1024,height:768,view:"books",theme:"light"},
  {name:"desktop-books-1366x768",width:1366,height:768,view:"books",theme:"light"},
  {name:"desktop-books-night-1366x768",width:1366,height:768,view:"books",theme:"night"},
  {name:"desktop-category-1920x1080",width:1920,height:1080,view:"books",
    theme:"light",category:"งานบริหาร"},
  {name:"desktop-settings-sepia-1366x768",width:1366,height:768,
    view:"settings",theme:"sepia"},
];
function openServer(){
  return new Promise((resolve,reject)=>{
    server.once("error",reject);
    server.listen(0,"127.0.0.1",()=>resolve(server.address().port));
  });
}
async function capture(){
  const port=await openServer();
  const url="http://127.0.0.1:"+port+"/";
  const report={date:new Date().toISOString(),browser,preview_url:url,
    chrome_viewports_not_real_mobile_devices:true,cases:[]};
  const profile=path.join(out,"chrome-test-profile");
  const flags=[
    "--headless=new","--disable-gpu","--no-first-run",
    "--no-default-browser-check","--disable-extensions",
    "--hide-scrollbars","--force-device-scale-factor=1",
    "--disable-dev-shm-usage","--virtual-time-budget=1800",
    "--user-data-dir="+profile
  ];
  try{
    for(const {name,width,height,view,theme,category} of matrix){
      const args=[...flags,"--window-size="+width+","+height];
      const target=new URL(url);
      target.searchParams.set("view",view);
      target.searchParams.set("theme",theme);
      if(category) target.searchParams.set("category",category);
      // Validate that the requested React screen actually mounted before capture.
      const dom=await headless([...args,"--dump-dom",target.href]);
      assert(dom.stdout.includes("WD Books"),"React preview brand missing on "+name);
      const expected=view==="home"
        ? ["หนังสือดี ๆ อ่านต่อได้ทุกวัน","คู่มือครู"]
        : view==="books"
          ? ['id="bookshelfTitle"',"หมวดหมู่หนังสือ","พบ"]
          : ["ตั้งค่าการอ่าน","ขนาดตัวอักษร"];
      for(const token of expected){
        assert(dom.stdout.includes(token),
          "React "+view+" did not mount expected content "+token+" on "+name);
      }
      if(category){
        assert(dom.stdout.includes("คู่มือบริหารโรงเรียน"),
          "selected category not present in Bookshelf on "+name);
      }
      const image=path.join(out,name+".png");
      await headless([...args,"--screenshot="+image,target.href]);
      assert(fs.existsSync(image)&&fs.statSync(image).size>5000,
        "Missing/empty screenshot "+name);
      const png=fs.readFileSync(image);
      assert(png.subarray(1,4).toString()==="PNG","invalid PNG "+name);
      const actualWidth=png.readUInt32BE(16),actualHeight=png.readUInt32BE(20);
      const sizeMatches=actualWidth===width&&actualHeight===height;
      report.cases.push({
        name,view,theme,category:category||"all",
        requested:{width,height},actual:{width:actualWidth,height:actualHeight},
        sizeMatches,status:sizeMatches?"CAPTURED":"CAPTURED_SIZE_REVIEW",file:image
      });
      console.log(sizeMatches?"CAPTURED":"CAPTURED (viewport size differs)",
        name,actualWidth+"x"+actualHeight,image);
    }
    report.status=report.cases.some(item=>!item.sizeMatches)
      ? "SCREENSHOTS_CAPTURED_VIEWPORT_REVIEW"
      : "SCREENSHOTS_CAPTURED_NOT_DEVICE_QA_PASS";
  }catch(error){
    report.status="FAIL";
    report.error=String(error);
    throw error;
  }finally{
    const reportFile=path.join(out,"capture-report.json");
    fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+"\n","utf8");
    console.log("QA report:",reportFile);
    await new Promise(resolve=>server.close(resolve));
  }
}
capture().catch(error=>{console.error("UI-MIG-02 browser capture FAIL:",error.message);process.exitCode=1;});
