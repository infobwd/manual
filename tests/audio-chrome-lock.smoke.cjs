// node tests/audio-chrome-lock.smoke.cjs
// Synthetic only: cannot prove online server health or physical lock-screen audio.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
class Node {
  constructor() {
    this.events={};this.attrs={};this.hidden=true;this.open=false;
    this.disabled=false;this.textContent="";this.value="";this.src="";
    this.currentTime=0;this.duration=180;this.playbackRate=1;this.playCalls=0;
    const set=new Set();
    this.classList={add:v=>set.add(v),remove:v=>set.delete(v),contains:v=>set.has(v)};
  }
  addEventListener(n,fn){(this.events[n] ||= []).push(fn);}
  fire(n,data={}){for(const fn of this.events[n]||[])fn(data);}
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k]??null;}
  removeAttribute(k){delete this.attrs[k];}
  play(){this.playCalls++;return Promise.resolve();}
  pause(){}
  load(){}
  showModal(){this.open=true;}
  close(){this.open=false;this.fire("close");}
  focus(){this.focused=true;}
  setPointerCapture(){}
}
function fixture() {
  const nodes={};
  const $=id=>nodes[id] ||= new Node();
  $("readerDialog").open=true;
  const pages=[
    {title:"ตอนที่ 1",paragraphs:["เนื้อหาสาธารณะบทแรก"]},
    {title:"ตอนที่ 2",paragraphs:["เนื้อหาสาธารณะบทต่อไป"]}
  ];
  const published={id:"public",status:"published",title:"คู่มือสาธารณะ",edition:"Public",pages};
  const review={...published,id:"draft",status:"review"};
  const timers=new Map();
  let nextTimer=1, wakeAcquired=0, wakeReleased=0;
  const listeners={};
  const synth={
    voices:[{lang:"en-US",name:"English"}],spoken:[],
    getVoices(){return this.voices},
    addEventListener(type,fn){(listeners[type] ||= []).push(fn)},
    fire(type){for(const fn of listeners[type]||[])fn()},
    speak(utter){this.spoken.push(utter)},
    cancel(){},pause(){},resume(){}
  };
  class Utterance {constructor(text){this.text=text}}
  const window={
    WD_LIBRARY_DATA:{manuals:[published,review]},
    speechSynthesis:synth,SpeechSynthesisUtterance:Utterance,
    setTimeout(fn,ms){const id=nextTimer++;timers.set(id,{fn,ms});return id;},
    clearTimeout(id){timers.delete(id)}
  };
  const navigator={
    mediaSession:null,
    wakeLock:{async request(kind){
      assert.equal(kind,"screen");wakeAcquired++;
      return {release(){wakeReleased++;return Promise.resolve()},addEventListener(){}};
    }}
  };
  const document={getElementById:$,hidden:false,addEventListener(){}};
  const memory={data:{},getItem(k){return this.data[k]??null},setItem(k,v){this.data[k]=v}};
  const context=vm.createContext({window,navigator,document,localStorage:memory});
  for(const name of ["assets/audio-reader-core.js","assets/audio-reader.js","assets/audio-listening-lock.js"]){
    vm.runInContext(read(name),context,{filename:name});
  }
  return {window,navigator,document,nodes,$,memory,published,review,synth,timers,
    wakeStats:()=>({wakeAcquired,wakeReleased}),flush:async()=>{await Promise.resolve();await Promise.resolve();}};
}
async function run(){
  const f=fixture(),a=f.window.WD_AUDIO_READER;
  a.selectBook(f.published,0);
  f.$("wdAudioPlay").fire("click");
  assert.equal(f.synth.spoken.length,0,"Do not force mismatched English voice");
  assert.match(f.$("wdAudioStatus").textContent,/ไม่พบเสียงภาษาไทย/);
  assert.equal(f.$("wdOnlineTtsMedia").playCalls,0,"No network speech before explicit opt-in");
  assert.equal(f.$("wdAudioOnline").hidden,false);
  f.$("wdAudioOnline").fire("click");
  assert.equal(a.getState().mode,"online");
  assert.equal(f.$("wdOnlineTtsMedia").playCalls,0,"Consent alone should not start playing");
  f.$("wdAudioPlay").fire("click");await f.flush();
  assert.equal(a.getState().playing,true);
  assert.equal(f.$("wdOnlineTtsMedia").playCalls,1);
  assert.equal(f.$("wdAudioCompact").hidden,true,
    "Compact bar remains hidden while detailed panel is active");
  const initialPercent=a.getState().progress.percent;
  f.$("wdOnlineTtsMedia").currentTime=90;
  f.$("wdOnlineTtsMedia").fire("timeupdate");
  assert.ok(a.getState().progress.percent > initialPercent,"Online segment progress must advance while playing");
  assert.ok(f.$("wdAudioProgress").value>initialPercent);
  f.$("wdAudioClosePanel").fire("click");
  assert.equal(f.$("wdAudioCompact").hidden,false,"Closing the audio detail reveals compact control bar");
  f.$("wdAudioCompactExpand").fire("click");
  assert.equal(f.$("wdAudioPanel").hidden,false,"Compact control can reopen detail");
  // Failure does not restart the whole chapter when the user retries.
  f.$("wdOnlineTtsMedia").fire("error");
  assert.equal(a.getState().playing,false);
  f.$("wdAudioPlay").fire("click");await f.flush();
  assert.equal(a.getState().playing,true);
  assert.equal(f.$("wdOnlineTtsMedia").playCalls,2,"Retry should replay failed segment");
  assert.match(f.$("wdOnlineTtsMedia").src,/^https:\/\/wd\.esdc\.app\/backend-php\/api\.php\?endpoint=tts&lang=th&q=/);
  assert.ok(f.$("wdOnlineTtsMedia").src.includes(encodeURIComponent("ตอนที่ 1")));
  // Audio lock is independent of Reader top layer, with TDRS-like Wake Lock.
  assert.equal(f.$("wdAudioLock").disabled,false);
  f.$("wdAudioLock").fire("click");
  assert.equal(f.$("wdListeningLock").open,true);
  await f.flush();
  assert.equal(f.wakeStats().wakeAcquired,1);
  assert.match(f.$("wdLockTitle").textContent,/คู่มือสาธารณะ/);
  f.$("wdLockUnlock").fire("pointerdown",{button:0,pointerId:1});
  const timer=[...f.timers.values()].find(x=>x.ms===1800);
  assert.ok(timer,"Hold-to-unlock timer required");
  timer.fn();
  assert.equal(f.$("wdListeningLock").open,false);
  assert.equal(f.wakeStats().wakeReleased,1);
  assert.equal(a.getState().playing,true,"Unlock does not stop audio");
  f.$("wdOnlineTtsMedia").fire("ended");await f.flush();
  assert.equal(a.getState().chapter,1,"Remote narration advances chapter");
  assert.equal(f.$("wdOnlineTtsMedia").playCalls,3);
  f.$("wdAudioPlay").fire("click");
  assert.equal(a.getState().paused,true);
  f.$("wdAudioPlay").fire("click");await f.flush();
  assert.equal(a.getState().paused,false);
  f.$("wdAudioStop").fire("click");
  assert.equal(a.getState().playing,false);
  a.selectBook(f.review,0);
  assert.equal(a.getState().bookId,"public","Review book cannot be opened or narrated");
  // Fresh book selection revokes explicit online mode, and voice-list updates recover native TTS.
  const another={...f.published,id:"public-2"};
  // Not in stored public library => selectBook public allowed for future published books.
  a.selectBook(another,0);
  assert.equal(a.getState().mode,"speech");
  f.synth.voices=[{lang:"th-TH",name:"Thai"}];
  f.synth.fire("voiceschanged");
  f.$("wdAudioPlay").fire("click");
  assert.equal(f.synth.spoken.length,1,"Late Thai voiceschanged recovers local Chrome speech");
  assert.equal(f.synth.spoken[0].lang,"th-TH");
  assert.equal(f.$("wdOnlineTtsMedia").playCalls,4,"Native speech must not trigger remote MP3");
  assert.equal(f.memory.data["wd-manual-reader-v2"],undefined);
  console.log("PASS: Chrome Thai voice recovery, online consent, school MP3, touch-lock, wake cleanup, privacy");
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
module.exports=run;
