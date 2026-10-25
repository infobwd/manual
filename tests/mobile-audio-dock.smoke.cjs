// node tests/mobile-audio-dock.smoke.cjs
// Structural regression: layout and auth-boundary rules. Device CSS QA still required.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=n=>fs.readFileSync(path.join(root,n),"utf8");
const css=read("assets/audio-reader.css"),html=read("index.html");
const js=read("assets/audio-reader.js"),lock=read("assets/audio-listening-lock.js");
const core=read("assets/audio-reader-core.js"),sw=read("sw.js");
const anchor=css.indexOf("/* UX-P3A-R5 — True bottom-docked compact player.");
assert.ok(anchor>0,"Mobile bottom-dock fix missing");
const rules=css.slice(anchor);
assert.match(rules,/@media\(max-width:1100px\)/);
assert.match(rules,/\.reader-dialog\.wd-audio-compact-visible \.reader-shell > \.reader-content\s*\{[^}]*order:2;/s);
assert.match(rules,/\.reader-dialog\.wd-audio-compact-visible \.reader-shell > \.wd-audio-compact:not\(\[hidden\]\)\s*\{[^}]*order:3;[^}]*position:relative;[^}]*inset:auto;[^}]*flex:0 0 auto/s);
assert.match(rules,/margin:0 8px max\(6px,env\(safe-area-inset-bottom\)\)/);
assert.match(rules,/\.reader-dialog\.wd-audio-compact-visible \.reader-bottom\s*\{display:none\}/);
assert.match(rules,/\.reader-dialog\.wd-audio-compact-visible \.reader-stage\s*\{\s*padding-bottom:4px/s);
assert.match(rules,/\.wd-audio-compact-close\s*\{[^}]*min-width:44px;min-height:44px/s);
assert.match(rules,/@media\(max-width:420px\)/);
assert.match(rules,/@media\(max-width:350px\)/);
assert.ok(rules.indexOf("position:relative") > 0 && css.indexOf("67px") < anchor,
  "The new dock override must supersede the old 67px overlay position");
for(const id of ["wdAudioCompactReaderClose","wdAudioLocal","readerClose","wdAudioOnline","wdAudioCompact","wdAudioMini"]){
  assert.ok(html.includes('id="'+id+'"'),"Required control missing: "+id);
}
assert.match(js,/wdAudioCompactReaderClose"\)\.addEventListener\("click",\s*\(\) => \$\("readerClose"\)\.click\(\)\)/);
assert.match(js,/wdAudioLocal"\)\.addEventListener\("click"/);
assert.match(js,/onlineEnabled = false;/);
assert.match(js,/wdAudioLocal"\)\.hidden = !selected \|\| Boolean\(asset\) \|\| !onlineEnabled/);
assert.match(core,/SCHOOL_TTS_PROXY = "https:\/\/wd\.esdc\.app\/backend-php\/api\.php"/);
assert.ok(!/location\.(?:href|assign|replace)\s*(?:=|\()/.test(lock),
  "The in-app touch-lock controller must not navigate to an SSO page");
assert.match(sw,/if \(url\.origin !== scope\.origin \|\| !url\.pathname\.startsWith\(scope\.pathname\)\) return;/);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,"No duplicate document IDs");
console.log("PASS: actual bottom dock structure, visible Reader exit, local voice recovery, no TDRS navigation from lock");
