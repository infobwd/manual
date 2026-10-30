// UI-MIG-02 post-build contract. Run ONLY after npm run build succeeds.
// Catches accidental root-absolute URLs that break GitHub Pages subpaths.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync,statSync,readdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const dist = path.join(root,"dist");
const htmlPath = path.join(dist,"index.html");

test("Vite dist has a real nonempty HTML entry and relative asset URLs",()=>{
  assert.ok(existsSync(htmlPath),"dist/index.html missing: run npm run build first");
  const html=readFileSync(htmlPath,"utf8");
  assert.match(html, /<html\s+lang="th"/i);
  assert.match(html, /<div id="root"><\/div>/);
  assert.ok(!/<script[^>]+src="\/src\//i.test(html),"uncompiled source entry left in dist");
  const urls=[...html.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)].map(match=>match[1]);
  const bundles=urls.filter(value=>value.includes("assets/"));
  assert.ok(bundles.some(value=>/\.js(?:\?|$)/.test(value)),"bundled JavaScript missing");
  assert.ok(bundles.some(value=>/\.css(?:\?|$)/.test(value)),"bundled CSS missing");
  for(const url of bundles){
    assert.ok(url.startsWith("./assets/"),"asset path must be relative for /manual/ subpaths: "+url);
    const local=path.resolve(dist,url.replace(/^\.\//,""));
    assert.ok(local.startsWith(dist+path.sep),"asset escaped dist: "+url);
    assert.ok(existsSync(local)&&statSync(local).size>100,"bundle missing or empty: "+url);
  }
});

test("build keeps isolated preview and does not ship a Service Worker",()=>{
  assert.ok(!existsSync(path.join(dist,"sw.js")),"isolated prototype must not register a PWA worker");
  assert.ok(!existsSync(path.join(dist,"service-worker.js")));
  assert.ok(!existsSync(path.join(dist,"assets","manuals-data.js")),"preview must not embed real catalog");
  const manifest=JSON.parse(readFileSync(path.join(root,"package.json"),"utf8"));
  assert.equal(manifest.private,true);
  assert.ok(readdirSync(path.join(dist,"assets")).length>=2,"expected bundled preview assets");
});
