// UI-MIG-02R2 local-only Gate 2 evidence collector (no Actions/Production calls).
// From docs/previews/ui-react: node scripts/gate2-evidence.cjs
// Add --install-build ONLY in an isolated checkout with npm registry available.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {spawnSync}=require("node:child_process");
const root=path.resolve(__dirname,"..");
const npm=process.platform==="win32"?"npm.cmd":"npm";
const full=process.argv.includes("--install-build");
const entries=[];
function run(label,command,args,timeout=60000){
  const now=Date.now();
  const result=spawnSync(command,args,{
    cwd:root,encoding:"utf8",timeout,maxBuffer:512*1024,
    // npm.cmd is a batch wrapper on Windows; only fixed npm commands use a shell.
    shell:process.platform==="win32"&&command===npm,
    env:{...process.env,CI:"1"}
  });
  const status=result.status===0&&!result.error?"PASS":"FAIL";
  const item={label,status,exit_code:result.status,elapsed_ms:Date.now()-now,
    error:result.error?.message||null,
    stdout:(result.stdout||"").slice(-3000),
    stderr:(result.stderr||"").slice(-3000)};
  entries.push(item);
  console.log(status,label);
  if(status==="FAIL"){
    const detail=[item.error,item.stderr,item.stdout].filter(Boolean).join("\n").trim();
    console.error("----- "+label+" failure detail -----");
    console.error(detail ? detail.slice(-3200) : "No stdout/stderr available");
    console.error("----- end -----");
  }
  return status==="PASS";
}
function skip(label,reason){
  entries.push({label,status:"NOT_RUN",reason});
  console.log("NOT_RUN",label,"—",reason);
}
const nodeMajor=Number(process.versions.node.split(".")[0]);
assert(nodeMajor>=22,"Node >=22 required for native TypeScript test runner");
run("native catalog + UI source tests",process.execPath,[
  "--experimental-strip-types","--test",
  "tests/catalog-filter.test.mjs","tests/ui-category-contract.test.mjs"
]);
const locked=fs.existsSync(path.join(root,"package-lock.json"));
if(!full){
  skip("npm ci",locked?"use --install-build after review":"no committed package-lock.json");
  skip("npm run build","use --install-build only when lockfile and deps are available");
  skip("Vite dist nested-path contracts","build has not run");
}else if(!locked){
  entries.push({label:"npm ci",status:"FAIL",reason:"package-lock.json missing — cannot reproduce dependency resolution"});
  skip("npm run build","blocked by missing lockfile");
  skip("Vite dist nested-path contracts","blocked by missing lockfile");
}else if(run("npm ci",npm,["ci","--no-audit","--no-fund"],120000)){
  if(run("npm run build",npm,["run","build"],120000)){
    run("Vite dist nested-path contracts",process.execPath,["--test","tests/vite-dist-contract.test.mjs"]);
  }else skip("Vite dist nested-path contracts","build failed");
}else {
  skip("npm run build","npm ci failed");
  skip("Vite dist nested-path contracts","npm ci failed");
}
skip("nested-path browser verification","requires locally served dist and screenshot evidence");
skip("iPhone/iPad real-device QA","requires device and owner acceptance");
const report={
  gate:"WD_BOOKS_UI_MIG02_LOCAL_EVIDENCE",date:new Date().toISOString(),
  node:process.version,platform:process.platform,lockfile:locked,
  full_build_requested:full,
  gate2:"OPEN",
  entries
};
const destination=path.resolve(process.env.WD_UI_GATE_REPORT||
  path.join(os.tmpdir(),"wd-books-ui-mig02-gate.json"));
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,JSON.stringify(report,null,2)+"\n","utf8");
console.log("Gate 2 remains OPEN until lockfile, build, browser and device evidence; report:",destination);
if(entries.some(item=>item.status==="FAIL"))process.exitCode=1;
