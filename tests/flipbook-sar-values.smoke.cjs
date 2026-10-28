// FLIP-14 SAR golden-value protection: compare exact public chart rows and insight headings.
// Run locally: node tests/flipbook-sar-values.smoke.cjs
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const scope = { window: {} };
vm.runInNewContext(read("assets/manuals-data.js"), scope, { timeout: 3000 });
const lookup = id => {
  const book = scope.window.WD_LIBRARY_DATA.manuals.find(book => book.id === id);
  assert(book && book.status === "published", "missing published SAR book: " + id);
  return book;
};
const expected = {
  "sar-2568-basic-education": {
    charts: [{
      title: "เป้าหมายเทียบกับผลประเมิน (ร้อยละ)",
      rows: [
        ["มาตรฐานที่ 1 คุณภาพของผู้เรียน",83,93.63],
        ["มาตรฐานที่ 2 การบริหารและจัดการ",81,96],
        ["มาตรฐานที่ 3 การจัดการเรียนการสอน",81,92.8],
      ],
    }],
    headlines: ["ผลการประเมินสูงกว่าเป้าหมายทั้ง 3 มาตรฐาน"],
  },
  "sar-info02-national-assessments-2568": {
    charts: [
      { title:"RT ป.1 คะแนนเฉลี่ยร้อยละ", rows:[
        ["อ่านออกเสียง",93.16,78.71],["อ่านรู้เรื่อง",81.5,76],["รวมสองด้าน",87.33,77.35],
      ]},
      { title:"NT ป.3 คะแนนเฉลี่ยร้อยละ", rows:[
        ["ภาษาไทย",57.54,53.04],["คณิตศาสตร์",52.41,42.81],["รวมสองด้าน",54.97,47.93],
      ]},
      { title:"O-NET ป.6 คะแนนเฉลี่ยร้อยละ", rows:[
        ["ภาษาไทย",49.84,41.7],["คณิตศาสตร์",26.23,15.25],
        ["วิทยาศาสตร์",38.91,31.83],["ภาษาอังกฤษ",25.78,24.38],
      ]},
    ],
    headlines:[
      "RT รวมสองด้านลดลง 9.98 คะแนน",
      "NT รวมสองด้านลดลง 7.04 คะแนน",
      "NT โรงเรียนต่ำกว่าค่าเฉลี่ยเขตและประเทศทั้งสองด้าน",
      "O-NET ลดลงทั้งสี่วิชา",
    ],
  },
};
let charts = 0, rows = 0, insights = 0;
for (const [id, golden] of Object.entries(expected)) {
  const book = lookup(id);
  const realCharts = book.pages.filter(page => page.chart).map(page => ({
    title: page.chart.title,
    rows: page.chart.rows.map(row => [row.label, row.target, row.result]),
  }));
  const realHeadlines = book.pages.filter(page => page.insight).map(page => page.insight.headline);
  assert.deepEqual(realCharts, golden.charts, id + " chart values/title changed");
  assert.deepEqual(realHeadlines, golden.headlines, id + " insight headlines changed");
  charts += realCharts.length;
  rows += realCharts.reduce((sum, chart) => sum + chart.rows.length, 0);
  insights += realHeadlines.length;
}
assert.equal(charts, 4);
assert.equal(rows, 13);
assert.equal(insights, 5);
const flip = read("experiments/flipbook-pilot/corner.js");
assert(flip.includes('if (source.chart) appendChart(source.chart)'));
assert(flip.includes('if (source.insight) appendInsight(source.insight)'));
assert(flip.includes('line.append(track, element("strong", "flip-sar-value", value + "%"))'));
console.log("FLIP-14 golden PASS: 4 chart groups / 13 exact metric rows / 5 insight headings preserved.");
