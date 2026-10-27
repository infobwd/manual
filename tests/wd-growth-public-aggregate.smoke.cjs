/* Safety gate: WD Books may display only authorized provisional grade averages.
 * Run: node tests/wd-growth-public-aggregate.smoke.cjs
 * Never add individual scores or identifiers to this public repository. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(base,f),'utf8');
const win = {};
vm.runInNewContext(read('assets/manuals-data.js') + '\n' +
  read('assets/wd-growth-individual-guide.js') + '\n' +
  read('assets/wd-growth-plc-information-guide.js'), {window:win});
const book = win.WD_LIBRARY_DATA.manuals.find(b=>b.id==='wd-growth-plc-information-to-action-2569');
assert.ok(book,'PLC book exists');
assert.equal(book.pages.length,16,'add exactly one public aggregate page');
const matches=book.pages.filter(p=>p.title.includes('สารสนเทศคะแนนเฉลี่ย'));
assert.equal(matches.length,1);
const page=matches[0], summary=[...page.paragraphs,...page.bullets,page.tip].join(' ');
assert.ok(summary.includes('ยังไม่ผ่านครูตรวจรับ') && summary.includes('ไม่ใช่ผลทางการ'));
const gradeMeans=[
 ['ป.1','8.22','7.78','8.00'],['ป.2','9.25','5.67','6.00'],
 ['ป.3','9.00','7.82','7.11'],['ป.4','8.00','7.00','2.50']
];
for(const [grade,...means] of gradeMeans) {
 const row=page.bullets.find(x=>x.startsWith(grade+' —'));
 assert.ok(row,'expected grade row: '+grade);
 for(const mean of means) assert.ok(row.includes(mean),grade+' missing subject aggregate '+mean);
}
assert.ok(!/เลขที่\s*\d+|student_id|roll_no|national_id|birth_date|teacherId/.test(summary),
  'public summary must not include learner row IDs');
const src=read('assets/wd-growth-plc-information-guide.js');
assert.ok(!/baseline_A1_draft\.json|private-baseline\/2569|wd_growth_paper_review_rows/.test(src),
  'no restricted private data source in public book');
assert.ok(read('assets/app-version.js').includes('"1.3.54"'));
assert.ok(read('index.html').includes('เวอร์ชัน 1.3.54'));
assert.ok(read('sw.js').includes('1.3.54'));
console.log('PASS WD Books 1.3.54: authorized provisional grade-only aggregates; no learner rows');
