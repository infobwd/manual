(() => {
"use strict";
const $=id=>document.getElementById(id);
const clean=window.WD_MARKDOWN_TEXT?.clean;
if(!clean){$("summary").textContent="ไม่พบตัวจัดการ Markdown";return;}
const tests=[
["ตัวเอียง","*เป้าหมายประมาณ 2 นาที*","เป้าหมายประมาณ 2 นาที"],
["ตัวหนา","**ถ้าวันนี้โรงเรียนมี AI**","ถ้าวันนี้โรงเรียนมี AI"],
["หลายบรรทัด","**\nคำถามชวนคิด\n**","\nคำถามชวนคิด\n"],
["บรรทัดดอกจัน","ข้อความ\n**\nต่อไป","ข้อความ\n\nต่อไป"],
["เครื่องหมายคูณ","2 * 3 = 6","2 * 3 = 6"],
["หัวข้อ","### หัวข้อ","หัวข้อ"],
["คำพูดอ้างอิง","> คำพูด","คำพูด"]
];
let pass=0;
for(const [name,input,expected] of tests){
const ok=clean(input)===expected;if(ok)pass++;
const p=document.createElement("p");p.className=ok?"good":"bad";p.textContent=(ok?"✓ ":"✗ ")+name;$("cases").append(p);
}
$("summary").textContent=pass+" / "+tests.length+" กรณีผ่าน";
$("summary").className="status "+(pass===tests.length?"good":"bad");
const book=window.WD_LIBRARY_DATA?.manuals?.find(b=>b.id==="ai-five-questions-speaking-handbook-25691026");
if(book){
book.pages.forEach((page,i)=>{const o=document.createElement("option");o.value=String(i);o.textContent="หน้า "+(i+1)+" — "+page.title;$("chapter").append(o);});
const update=()=>{const page=book.pages[Number($("chapter").value)||0];const raw=[page.title,...(page.paragraphs||[]),...(page.bullets||[]),page.tip].filter(x=>typeof x==="string").join("\n");
$("raw").textContent=raw;$("clean").textContent=window.WD_AUDIO_CORE.narrationText(page);$("sourceInfo").textContent="หน้า "+(Number($("chapter").value)+1)+" / "+book.pages.length;};
$("chapter").value=String(Math.min(6,book.pages.length-1));$("chapter").addEventListener("change",update);update();
}else{$("sourceInfo").textContent="ไม่พบหนังสือเป้าหมายในชุดข้อมูล";}
$("listen").addEventListener("click",()=>{
if(!("speechSynthesis" in window)){$("speechStatus").textContent="อุปกรณ์นี้ไม่รองรับเสียงอ่านในเครื่อง";return;}
speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(clean($("sample").value));u.lang="th-TH";
u.onstart=()=>{$("speechStatus").textContent="กำลังอ่าน…";};
u.onend=()=>{$("speechStatus").textContent="อ่านจบแล้ว";};
u.onerror=()=>{$("speechStatus").textContent="เสียงอ่านไม่พร้อมใช้งานบนอุปกรณ์นี้";};
speechSynthesis.speak(u);
});
$("stop").addEventListener("click",()=>{if("speechSynthesis" in window)speechSynthesis.cancel();$("speechStatus").textContent="หยุดเสียงแล้ว";});
const audio=$("onlineAudio");
const status=$("onlineStatus");
$("onlineListen").addEventListener("click",()=>{
  const source=clean($("sample").value).trim();
  if(!source){status.textContent="กรุณาใส่ข้อความ";return;}
  // Same endpoint and 180-character limit as the production online TTS helper.
  const segments=window.WD_AUDIO_CORE.splitSpeech(source,175);
  const first=segments[0];
  const url=window.WD_AUDIO_CORE.schoolTtsUrl(first);
  if(!url){status.textContent="ข้อความยาวเกินขีดจำกัด";return;}
  if("speechSynthesis" in window)speechSynthesis.cancel();
  audio.pause();audio.removeAttribute("src");audio.load();
  status.textContent="กำลังโหลดเสียงออนไลน์ (ท่อนแรก "+segments.length+" ท่อน)…";
  audio.src=url;
  const promise=audio.play();
  if(promise&&typeof promise.catch==="function")promise.catch(()=>{status.textContent="ไม่สามารถเริ่มเล่นได้ กรุณากด Play ที่เครื่องเล่น หรือตรวจเครือข่าย";});
});
audio.addEventListener("playing",()=>{status.textContent="กำลังเล่นเสียงออนไลน์ของโรงเรียน";});
audio.addEventListener("ended",()=>{status.textContent="เล่นเสียงออนไลน์ท่อนแรกจบแล้ว";});
audio.addEventListener("error",()=>{status.textContent="โหลดเสียงออนไลน์ไม่สำเร็จ (อาจเป็นบริการเสียงหรือการเชื่อมต่อ)";});
$("onlineStop").addEventListener("click",()=>{audio.pause();audio.removeAttribute("src");audio.load();status.textContent="หยุดเสียงออนไลน์แล้ว";});
})();