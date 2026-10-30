// UI-MIG-02 local Windows lockfile bootstrap. Run in the isolated React preview.
// Command: node scripts/bootstrap-lockfile.cjs
// No writes outside docs/previews/ui-react; NEVER fabricates dependency metadata.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {spawnSync} = require("node:child_process");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root,"package.json");
const lockPath = path.join(root,"package-lock.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath,"utf8"));
assert.equal(manifest.private,true,"must remain an isolated private preview package");
assert.equal(manifest.name,"wd-books-ui-mig02-spike","unexpected package root");
if(fs.existsSync(lockPath)){
  console.error("package-lock.json already exists. No changes made.");
  console.error("Review the existing lockfile or remove it deliberately in the isolated preview before regenerating.");
  process.exit(2);
}
// On Windows, pass a fixed command string (no argv) to cmd.exe.
 // Node 24 deprecates shell:true together with a separate argv array (DEP0190).
const isWindows=process.platform==="win32";
const command=isWindows
  ? "npm install --package-lock-only --ignore-scripts --no-audit --no-fund"
  : "npm";
const args=isWindows?[]:[
  "install","--package-lock-only","--ignore-scripts","--no-audit","--no-fund",
];
const now=Date.now();
console.log("Generating package-lock.json from the REAL npm registry and package.json in:",root);
const result=spawnSync(command,args,{
  cwd:root,encoding:"utf8",timeout:180000,maxBuffer:1024*1024,
  shell:isWindows,env:{...process.env,CI:"false"}
});
if(result.stdout)process.stdout.write(result.stdout);
if(result.stderr)process.stderr.write(result.stderr);
if(result.error||result.status!==0){
  // npm may have written a partial artifact. Never present it as valid evidence.
  console.error("LOCKFILE GENERATION FAILED (not a Build or Gate 2 PASS).",result.error?.message||"exit "+result.status);
  process.exit(1);
}
assert(fs.existsSync(lockPath),"npm returned success without package-lock.json");
const lock=JSON.parse(fs.readFileSync(lockPath,"utf8"));
const rootRecord=lock.packages?.[""];
assert(lock.lockfileVersion>=3&&rootRecord,"npm lockfileVersion >=3 with root package required");
assert.equal(rootRecord.name,manifest.name);
assert.equal(rootRecord.version,manifest.version);
for(const field of ["dependencies","devDependencies"]){
  assert.deepEqual(rootRecord[field]||{},manifest[field]||{},
    "npm lockfile root must match package.json "+field);
}
assert(Object.keys(lock.packages).length>3,"genuine npm dependency tree required");
console.log("LOCKFILE GENERATED AND VALIDATED:",lockPath);
console.log("Entries:",Object.keys(lock.packages).length,"Elapsed:",Date.now()-now,"ms");
console.log("Next: node scripts/gate2-evidence.cjs --install-build");
console.log("Commit/review this generated lockfile on the isolated PR branch only, never main directly.");
