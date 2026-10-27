(()=>{"use strict";
const $=id=>document.getElementById(id), core=window.WD_AUDIO_CORE, clean=window.WD_MARKDOWN_TEXT.clean;
const books=(window.WD_LIBRARY_DATA?.manuals||[]).filter(b=>b.status==="published"&&b.pages?.length);
if(!books.length){$("status").textContent="ไม่พบข้อมูลหนังสือ";return;}
let book=books.find(b=>b.id==="ai-five-questions-speaking-handbook-25691026")||books[0],chapter=0,visible=0,playing=false,paused=false,generation=0,parts=[],partIndex=0;
const audio=$("audio");
books.forEach(b=>{const o=document.createElement("option");o.value=b.id;o.textContent=b.title;$("book").append(o);});
$("book").value=book.id;
function render(){const page=book.pages[visible];$("readerTitle").textContent=book.title+" · หน้า "+(visible+1)+"/"+book.pages.length+" · "+page.title;
$("page").textContent=clean([page.title,...(page.paragraphs||[]),...(page.bullets||[]),page.tip].filter(v=>typeof v==="string").join("\n\n"));
$("miniBook").textContent=book.title;$("miniChapter").textContent="กำลังฟังหน้า "+(chapter+1)+"/"+book.pages.length+" · "+book.pages[chapter].title;
$("mini").hidden=!$("reader").hidden;$("miniPause").textContent=playing&&!paused?"⏸":"▶";}
function stop(){generation++;playing=false;paused=false;partIndex=0;audio.pause();audio.removeAttribute("src");audio.load();if("speechSynthesis" in window)speechSynthesis.cancel();render();}
function nextOnline(token){if(token!==generation||!playing||paused)return;
if(partIndex>=parts.length){if(chapter+1<book.pages.length){chapter++;start();}else{stop();$("status").textContent="จบเล่มแล้ว";}return;}
const url=core.schoolTtsUrl(parts[partIndex++]);if(!url){$("status").textContent="สร้าง URL เสียงไม่สำเร็จ";stop();return;}
audio.src=url;audio.play().catch(e=>{$("status").textContent="เล่นเสียงออนไลน์ไม่ได้: "+(e?.name||"ไม่ทราบสาเหตุ");});render();}
function nextLocal(token){if(token!==generation||!playing||paused)return;
if(partIndex>=parts.length){if(chapter+1<book.pages.length){chapter++;start();}else{stop();$("status").textContent="จบเล่มแล้ว";}return;}
const u=new SpeechSynthesisUtterance(parts[partIndex++]);u.lang="th-TH";u.onend=()=>nextLocal(token);u.onerror=()=>{$("status").textContent="เสียงในเครื่องไม่พร้อม";};speechSynthesis.speak(u);render();}
function start(){stop();playing=true;paused=false;const token=++generation;
parts=core.splitSpeech(core.narrationText(book.pages[chapter]),175);if(!parts.length)parts=[book.pages[chapter].title];partIndex=0;
$("status").textContent="กำลังอ่านหน้า "+(chapter+1)+"/"+book.pages.length;
if($("voice").value==="online")nextOnline(token);else nextLocal(token);render();}
function change(delta){chapter=Math.max(0,Math.min(book.pages.length-1,chapter+delta));start();}
$("book").addEventListener("change",()=>{stop();book=books.find(b=>b.id===$("book").value)||books[0];chapter=0;visible=0;render();});
$("voice").addEventListener("change",()=>{stop();$("status").textContent="เลือกเสียงแล้ว กดเริ่มฟัง";});
$("play").addEventListener("click",start);
function pause(){if(!playing){start();return;}if($("voice").value==="online"){if(paused){audio.play().catch(()=>{});}else audio.pause();}else if("speechSynthesis" in window){if(paused)speechSynthesis.resume();else speechSynthesis.pause();}paused=!paused;render();}
$("pause").addEventListener("click",pause);$("miniPause").addEventListener("click",pause);
$("next").addEventListener("click",()=>change(1));$("previous").addEventListener("click",()=>change(-1));$("miniNext").addEventListener("click",()=>change(1));
$("readerNext").addEventListener("click",()=>{visible=Math.min(book.pages.length-1,visible+1);render();});
$("readerPrev").addEventListener("click",()=>{visible=Math.max(0,visible-1);render();});
$("closeReader").addEventListener("click",()=>{$("reader").hidden=true;render();});
$("openReader").addEventListener("click",()=>{visible=chapter;$("reader").hidden=false;render();$("result").textContent=visible===chapter?"ผ่าน: เปิดหน้าที่กำลังฟัง "+(chapter+1)+"/"+book.pages.length+" โดยไม่สั่งเริ่มเสียงใหม่":"ไม่ผ่าน: หน้าที่เปิดไม่ตรงกับเสียง";$("reader").scrollIntoView({behavior:"smooth",block:"start"});});
audio.addEventListener("ended",()=>{if($("voice").value==="online"&&playing&&!paused)nextOnline(generation);});
audio.addEventListener("error",()=>{if($("voice").value==="online"&&playing)$("status").textContent="โหลดเสียงออนไลน์ไม่สำเร็จ (MediaError "+(audio.error?.code||0)+")";});
render();
})();