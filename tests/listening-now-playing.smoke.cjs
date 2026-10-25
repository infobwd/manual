// node tests/listening-now-playing.smoke.cjs
// Synthetic IN-APP Now Playing behavior: not OS lock-screen or real-device audio QA.
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..");
const load=p=>fs.readFileSync(path.join(root,p),"utf8");
class Node {
  constructor(){
    this.hidden=false;this.disabled=false;this.value=0;this.max=100;
    this.open=false;this.textContent="";this.dataset={};this.attrs={};this.events={};
    const classes=new Set();
    this.classList={add:v=>classes.add(v),remove:v=>classes.delete(v),
      contains:v=>classes.has(v)};
  }
  addEventListener(n,fn){(this.events[n] ||= []).push(fn);}
  fire(n,event={}){for(const fn of this.events[n]||[])fn(event);}
  setAttribute(k,v){this.attrs[k]=v;}
  focus(){this.focused=true;}
  showModal(){this.open=true;}
  close(){this.open=false;this.fire("close");}
  setPointerCapture(){}
}
const nodes={};const $=id=>nodes[id] ||= new Node();
const timers=new Map();let nextTimer=1,wakeAcquired=0,wakeReleased=0;
const document={getElementById:$,hidden:false,events:{},
  addEventListener(type,fn){(this.events[type] ||= []).push(fn);},
  fire(type){for(const fn of this.events[type]||[])fn();}};
const original={
  bookId:"public",title:"การบ้านในยุค AI",coverTitle:"การบ้านยุค AI\nเด็กคิดเองได้",
  coverTop:"LEARNING FIRST",coverColor:"forest",chapter:2,chapterTitle:"แนวคิดจากครู",
  chapterCount:10,playing:true,paused:false,mode:"online",rate:1,note:"กำลังฟังออนไลน์",
  progress:{percent:28,seekable:false,approximate:true,label:"ตอน 3 / 10 · ท่อน 2 / 4",detail:"เสียงไทยออนไลน์ · โดยประมาณ"}
};
const state={...original};
const actions={play:0,previous:0,next:0,speed:[],seek:[]};
const window={WD_AUDIO_READER:{
  getState:()=>({...state}),
  togglePlayback(){actions.play++;state.paused=!state.paused;window.WD_LISTENING_LOCK.sync({...state});},
  previousChapter(){actions.previous++;state.chapter--;state.chapterTitle="ตอนก่อน";window.WD_LISTENING_LOCK.sync({...state});},
  nextChapter(){actions.next++;state.chapter++;state.chapterTitle="ตอนถัดไป";window.WD_LISTENING_LOCK.sync({...state});},
  setPlaybackRate(rate){actions.speed.push(rate);state.rate=rate;window.WD_LISTENING_LOCK.sync({...state});},
  seekTo(time){actions.seek.push(time);state.position=time;state.progress={percent:time/120*100,seekable:true,approximate:false,label:"01:00 / 02:00",detail:"เสียงเต็มเล่ม"};window.WD_LISTENING_LOCK.sync({...state});}
},setTimeout(fn,ms){const id=nextTimer++;timers.set(id,{fn,ms});return id;},
  clearTimeout(id){timers.delete(id);}};
const navigator={wakeLock:{async request(mode){
  assert.equal(mode,"screen");wakeAcquired++;
  return {release(){wakeReleased++;return Promise.resolve()},addEventListener(){}};
}}};
vm.runInNewContext(load("assets/audio-listening-lock.js"),{window,document,navigator},
  {filename:"assets/audio-listening-lock.js"});
async function flush(){for(let i=0;i<4;i++)await Promise.resolve();}
async function run(){
  assert.equal($("wdListeningLock").open,false);
  $("wdAudioLock").fire("click");
  await flush();
  assert.equal($("wdListeningLock").open,true);
  assert.equal(wakeAcquired,1);
  assert.equal($("wdLockTitle").textContent,original.title);
  assert.equal($("wdLockCoverTitle").textContent,original.coverTitle);
  assert.equal($("wdLockCover").dataset.coverColor,"forest");
  assert.equal($("wdLockProgress").value,28);
  assert.equal($("wdLockSeek").hidden,true,"Segment voices must never have fake seek");
  assert.match($("wdLockPositionLabel").textContent,/ท่อน 2 \/ 4/);
  assert.equal($("wdLockPlayIcon").textContent,"⏸");
  assert.equal($("wdLockPrev").disabled,false);
  $("wdLockPlay").fire("click");
  assert.equal(actions.play,1);
  assert.equal($("wdListeningLock").open,true,"Pause must not dismiss listening lock");
  assert.equal($("wdLockBadge").textContent,"พักอยู่");
  assert.equal($("wdLockPlayIcon").textContent,"▶");
  assert.equal(wakeReleased,1,"Pause releases screen wake lock");
  $("wdLockPlay").fire("click");await flush();
  assert.equal(actions.play,2);
  assert.equal($("wdLockBadge").textContent,"กำลังฟัง");
  $("wdLockNext").fire("click");
  assert.equal(actions.next,1);
  assert.match($("wdLockChapter").textContent,/ตอน 4 \/ 10/);
  $("wdLockPrev").fire("click");
  assert.equal(actions.previous,1);
  $("wdLockSpeed").fire("click");
  assert.deepEqual(actions.speed,[1.25]);
  assert.equal($("wdLockSpeed").textContent,"1.25×");
  // Simulate approved single-file audio: only here does scrubbing become available.
  Object.assign(state,{mode:"asset",duration:120,position:60,coverColor:"javascript:bad",
    progress:{percent:50,seekable:true,approximate:false,label:"01:00 / 02:00",detail:"เสียงเต็มเล่ม"}});
  window.WD_LISTENING_LOCK.sync({...state});
  assert.equal($("wdLockCover").dataset.coverColor,"forest","Only known cover palettes allowed");
  assert.equal($("wdLockSeek").hidden,false);
  assert.equal($("wdLockProgress").hidden,true);
  assert.equal($("wdLockSeek").value,"60");
  $("wdLockSeek").fire("change",{target:{value:"90"}});
  assert.deepEqual(actions.seek,[90]);
  // Holding unlock leaves audio playing; exiting is intentionally difficult.
  $("wdLockUnlock").fire("pointerdown",{button:0,pointerId:1});
  const hold=[...timers.values()].find(x=>x.ms===1800);
  assert.ok(hold);
  assert.equal($("wdListeningLock").open,true);
  hold.fn();
  assert.equal($("wdListeningLock").open,false);
  assert.equal(state.playing,true);
  // Keyboard/Escape always available.
  $("wdAudioLock").fire("click");
  $("wdListeningLock").fire("cancel",{preventDefault(){}});
  assert.equal($("wdListeningLock").open,false);
  $("wdAudioLock").fire("click");
  $("wdLockUnlock").fire("keydown",{key:"Enter",preventDefault(){}});
  assert.equal($("wdListeningLock").open,false);
  // Paused/ended playback must not make the locked UI unexpectedly disappear.
  $("wdAudioLock").fire("click");
  state.playing=false;state.paused=false;
  window.WD_LISTENING_LOCK.sync({...state,note:"ฟังจบเล่มแล้ว"});
  assert.equal($("wdListeningLock").open,true);
  assert.equal($("wdLockBadge").textContent,"หยุดเล่น");
  window.WD_LISTENING_LOCK.unlock();
  const html=load("index.html"),css=load("assets/audio-reader.css"),audio=load("assets/audio-reader.js");
  for(const id of ["wdLockCover","wdLockPlay","wdLockPrev","wdLockNext","wdLockProgress",
    "wdLockSeek","wdLockSpeed","wdLockUnlock","wdLockTitle","wdLockMode"]){
    assert.ok(html.includes('id="'+id+'"'),"Missing Now Playing control "+id);
  }
  assert.match(css,/@media\(min-width:720px\)/);
  assert.match(css,/@media\(max-width:719px\)/);
  assert.match(css,/@media\(max-height:520px\)/);
  assert.match(audio,/previousChapter:.*jump\(-1\)/);
  assert.match(audio,/setPlaybackRate:changeSpeed/);
  assert.match(audio,/WD_LISTENING_LOCK\?\.sync\?/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,"No duplicate IDs");
  console.log("PASS: Now Playing book art, controls, progress, true seek, wake lock, unlock, breakpoints");
}
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
module.exports=run;
