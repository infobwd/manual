// UI-MIG-02R4: opt-in, local-only real-device evidence panel (?qa=1).
// All answers remain in React memory. Export is a user gesture, never an upload.
import React, { useEffect, useRef, useState } from "react";

type Verdict = "PASS" | "FAIL" | "NOT_TESTED" | "NOT_APPLICABLE";
type Measurement = {
  label: string; utc: string; viewportWidth: number; clientWidth: number;
  scrollWidth: number; bodyScrollWidth: number; visualWidth: number | null;
  visualHeight: number | null; innerHeight: number; dpr: number;
  screenWidth: number; screenHeight: number; safeBottomPx: number;
  orientation: string; focusTag: string | null; navItems: number;
  navMinHeight: number | null; horizontalOverflow: boolean;
};
const CHECKS = [
  { id:"home", label:"หน้า Home ไม่มีข้อความ/การ์ดถูกตัด และเลื่อนอ่านได้"},
  { id:"books", label:"Bookshelf เลือกหมวดแล้วเห็นรายการและไม่เลื่อนหลงตำแหน่ง"},
  { id:"settings", label:"หน้า Settings เปิดและปรับขนาดอักษรได้"},
  { id:"thai", label:"พิมพ์ภาษาไทยและกดค้นหาจาก Home ได้"},
  { id:"keyboard", label:"เปิดแป้นพิมพ์แล้วช่องค้นหา/ปุ่มยังใช้งานได้"},
  { id:"favorite", label:"ตัวกรองรายการโปรดและการล้างคำค้นทำงาน"},
  { id:"theme", label:"Light, Sepia และ Night เปลี่ยนได้/ข้อความอ่านง่าย"},
  { id:"nav", label:"Bottom Nav ทั้ง 3 ปุ่มเห็นครบ กดด้วยนิ้วได้"},
  { id:"safearea", label:"เมนูและเนื้อหาล่างไม่ทับ Home Indicator"},
  { id:"rotate", label:"แนวตั้ง/แนวนอนไม่ล้น ไม่หลุด ไม่เสียสถานะ"},
  { id:"zoom", label:"ตัวอักษรขยาย/การเข้าถึงด้วย VoiceOver ไม่ถูกตัด"},
  { id:"split", label:"iPad Split View / Stage Manager (ถ้าใช้) ไม่ล้น"}
] as const;
function measure(label:string):Measurement {
  const doc=document.documentElement,body=document.body;
  const visual=window.visualViewport;
  const probe=document.querySelector(".qa-safe-probe");
  const safe=probe ? parseFloat(getComputedStyle(probe).paddingBottom)||0 : 0;
  const nav=[...document.querySelectorAll<HTMLElement>(".bottom-nav button")];
  return {
    label,utc:new Date().toISOString(),
    viewportWidth:window.innerWidth,clientWidth:doc.clientWidth,
    scrollWidth:doc.scrollWidth,bodyScrollWidth:body.scrollWidth,
    visualWidth:visual?.width??null,visualHeight:visual?.height??null,
    innerHeight:window.innerHeight,dpr:window.devicePixelRatio,
    screenWidth:window.screen.width,screenHeight:window.screen.height,
    safeBottomPx:safe,
    orientation:window.innerWidth>window.innerHeight?"landscape":"portrait",
    focusTag:document.activeElement?.tagName??null,
    navItems:nav.length,
    navMinHeight:nav.length?Math.min(...nav.map(el=>el.getBoundingClientRect().height)):null,
    horizontalOverflow:doc.scrollWidth>doc.clientWidth+1||body.scrollWidth>doc.clientWidth+1
  };
}
export function DeviceQA(){
  const enabled=new URLSearchParams(window.location.search).get("qa")==="1";
  const [open,setOpen]=useState(false);
  const [answers,setAnswers]=useState<Record<string,Verdict>>({});
  const [shots,setShots]=useState<Measurement[]>([]);
  const [inputFocusCount,setInputFocusCount]=useState(0);
  const minVisualHeight=useRef<number|null>(null);
  useEffect(()=>{
    if(!enabled)return;
    const resize=()=>{
      const h=window.visualViewport?.height;
      if(h!=null)minVisualHeight.current=Math.min(minVisualHeight.current??h,h);
    };
    const focus=(event:FocusEvent)=>{
      if(event.target instanceof HTMLInputElement)setInputFocusCount(v=>v+1);
    };
    resize();window.visualViewport?.addEventListener("resize",resize);
    window.addEventListener("focusin",focus);
    return ()=>{
      window.visualViewport?.removeEventListener("resize",resize);
      window.removeEventListener("focusin",focus);
    };
  },[enabled]);
  if(!enabled)return null;
  function take(label:string){setShots(prev=>[...prev,measure(label)]);}
  function exportJson(){
    const statuses=CHECKS.map(item=>({id:item.id,label:item.label,status:answers[item.id]??"NOT_TESTED"}));
    const complete=statuses.every(item=>item.status!=="NOT_TESTED");
    const data={
      gate:"UI_MIG02R4_SELF_REPORTED_REAL_DEVICE_QA",
      assessment:complete?"SELF_REPORTED_COMPLETE_REVIEW_REQUIRED":"INCOMPLETE_NOT_TESTED",
      collectedAt:new Date().toISOString(),
      preview_only:true,upload_performed:false,
      device: {
        userAgent:navigator.userAgent,
        touchPoints:navigator.maxTouchPoints,
        inputFocusCount,
        minVisualViewportHeight:minVisualHeight.current
      },
      checks:statuses, measurements:[...shots,measure("export")],
      note:"N/A applies only to unsupported device-specific checks. Manual answers are not independent device acceptance. No personal data or text input values are collected. Review screenshot and QA evidence before signing."
    };
    const bytes=new Blob([JSON.stringify(data,null,2)+"\n"],{type:"application/json"});
    const url=URL.createObjectURL(bytes);
    const link=document.createElement("a");link.href=url;
    link.download="wd-books-r4-device-qa.json";
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  const done=CHECKS.filter(x=>(answers[x.id]??"NOT_TESTED")!=="NOT_TESTED").length;
  return <>
    <span className="qa-safe-probe" aria-hidden="true" />
    <button type="button" className="qa-launch" aria-expanded={open}
      onClick={()=>setOpen(v=>!v)}>QA อุปกรณ์</button>
    {open&&<div className="qa-screen" role="presentation">
      <section className="qa-panel" role="dialog" aria-modal="true"
        aria-label="แบบตรวจรับอุปกรณ์จริง">
        <header className="qa-header">
          <strong>WD Books — Device QA</strong>
          <button type="button" onClick={()=>setOpen(false)} aria-label="ปิดแบบตรวจ">ปิด ×</button>
        </header>
        <p className="qa-help">ทดสอบจริงบน Safari/iPhone/iPad แล้วเลือกผลด้วยตนเอง ทุกข้อเริ่มที่ NOT TESTED ไม่ส่งข้อมูลออกจากเครื่อง</p>
        <p className="qa-help">ตรวจแล้ว {done}/{CHECKS.length} ข้อ — ปิดแผงนี้ก่อนลองกดเมนู ค้นหา และหมุนจอ</p>
        <div className="qa-actions">
          <button type="button" onClick={()=>take("manual_portrait")}>บันทึกขนาดจอปัจจุบัน</button>
          <button type="button" onClick={()=>take("after_rotation_or_keyboard")}>บันทึกหลังหมุนจอ/แป้นพิมพ์</button>
        </div>
        <output className="qa-readout">
          ภาพวัด {shots.length} ครั้ง · ช่องค้นหาได้รับโฟกัส {inputFocusCount} ครั้ง
        </output>
        <div className="qa-checks">
          {CHECKS.map(item=><label key={item.id} className="qa-check">
            <span>{item.label}</span>
            <select value={answers[item.id]??"NOT_TESTED"}
              onChange={e=>setAnswers(prev=>({...prev,[item.id]:e.target.value as Verdict}))}>
              <option value="NOT_TESTED">ยังไม่ทดสอบ</option>
              <option value="PASS">PASS — ผ่านจริง</option>
              <option value="FAIL">FAIL — พบปัญหา</option>
              <option value="NOT_APPLICABLE">N/A — ไม่เกี่ยวกับอุปกรณ์นี้</option>
            </select>
          </label>)}
        </div>
        <p className="qa-help">ไฟล์ JSON มีเพียงผลที่เลือก ขนาดหน้าจอ และข้อมูลเบราว์เซอร์ ไม่บันทึกสิ่งที่พิมพ์หรือบัญชีผู้ใช้</p>
        <button type="button" className="qa-export" onClick={exportJson}>
          บันทึกผลเป็น JSON ในเครื่อง
        </button>
        <button type="button" className="qa-close" onClick={()=>setOpen(false)}>
          กลับไปทดสอบหน้าหนังสือ
        </button>
      </section>
    </div>}
  </>;
}
