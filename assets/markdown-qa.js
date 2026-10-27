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
})();