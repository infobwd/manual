// node tests/audio-reader-integration.smoke.cjs
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const html=read("index.html");
const app=read("assets/app.js");
const sw=read("sw.js");
const css=read("assets/audio-reader.css");
const version=read("assets/app-version.js");
const core=read("assets/audio-reader-core.js");
const player=read("assets/audio-reader.js");
const ordered=[
  'src="./assets/app.js"',
  'src="./assets/audio-reader-core.js"',
  'src="./assets/audio-reader.js"'
].map(item=>html.indexOf(item));
assert.ok(ordered.every(n=>n>0)&&ordered[0]<ordered[1]&&ordered[1]<ordered[2],
  "Reader must initialize before audio module and core before controls");
assert.match(html,/href="\.\/assets\/audio-reader\.css"/);
for(const id of ["readerAudioToggle","wdAudioPanel","wdAudioPlay","wdAudioPrev","wdAudioNext","wdAudioStop","wdAudioSpeed","wdAudioSeek","wdAudioMini","wdAudioMiniPlay","wdAudioMiniStop","wdNarrationMedia"]){
  assert.ok(html.includes('id="'+id+'"'),"Missing control "+id);
}
assert.ok(html.indexOf('id="wdAudioPanel"')>html.indexOf('id="readerAudioToggle"'));
assert.ok(html.indexOf('id="wdNarrationMedia"')>html.indexOf("</dialog>\n</body>")-20 || html.lastIndexOf("</dialog>")<html.indexOf('id="wdNarrationMedia"'),
 "Audio element must survive native Reader dialog close");
assert.match(app,/WD_AUDIO_READER\?\.selectBook\?\.\(book,\s*state\.page\)/);
assert.match(app,/WD_AUDIO_READER\?\.syncPage\?\.\(state\.manual\.id,\s*first\)/);
assert.match(core,/status === "published"/);
assert.match(player,/audio\.play\(\)/);
assert.match(player,/mediaSession\.setActionHandler/);
assert.match(css,/wd-audio-mini/);
assert.match(html,/id="wdAudioOnline"/);
assert.match(html,/id="wdAudioLock"/);
assert.match(html,/id="wdListeningLock"/);
for(const id of ["wdLockCover","wdLockCoverTitle","wdLockProgress","wdLockSeek",
  "wdLockPlay","wdLockPrev","wdLockNext","wdLockSpeed","wdLockUnlock"]) {
  assert.ok(html.includes('id="'+id+'"'),"Now Playing control missing "+id);
}
assert.match(read("assets/audio-listening-lock.js"),/previousChapter\?\.\(\)/);
assert.match(read("assets/audio-listening-lock.js"),/togglePlayback\?\.\(\)/);
assert.match(player,/setPlaybackRate:changeSpeed/);

assert.match(html,/id="wdOnlineTtsMedia"/);
assert.match(html,/src="\.\/assets\/audio-listening-lock\.js"/);
assert.match(read("assets/audio-listening-lock.js"),/navigator\.wakeLock\.request\("screen"\)/);

for(const id of ["wdAudioCompact","wdAudioCompactPlay","wdAudioCompactExpand","wdAudioCompactProgress",
  "wdAudioMiniProgress","wdAudioBackdrop","wdAudioProgress","wdAudioProgressLabel","wdAudioMore"]) {
  assert.ok(html.includes('id="'+id+'"'),"Missing redesigned audio UI "+id);
}
assert.match(css,/\.wd-audio-compact\s*\{/);
assert.match(css,/\.wd-audio-backdrop:not\(\[hidden\]\)/);
assert.match(css,/\.wd-audio-mini>progress/);
assert.match(css,/\.reader-dialog \.wd-audio-panel\s*\{/);
assert.match(core,/function listeningProgress\(/);
assert.match(player,/remoteAudio\.addEventListener\("timeupdate"/);
assert.match(css,/@media\(max-width:600px\)/);
assert.match(version,/WD_BOOKS_VERSION = "1\.3\.41"/);
for(const asset of ["./assets/audio-reader.css","./assets/audio-reader-core.js","./assets/audio-reader.js","./assets/audio-listening-lock.js"]){
  assert.ok(sw.includes('"'+asset+'"'),"New static PWA shell asset missing: "+asset);
}
assert.ok(!sw.includes('"/assets/audio/'),"No bulk-download of media files during PWA update");
assert.match(sw,/SKIP_WAITING/);
console.log("PASS: audio controls, loader order, existing Reader hooks and PWA shell contract");
