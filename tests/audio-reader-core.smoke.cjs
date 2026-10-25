// node tests/audio-reader-core.smoke.cjs
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname,"..");
const ctx = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"assets/audio-reader-core.js"),"utf8"),ctx);
const a = ctx.window.WD_AUDIO_CORE;
assert.ok(a);
const book = {id:"b1",status:"published",pages:[
  {title:"บทที่ 1",paragraphs:["ภาษาไทยควรอ่านได้ตามลำดับ", "เรียนรู้ทีละนิด"],bullets:["คำถามแรก"],tip:"สรุป"},
  {title:"บทที่ 2",paragraphs:["บทถัดไป"]}]};
assert.equal(a.isReadable(book),true);
assert.equal(a.narrationText(book.pages[0]).includes("สรุป"),true);
const chunks = a.splitSpeech("ยินดีต้อนรับ".repeat(90),120);
assert.ok(chunks.length>1);
assert.ok(chunks.every(x=>Array.from(x).length<=120));
assert.equal(chunks.join(""),"ยินดีต้อนรับ".repeat(90));
assert.equal(a.safeRate(7),1);
assert.equal(a.safeRate(1.25),1.25);
assert.equal(a.audioAsset(book),null);
assert.equal(a.pickThaiVoice([{lang:"en-US"},{lang:"th-TH",name:"Thai"}]).name,"Thai");
assert.equal(a.pickThaiVoice([{lang:"en-US"}]),null);
assert.equal(a.schoolTtsUrl("ทดสอบเสียง").startsWith("https://wd.esdc.app/backend-php/api.php?endpoint=tts&lang=th&q="),true);
assert.equal(a.schoolTtsUrl("ทดสอบเสียง").includes(encodeURIComponent("ทดสอบเสียง")),true);
assert.equal(a.schoolTtsUrl(""),null);
assert.equal(a.schoolTtsUrl("ก".repeat(181)),null);

const good = {...book,audio:{src:"./assets/audio/b1/narration.m4a",chapterOffsets:[0,123],license:"school-approved",narrationVersion:"1"}};
assert.equal(a.audioAsset(good).offsets.length,2);
assert.equal(a.audioAsset({...good,audio:{...good.audio,src:"https://third-party.example/track.mp3"}}),null);
assert.equal(a.audioAsset({...good,audio:{...good.audio,license:""}}),null);
assert.equal(a.audioAsset({...good,audio:{...good.audio,narrationVersion:""}}),null);
assert.equal(a.audioAsset({...good,audio:{...good.audio,src:"./assets/audio/../private.mp3"}}),null);
assert.equal(a.audioAsset({...good,audio:{...good.audio,chapterOffsets:[12,0]}}),null);
assert.equal(a.audioAsset({...good,audio:{...good.audio,chapterOffsets:[0]}}),null);
assert.equal(a.chapterForOffset([0,45,100],99),1);
assert.equal(a.chapterForOffset([0,45,100],100),2);
assert.equal(a.formatTime(64),"01:04");
const stored = {version:1,positions:{b1:{chapter:2,time:35,rate:1.5},secret:{chapter:999,time:4,rate:1}}};
const restored = a.restore(JSON.stringify(stored),["b1"]);
assert.deepEqual(Object.keys(restored),["b1"]);
assert.equal(restored.b1.rate,1.5);
assert.equal(a.restore("not-json",["b1"]).b1,undefined);
console.log("PASS: public-only audio contract, Thai chunking, saved positions, local audio safety");
