// UX-P3A synthetic tests. Run: node tests/audio-reader-playback.smoke.cjs
// Does not emulate actual iOS background media or prove lock-screen playback.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname,"..");
const load=name=>fs.readFileSync(path.join(root,name),"utf8");
const twoPages = [{title:"บทที่หนึ่ง",paragraphs:["การอ่านภาษาไทยเพื่อการเรียนรู้"]},{title:"บทที่สอง",paragraphs:["ก้าวต่อไป"]}];
const published = {id:"public-book",status:"published",title:"หนังสือทดลอง",edition:"Public",pages:twoPages};
const audioBook = {...published,id:"asset-book",audio:{
  src:"./assets/audio/asset-book/narration.m4a",chapterOffsets:[0,30],
  license:"school-approved",narrationVersion:"1"
}};
class Node {
  constructor(){this.hidden=true;this.open=false;this.value="";this.textContent="";this.disabled=false;this.currentTime=0;this.duration=120;this.src="";this.attrs={};this.events={};this.paused=true;this.playbackRate=1;}
  addEventListener(type,fn){(this.events[type] ||= []).push(fn)}
  fire(type,event={}){for(const fn of(this.events[type] || []))fn(event)}
  setAttribute(k,v){this.attrs[k]=v}
  getAttribute(k){return this.attrs[k] ?? null}
  removeAttribute(k){delete this.attrs[k]}
  pause(){this.paused=true;this.fire("pause")}
  load(){this.fire("loadedmetadata")}
  play(){this.paused=false;this.fire("play");return Promise.resolve()}
  focus(){this.focused=true}
}
function fixture() {
  const instances={};
  const $=id=>instances[id] ||= new Node();
  const reader=$("readerDialog");reader.open=true;
  const media=$("wdNarrationMedia");media.duration=120;
  let utterances=[];
  const synth={
    voices:[{lang:"th-TH",name:"Thai"}],paused:false,
    getVoices(){return this.voices},
    speak(utter){utterances.push(utter)},
    pause(){this.paused=true},
    resume(){this.paused=false},
    cancel(){}
  };
  class Utterance {constructor(text){this.text=text;this.rate=1}}
  const session={handlers:{},playbackState:"none",setActionHandler(name,fn){this.handlers[name]=fn},setPositionState(info){this.position=info}};
  const window={WD_LIBRARY_DATA:{manuals:[published,audioBook]},speechSynthesis:synth,SpeechSynthesisUtterance:Utterance,MediaMetadata:class {constructor(data){Object.assign(this,data)}}};
  const document={getElementById:$,hidden:false,addEventListener(){}};
  const navigator={mediaSession:session};
  const memory={data:{},getItem(key){return this.data[key] ?? null},setItem(key,v){this.data[key]=v}};
  const ctx=vm.createContext({window,document,navigator,localStorage:memory});
  vm.runInContext(load("assets/audio-reader-core.js"),ctx,{filename:"assets/audio-reader-core.js"});
  vm.runInContext(load("assets/audio-reader.js"),ctx,{filename:"assets/audio-reader.js"});
  return { $,window,reader,media,synth,session,memory,utterances:()=>utterances };
}
async function run(){
  const f=fixture(),a=f.window.WD_AUDIO_READER;
  assert.ok(a,"Audio module should initialize");
  a.selectBook({...published,status:"review"},0);
  assert.equal(a.getState().bookId,null,"Unpublished books cannot be selected");
  a.selectBook(published,0);
  assert.equal(a.getState().bookId,published.id);
  assert.equal(f.utterances().length,0,"Opening a book must never autoplay");
  f.$("readerAudioToggle").fire("click");
  assert.equal(f.$("wdAudioPanel").hidden,false);
  f.$("wdAudioPlay").fire("click");
  assert.equal(f.utterances().length,1,"Play starts Thai voice");
  assert.equal(f.utterances()[0].lang,"th-TH");
  assert.equal(a.getState().playing,true);
  f.$("wdAudioPlay").fire("click");assert.equal(f.synth.paused,true);
  f.$("wdAudioPlay").fire("click");assert.equal(f.synth.paused,false);
  f.utterances()[0].onend();
  assert.equal(a.getState().chapter,1,"Speech automatically advances to next chapter");
  assert.equal(f.utterances().length,2);
  f.reader.open=false;f.reader.fire("close");
  assert.equal(f.$("wdAudioMini").hidden,false,"Mini-player remains while speaking after closing Reader");
  f.$("wdAudioMiniStop").fire("click");
  assert.equal(a.getState().playing,false);
  assert.equal(f.$("wdAudioMini").hidden,true);
  assert.ok(f.memory.data["wd-books-audio-v1"]);
  assert.equal(f.memory.data["wd-manual-reader-v2"],undefined,"Separate storage cannot mutate reading history");

  f.reader.open=true;
  a.selectBook(audioBook,0);
  assert.equal(a.getState().mode,"asset");
  a.syncPage(audioBook.id,1);
  assert.equal(a.getState().chapter,0,"Visual paging cannot overwrite saved media timeline");
  f.$("readerAudioToggle").fire("click");
  f.$("wdAudioPlay").fire("click");
  await Promise.resolve();
  assert.equal(f.media.src,audioBook.audio.src);
  assert.equal(a.getState().playing,true);
  assert.equal(f.session.metadata.title,audioBook.title);
  assert.equal(typeof f.session.handlers.play,"function");
  assert.equal(typeof f.session.handlers.pause,"function");
  assert.equal(typeof f.session.handlers.seekto,"function");
  f.media.currentTime=47;f.media.fire("timeupdate");
  assert.equal(a.getState().chapter,1,"Media time maps to chapter offsets");
  f.session.handlers.seekto({seekTime:20});
  assert.equal(f.media.currentTime,20);
  assert.equal(a.getState().chapter,0);
  f.session.handlers.pause();
  assert.equal(a.getState().paused,true);
  f.$("wdAudioStop").fire("click");
  assert.equal(a.getState().playing,false);
  assert.equal(f.session.playbackState,"none","Stopped media must release lock-screen playback status");

  // Guard against a device missing Thai voices (no fallback English narration).
  a.selectBook(published,0);
  f.synth.voices=[{lang:"en-US"}];
  f.$("wdAudioPlay").fire("click");
  assert.equal(a.getState().playing,false);
  assert.match(f.$("wdAudioStatus").textContent,/ไม่พบเสียงภาษาไทย/);
  console.log("PASS: audio reader foreground Thai speech, pause/chapters/mini, approved media session, privacy");
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
module.exports=run;
