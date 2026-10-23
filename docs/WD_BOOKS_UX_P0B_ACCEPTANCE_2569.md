# WD Books — UX-P0B Mobile Table of Contents / Acceptance ปี 2569

**ฐาน:** [Reader UX Roadmap](WD_BOOKS_READER_UX_ROADMAP_2569.md) · ต่อจาก UX-P0A ใน PR #8
**วันที่:** 23 ต.ค. 2569
**ขอบเขต:** สารบัญหนังสือในตัวอ่านจอมือถือ (<=850 CSS px) โดยไม่เปลี่ยน source หนังสือ, storage หรือระบบหน้าคู่เดิม

## สิ่งที่เพิ่ม

- ปุ่ม **สารบัญ** ในแถบหัวของ Reader บนมือถือ (ซ่อนเมื่อจอกว้าง >850px); มี `aria-controls`, `aria-expanded`, accessible name
- Bottom Sheet ภายใน Reader dialog ไม่เปิด modal แยกจากตัวอ่าน; รายการหน้าตามข้อมูลหนังสือเผยแพร่เท่านั้น แสดงเลขหน้า ชื่อเรื่อง และสถานะ `aria-current`
- แตะหัวข้อแล้วข้ามไปหน้า/บทที่ถูกต้อง บันทึกตำแหน่งล่าสุดด้วย `WD_EXPERIENCE.recordProgress` เดิม
- เปิดสารบัญแล้วทำให้ส่วน Reader พื้นหลัง `inert` ชั่วคราว; ปิดด้วย ✕, ฉากหลัง, Escape/Back (cancel), หรือเปลี่ยนขนาดจอ; คืน focus ไปปุ่มเดิม
- จำกัด Tab ให้อยู่ในแผงสารบัญเมื่อเปิด ป้องกันการใช้ Arrow เปลี่ยนหน้าหนังสือหลังแผง; ยังคงปุ่มหน้าก่อน/ถัดไปบน Reader
- CSS แยก `assets/toc-p0b.css` พร้อม Light/Sepia/Night, safe-area iPhone, scroll ในรายการบท และ reduced-motion
- PWA เพิ่ม CSS ใหม่ใน offline shell และ version cache v7

## ทดสอบ

| ID | เกณฑ์ผ่าน | สถานะเบื้องต้น |
|---|---|---|
| T01 | เปิดคู่มือพร้อมอ่าน 8 และ 15 หน้า → แสดงสารบัญครบ | PASS (จำลอง) |
| T02 | เปิดสารบัญ เลือกหน้า 5 → Reader เปลี่ยนหน้าถูกต้องและจดจำ progress | PASS (จำลอง) |
| T03 | เมนูแสดงบทกำลังอ่านด้วย `aria-current=page` | PASS (จำลอง) |
| T04 | Tab/Shift+Tab, Escape, cancel/backdrop และคืน focus | PASS (จำลอง) |
| T05 | ปิดหนังสือและขยายเป็น desktop → sheet ไม่ค้าง | PASS (จำลอง) |
| T06 | ปัดในรายการสารบัญได้ ไม่ชน Pull-to-Refresh หรือ browser Back | รอตรวจบน iPhone/Android จริง |
| T07 | iPad Portrait/landscape, Safe Area, zoom 200%, VoiceOver/TalkBack | รอตรวจอุปกรณ์จริง |
| T08 | Light/Sepia/Night และ localStorage ของผู้ใช้คงเดิม | ต้องตรวจอุปกรณ์จริง |
| T09 | Offline/PWA upgrade จาก v6→v7 และเปิดคู่มือยังได้ | รอตรวจบน HTTPS จริง |

### Smoke tests (Local-First)

```powershell
node tests/library.smoke.cjs
node tests/pwa-reader.smoke.cjs
node tests/home-p0a.smoke.cjs
node tests/mobile-toc-p0b.smoke.cjs
```

การทดสอบขั้นต้นประมวลผล JavaScript จาก branch ด้วย DOM simulation ไม่ใช่ผล Browser/Safari จริง. ทดสอบเครื่องจริงหลัง Merge บน GitHub Pages HTTPS และบันทึก FAIL/PASS เพิ่มเติม

## Release Gate และ Rollback

- ไม่ลบหรือย้ายข้อมูลส่วนบุคคล / ไม่มีการเพิ่ม endpoint, บัญชี, analytics หรือ token; Public repo เก็บเฉพาะคู่มือสาธารณะ
- หากพบ focus trap ติดขัดบน Safari/VoiceOver ให้แก้ PR hotfix ได้โดยไม่เปลี่ยนเนื้อหาหรือ storage; คงปุ่มเปลี่ยนหน้าสำรองเสมอ
- หาก cache ค้าง ให้ตรวจว่า `sw.js` v7 ถูกติดตั้งก่อน; ห้ามแนะนำให้ผู้ใช้ล้าง localStorage เพื่อแก้การ Deploy
- หลัง UX-P0B ผ่าน ให้เริ่ม UX-P0C Swipe/Reading Focus ใน PR แยก ไม่รวมการย้ายตำแหน่ง progress หรือแก้ schema

## Checklist ตรวจบน iPhone/iPad หลังเผยแพร่

- [ ] เปิด https://infobwd.github.io/manual/ และเปิดหนังสือที่พร้อมอ่าน
- [ ] เห็นปุ่ม **สารบัญ** บน Reader; กดแล้วได้แผงล่างและรายการครบ
- [ ] เลือกหัวข้อกลางเล่ม แล้วปิด/เปิดหนังสืออีกครั้ง: กลับมาหน้าเดิม
- [ ] แตะ ✕ / พื้นหลัง, ลอง Back/Escape บนเครื่องที่รองรับ
- [ ] เปลี่ยนโหมดถนอมสายตา/กลางคืน และปรับขนาดอักษร
- [ ] หมุนจอและตรวจไม่ให้แผงค้างหรือปุ่มบังเนื้อหา
- [ ] ทดลอง Offline หลังเปิดออนไลน์ครั้งแรก
