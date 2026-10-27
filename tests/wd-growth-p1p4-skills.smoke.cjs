/* WD Books: Public PLC skill-guide release checks.
 * node tests/wd-growth-p1p4-skills.smoke.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const window={};
const context=vm.createContext({window});
for(const file of ['assets/manuals-data.js','assets/wd-growth-individual-guide.js','assets/wd-growth-plc-information-guide.js']){
  vm.runInContext(read(file),context,{filename:file,timeout:10000});
}
const manuals=window.WD_LIBRARY_DATA.manuals;
const matches=manuals.filter(x=>x.id==='wd-growth-plc-information-to-action-2569');
assert.equal(matches.length,1,'existing book ID stable');
const book=matches[0];
assert.equal(book.pages.length,28,'16 existing and 12 new skill pages');
const skillPages=book.pages.filter(p=>/^ป\.[1-4] · (ภาษาไทย|คณิตศาสตร์|ภาษาอังกฤษ) — แยกทักษะที่ประเมิน$/.test(p.title));
assert.equal(skillPages.length,12,'exactly 12 skill guide pages');
for(let grade=1;grade<=4;grade++)for(const subject of ['ภาษาไทย','คณิตศาสตร์','ภาษาอังกฤษ']){
  assert.equal(skillPages.filter(p=>p.title===`ป.${grade} · ${subject} — แยกทักษะที่ประเมิน`).length,1);
}
for(const p of skillPages){
  assert.ok(p.kicker&&p.paragraphs.length>=2&&p.bullets.length>=6&&p.tip,'reading fields');
  assert.ok(p.paragraphs.join(' ').includes('ยังไม่แสดงผลคะแนนรายทักษะจริง'),'draft limit');
  assert.ok(p.bullets.some(b=>b.startsWith('กิจกรรมสืบค้น:')),'practical PLC activities');
}
const serialized=JSON.stringify(skillPages);
for(const secret of [
  'student_id','roll_no','teacherId','เลขที่ 1','baseline_A1_draft','private-baseline',
  '96/120','30/120','0/36','21/24','เลขที่นักเรียน 1'
]){
  assert.ok(!serialized.includes(secret),'Restricted detail: '+secret);
}
assert.equal(book.pages.filter(p=>p.title.includes('สารสนเทศคะแนนเฉลี่ย')).length,1,'retain grade summary');
const originalCount=manuals.length;
vm.runInContext(read('assets/wd-growth-plc-information-guide.js'),context,{timeout:10000});
assert.equal(manuals.length,originalCount,'book must not duplicate on repeat load');
assert.ok(read('assets/app-version.js').includes('"1.3.55"'));
assert.ok(read('index.html').includes('เวอร์ชัน 1.3.55'));
assert.ok(read('sw.js').includes('Update 1.3.55:'));
console.log('PASS WD Books P1-P4: 12 grade-by-subject guides, 28 pages, no learner rows, PWA 1.3.55');
