// Run: node tests/manuals-data-syntax.smoke.cjs
// No network, user data, or browser required.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/manuals-data.js"), "utf8");
const context = vm.createContext({ window: {} });
new vm.Script(source, { filename: "assets/manuals-data.js" }).runInContext(context);
const data = context.window.WD_LIBRARY_DATA;
assert.ok(data && Array.isArray(data.categories) && Array.isArray(data.manuals), "Catalog must initialize");
assert.ok(data.manuals.length > 0, "Catalog must contain books");
const ids = data.manuals.map(book => book.id);
assert.equal(new Set(ids).size, ids.length, "Book IDs must be unique");
for (const book of data.manuals) {
  assert.ok(book.id && book.title && book.category, "Every book needs metadata");
  assert.ok(Array.isArray(book.pages), "Every book must have pages array");
}
const ai = data.manuals.find(book => book.id === "ai-school-today-teacher-guide");
assert.ok(ai && ai.status === "published", "AI & School Today must be published");
assert.equal(ai.pages.length, 13, "AI & School Today must have 13 pages");
for (const book of data.manuals.filter(b => b.status === "published")) {
  assert.ok(book.pages.length > 0, "Published book needs readable pages");
  for (const page of book.pages) {
    assert.ok(typeof page.title === "string" && page.title.trim(), "Book page needs title");
    assert.ok(Array.isArray(page.paragraphs) && page.paragraphs.every(v => typeof v === "string" && v.trim()), "Book page paragraphs must be nonempty text");
  }
}
const thinking = data.manuals.find(book => book.id === "ai-thinking-partner-visible-learning-primary");
assert.ok(thinking && thinking.category === "academic" && thinking.status === "published", "Thinking partner book must be published");
assert.equal(thinking.pages.length, 20, "Thinking partner book must have 20 readable chapters");
const thinkingBody = thinking.pages.map(page => [page.title, ...page.paragraphs, ...(page.bullets || []), page.tip || ""].join(" ")).join(" ");
assert.ok(thinkingBody.includes("ป.2") && thinkingBody.includes("245 + 178") && thinkingBody.includes("326 + 195"), "P2 math examples must be present");
assert.ok(thinkingBody.includes("100,000") && thinkingBody.includes("สสวท."), "P3 scope and curriculum references must be present");
assert.ok(thinkingBody.includes("คิดเอง") && thinkingBody.includes("ยืนยัน"), "Three-stage approach must be visible");
assert.ok(thinkingBody.includes("เอกสารอ้างอิง"), "Thinking partner book must include sources");
const essay = data.manuals.find(book => book.id === "homework-in-ai-age-primary-leadership");
assert.ok(essay && essay.category === "academic" && essay.status === "published", "Homework and AI essay must be published in academic category");
assert.ok(essay.pages.length >= 20, "Essay must be a substantial reading edition");
assert.ok(essay.pages.some(page => page.title.includes("สัปดาห์")), "Essay must include proposed school trial");
assert.ok(essay.pages.some(page => page.title.includes("เอกสารอ้างอิง")), "Essay must cite sources");
assert.equal(essay.pages.length, 25, "Homework AI book retains 25 readable chapters");
assert.equal(essay.edition, "Public Discussion 0.2", "Updated book edition must be 0.2");
const homeLearn = essay.pages[14].paragraphs.join(" ");
assert.ok(homeLearn.includes("ป.2") && homeLearn.includes("245") && homeLearn.includes("178") && homeLearn.includes("326") && homeLearn.includes("195"), "Home-school confirmation chapter must use P2 mathematics");
assert.ok(!homeLearn.includes("ตัวอย่าง ป.3 คณิตศาสตร์ ให้เด็กลองทำ 524"), "Old misleading P3 three-digit example must be replaced");
assert.ok(essay.pages[13].paragraphs.join(" ").includes("ป.2 คณิตศาสตร์"), "P2 example must appear in before-after chapter");
assert.ok(essay.pages[23].paragraphs.join(" ").includes("AI เป็นผู้ช่วยคิด"), "Books must cross-reference the companion guide");
assert.ok(essay.pages[24].paragraphs.join(" ").includes("proj14.ipst.ac.th/p2/"), "Updated book must cite IPST P2");
assert.ok(essay.pages[24].paragraphs.join(" ").includes("proj14.ipst.ac.th/p3/"), "Updated book must cite IPST P3");
assert.ok(essay.pages[17].paragraphs.join(" ").includes("ปฐมวัย"), "Age-appropriate AI guidance must remain");

// Cover title fields must contain real line breaks, not literal backslash+n text.
for (const book of data.manuals) {
  if (typeof book.coverTitle !== "string") continue;
  assert.ok(!book.coverTitle.includes("\\n"), "Literal backslash-n in cover title: " + book.id);
}
for (const [id, expected] of [
  ["ai-school-today-teacher-guide", "AI & School\nToday"],
  ["principal-expert-m1-evidence-review", "M1\nตรวจหลักฐาน"],
  ["principal-expert-m0-review", "วิทยฐานะ\nเชี่ยวชาญ"],
  ["sar-2568-basic-education", "SAR 2568\nสารสนเทศสถานศึกษา"]
]) {
  const book = data.manuals.find(item => item.id === id);
  assert.ok(book, "Expected book is missing: " + id);
  assert.equal(book.coverTitle, expected, "Cover should break into two lines: " + id);
}

// AI Q4 critical inquiry book: check shelf, math, references, privacy, status.
const inquiry = data.manuals.find(book => book.id === "ai-q4-children-ask-verify-think");
assert.ok(inquiry && inquiry.status === "published" && inquiry.category === "academic", "AI Q4 must be visible in academic shelf");
assert.equal(inquiry.pages.length, 22, "AI Q4 must have 22 complete chapters");
const inquiryText = inquiry.pages.map(page => [page.title, ...page.paragraphs, ...(page.bullets || []), page.tip || ""].join(" ")).join(" ");
assert.ok(inquiryText.includes("478 + 156") && inquiryText.includes("634") && inquiryText.includes("ป.2"), "AI Q4 P2 math case must be correct");
for(const word of ["คิดก่อน", "ถามเป็น", "ตรวจสอบ", "ตัดสินใจ", "อธิบายได้", "UNESCO", "OECD", "UNICEF", "doi.org"]) {
  assert.ok(inquiryText.includes(word), "AI Q4 required topic missing: " + word);
}
assert.ok(inquiryText.includes("ข้อมูลส่วนบุคคล") && inquiryText.includes("สถานการณ์สมมติ"), "AI Q4 privacy and fictional case caveats must be present");
assert.equal(inquiry.edition, "Public Discussion 0.1", "AI Q4 must remain a discussion edition");

console.log("PASS: manuals-data.js syntax and catalog structure");
