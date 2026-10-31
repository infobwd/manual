// UI-MIG-02R4 local server contracts. Pure Node built-ins; no npm or device required.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const {makeServer,HEADERS}=require("../scripts/device-preview.cjs");
const token="deviceQAOnlyTokenForTests_12345";
async function start(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"wd-r4-server-test-"));
  fs.mkdirSync(path.join(tmp,"assets"));
  fs.writeFileSync(path.join(tmp,"index.html"),
    '<!doctype html><script type="module" src="./assets/app.js"></script>');
  fs.writeFileSync(path.join(tmp,"assets","app.js"),'export const sample=1;');
  fs.writeFileSync(path.join(tmp,"private.txt"),"This must never be public");
  const server=makeServer({dist:tmp,token});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  return {
    origin:"http://127.0.0.1:"+server.address().port,
    tmp,
    async stop(){
      await new Promise(resolve=>server.close(resolve));
      fs.rmSync(tmp,{recursive:true,force:true});
    }
  };
}
test("dist SPA and relative Vite assets are accessible only with exact token",async()=>{
  const t=await start();
  try{
    const page=await fetch(t.origin+"/"+token+"/?qa=1");
    assert.equal(page.status,200);
    assert.match(await page.text(),/src="\.\/assets\/app.js"/);
    assert.equal(page.headers.get("cache-control"),HEADERS["Cache-Control"]);
    assert.match(page.headers.get("content-security-policy"),/connect-src 'none'/);
    const asset=await fetch(t.origin+"/"+token+"/assets/app.js");
    assert.equal(asset.status,200);assert.match(await asset.text(),/sample=1/);
    assert.equal((await fetch(t.origin+"/")).status,404);
    assert.equal((await fetch(t.origin+"/assets/app.js")).status,404);
    assert.equal((await fetch(t.origin+"/"+token+"/index.html")).status,404);
    assert.equal((await fetch(t.origin+"/"+token+"x/")).status,404);
    assert.equal((await fetch(t.origin+"/"+token+"/assets/../private.txt")).status,404);
    assert.equal((await fetch(t.origin+"/"+token+"/assets/private.txt")).status,404);
  }finally{await t.stop();}
});
test("non-GET requests fail without exposing local files",async()=>{
  const t=await start();
  try{
    const post=await fetch(t.origin+"/"+token+"/",{method:"POST",body:"private"});
    assert.equal(post.status,405);
    const head=await fetch(t.origin+"/"+token+"/",{method:"HEAD"});
    assert.equal(head.status,200);
    assert.equal(await head.text(),"");
  }finally{await t.stop();}
});
test("missing dist and weak token fail closed",()=>{
  assert.throws(()=>makeServer({dist:"/missing-r4-preview-directory",token}),/ENOENT/);
  assert.throws(()=>makeServer({dist:"/missing-r4-preview-directory",token:"short"}),/token required/);
});
