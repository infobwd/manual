// Pure UI-MIG-02R3 layout acceptance rules. No browser, files or production state.
"use strict";
function checkScene(scene,m) {
  const problems=[];
  if (m.innerWidth!==scene.width || Math.abs(m.clientWidth-scene.width)>1)
    problems.push("CSS_VIEWPORT_MISMATCH");
  if (m.scrollWidth>m.clientWidth+1 || m.bodyScrollWidth>m.clientWidth+1)
    problems.push("HORIZONTAL_OVERFLOW");
  if (m.visualViewportWidth===null || Math.abs(m.visualViewportWidth-scene.width)>1)
    problems.push("VISUAL_VIEWPORT_MISMATCH");
  if (m.devicePixelRatio!==1) problems.push("DPR_MISMATCH");
  for (const name of ["root","shell","header","brand","main","grid","firstCard","bottomNav"]) {
    const r=m.rects[name];
    if (r && (r.left < -1 || r.right>scene.width+1)) problems.push(name.toUpperCase()+"_CLIPPED");
  }
  const navLabels=["หน้าหลัก","ชั้นหนังสือ","ตั้งค่า"];
  if (m.nav.length!==3 || m.nav.some((n,i)=>n.label!==navLabels[i]))
    problems.push("BOTTOM_NAV_ITEMS_MISSING");
  if (m.nav.some(n => n.left < -1 || n.right > scene.width+1 ||
    n.top < -1 || n.bottom > scene.height+1 || n.height<44))
    problems.push("BOTTOM_NAV_NOT_TOUCH_VISIBLE");
  if (scene.width<768 && m.debugLabelVisible) problems.push("DEBUG_LABEL_NOT_HIDDEN");
  if (m.theme!==scene.theme) problems.push("THEME_MISMATCH");
  if (scene.view==="books") {
    if (!m.rects.layout || !m.rects.sidebar || !m.rects.search)
      problems.push("BOOKSHELF_NOT_RENDERED");
    if (scene.category && m.visibleCards!==1) problems.push("CATEGORY_FILTER_NOT_APPLIED");
    if (scene.width>=1000 && m.rects.sidebar && m.rects.search &&
      m.rects.sidebar.right>m.rects.search.left+1) problems.push("DESKTOP_CATEGORY_RAIL");
  }
  return problems;
}

module.exports = { checkScene };
