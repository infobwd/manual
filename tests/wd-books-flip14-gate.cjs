// FLIP-14 local-only QA command. No network/npm/Actions; does not mutate the PWA.
// Run from repo root: node tests/wd-books-flip14-gate.cjs
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {spawnSync}=require("node:child_process");
const root=path.resolve(__dirname,"..");
const targets=[
  "flipbook-module-manifest.smoke.cjs",
  "flipbook-sar-parity.smoke.cjs",
  "flipbook-sar-values.smoke.cjs",
  "flipbook-default-paper.smoke.cjs",
  "flipbook-close-book-label.smoke.cjs",
  "flipbook-corner.smoke.cjs",
  "flipbook-pilot.smoke.cjs",
  "flipbook-ios-embed.smoke.cjs",
  "flipbook-native-mobile-controls.smoke.cjs",
  "flipbook-desktop-layout.smoke.cjs",
  "flipbook-closed-cover-category.smoke.cjs",
  "flipbook-reader-bridge.behavior.cjs",
  "flipbook-return-child.behavior.cjs",
  "pwa-reader.smoke.cjs",
  "pwa-update-lifecycle.smoke.cjs",
  "audio-reader-integration.smoke.cjs",
  "manuals-data-syntax.smoke.cjs",
  "library.smoke.cjs",
];
assert.equal(new Set(targets).size,targets.length,"no duplicate tests");
const entries=[];
for(const name of targets){
  const file=path.join(__dirname,name);
  assert(fs.existsSync(file),"missing test file: "+name);
  const begun=Date.now();
  const result=spawnSync(process.execPath,[file],{
    cwd:root,encoding:"utf8",timeout:20000,maxBuffer:512*1024,
    env:{...process.env,CI:"1"},
  });
  const status=result.status===0&&!result.error?"PASS":"FAIL";
  entries.push({
    file:name,status,elapsed_ms:Date.now()-begun,exit_code:result.status,
    error:result.error?.message??null,
    stdout:(result.stdout||"").slice(-3000),
    stderr:(result.stderr||"").slice(-3000),
  });
  console.log(status.padEnd(4),name);
}
const pass=entries.filter(item=>item.status==="PASS").length;
const report={
  gate:"WD_BOOKS_FLIP14_LOCAL_NODE",
  date:new Date().toISOString(),node:process.version,platform:process.platform,
  checked:entries.length,pass,fail:entries.length-pass,
  device_browser_qa:"NOT_TESTED",
  react_build:"NOT_TESTED",
  entries,
};
const destination=process.env.WD_QA_REPORT
  ? path.resolve(process.env.WD_QA_REPORT)
  : path.join(os.tmpdir(),"wd-books-flip14-node-gate.json");
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,JSON.stringify(report,null,2)+"\n","utf8");
console.log("Result:",pass+"/"+entries.length,"PASS; report:",destination);
if(pass!==entries.length)process.exitCode=1;
