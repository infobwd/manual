(() => {
  "use strict";
  const BOOK_ID = "ai-five-questions-speaker-cheatsheet-25691026";
  const el = id => document.getElementById(id);
  const book = (window.WD_LIBRARY_DATA?.manuals || []).find(item => item.id === BOOK_ID && item.status === "published" && Array.isArray(item.pages));
  const stage = el("bookStage"), bookNode = el("book"), measure = el("measure");
  const left = el("leftSlot"), right = el("rightSlot"), turnLayer = el("turnLayer");
  const chapterSelect = el("chapter"), fontSelect = el("fontSize");
  const motionButton = el("motionButton");
  const spread = window.WD_FLIPBOOK_SPREAD_MODEL;
  const reducedSystem = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 1100px)");
  const state = { pages: [], current: 0, chapters: [], busy: false, motionOff: reducedSystem.matches, font: 100 };
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const blank = () => element("div", "paper blank");

  function fail(message) {
    const node = el("error");
    node.hidden = false;
    node.textContent = message;
    document.querySelector(".reading-surface").dataset.error = "true";
    el("progress").textContent = "ไม่สามารถเปิดตัวอย่างได้";
    el("prev").disabled = true;
    el("next").disabled = true;
  }

  function isSingle() { return mobileQuery.matches; }
  function step() { return isSingle() ? 1 : 2; }
  function pageAt(index) { return index != null && state.pages[index] ? state.pages[index].cloneNode(true) : blank(); }
  function createSheet(chapterIndex, withCover) {
    const paper = element("div", "paper" + (withCover ? " cover" : ""));
    paper.dataset.chapter = String(chapterIndex);
    if (withCover) {
      paper.append(
        element("div", "cover-top", "WD BOOKS  /  SCHOOL LEARNING LIBRARY"),
        element("div", "cover-design", "W"),
        (() => { const body = element("div"); body.append(element("div", "cover-title", book.title), element("div", "cover-desc", book.subtitle || "")); return body; })(),
        element("div", "cover-line", "โรงเรียนบ้านวังด้ง  ·  ฉบับเผยแพร่สาธารณะ")
      );
      return paper;
    }
    const header = element("div", "paper-header");
    header.append(element("span", "series", "WD BOOKS"), element("span", "", "FLIPBOOK PILOT"));
    const content = element("div", "page-content");
    const footer = element("div", "paper-footer");
    footer.append(element("span", "", "โรงเรียนบ้านวังด้ง"), element("span", "folio"));
    paper.append(header, content, footer);
    return paper;
  }

  function appendMarkdown(node, value) {
    const chunks = String(value).split(/(\*\*[^*]+\*\*)/g);
    chunks.forEach(chunk => {
      if (chunk.startsWith("**") && chunk.endsWith("**")) node.append(element("strong", "", chunk.slice(2, -2)));
      else node.append(document.createTextNode(chunk));
    });
  }

  function contentBlock(value, kind) {
    const text = String(value || "").replace(/\r\n/g, "\n");
    const p = element(kind === "title" ? "h2" : "p", kind === "title" ? "" : kind);
    if (kind === "title" || kind === "chapter-label") p.textContent = text;
    else appendMarkdown(p, text);
    // Keep line breaks visible for prose without parsing arbitrary markup.
    p.style.whiteSpace = "pre-line";
    return p;
  }

  function contentFits(paper) {
    const area = paper.querySelector(".page-content");
    return area.scrollHeight <= area.clientHeight + 1;
  }

  function splitSegments(text, granular) {
    if (typeof Intl.Segmenter === "function") {
      return [...new Intl.Segmenter("th", { granularity: granular }).segment(text)].map(item => item.segment);
    }
    return granular === "grapheme" ? Array.from(text) : (text.match(/\s+|[^\s]+/g) || []);
  }

  function paginate() {
    // A two-page spread is anchored to the RIGHT page, including the cover.
    const oldSides = spread.slots(state.current, state.pages.length, isSingle());
    const visiblePage = oldSides.left != null && oldSides.left > 0 ? oldSides.left : oldSides.right;
    const oldChapter = Number(state.pages[visiblePage]?.dataset.chapter ?? -1);
    measure.replaceChildren();
    const w = bookNode.getBoundingClientRect().width;
    const h = bookNode.getBoundingClientRect().height;
    if (w < 100 || h < 200) throw new Error("ยังไม่ทราบขนาดพื้นที่หน้ากระดาษ");
    measure.style.width = (w / step()) + "px";
    measure.style.height = h + "px";
    state.pages = [createSheet(-1, true)];
    state.chapters = [];
    let current = null;
    let section = -1;
    function freshPage(chapterIndex) {
      const paper = createSheet(chapterIndex, false);
      measure.replaceChildren(paper);
      state.pages.push(paper);
      current = paper;
      return paper;
    }
    function tryAppend(node) {
      const area = current.querySelector(".page-content");
      area.append(node);
      if (contentFits(current)) return true;
      node.remove();
      return false;
    }
    function appendWhole(text, kind) {
      const node = contentBlock(text, kind);
      if (tryAppend(node)) return;
      freshPage(section);
      if (tryAppend(node)) return;
      // One block may exceed the entire page: split it rather than clipping it.
      let remaining = splitSegments(String(text).replace(/\*\*/g, ""), "word");
      while (remaining.length) {
        let low = 1, high = remaining.length, best = 0;
        while (low <= high) {
          const mid = (low + high) >> 1;
          const candidate = contentBlock(remaining.slice(0, mid).join(""), kind);
          const fits = tryAppend(candidate);
          candidate.remove();
          if (fits) { best = mid; low = mid + 1; } else high = mid - 1;
        }
        if (best === 0) {
          if (current.querySelector(".page-content").children.length) {
            freshPage(section);
            continue;
          }
          // Fallback for a word longer than a page, without losing source text.
          remaining = splitSegments(remaining.join(""), "grapheme");
          const first = contentBlock(remaining[0], kind);
          if (!tryAppend(first)) throw new Error("ข้อความหนึ่งตัวอักษรสูงกว่าหน้ากระดาษ");
          remaining.shift();
        } else {
          const part = remaining.splice(0, best).join("");
          if (!tryAppend(contentBlock(part, kind))) throw new Error("แบ่งข้อความไม่สำเร็จ");
        }
        if (remaining.length) freshPage(section);
      }
    }

    book.pages.forEach((source, index) => {
      section = index;
      freshPage(section);
      state.chapters.push({ label: source.title || "บท " + (index + 1), page: state.pages.length - 1 });
      if (source.kicker) appendWhole(source.kicker, "chapter-label");
      if (source.title) appendWhole(source.title, "title");
      (source.paragraphs || []).forEach(text => appendWhole(text, "paragraph"));
      (source.bullets || []).forEach(text => appendWhole(text, "bullet"));
      if (source.tip) appendWhole(source.tip, "tip");
      // This selected pilot book uses only title/kicker/paragraphs/bullets/tip.
    });

    state.pages.forEach((paper, index) => {
      const folio = paper.querySelector(".folio");
      if (folio) folio.textContent = String(index + 1).padStart(2, "0");
    });
    // Preserve the chapter, not the numeric index, when typography changes page count.
    let target = state.chapters.find(ch => ch.page > 0 && Number(state.pages[ch.page].dataset.chapter) === oldChapter);
    if (oldChapter === -1) target = { page: 0 };
    state.current = target ? target.page : 0;
    state.current = spread.positionForPage(state.current, state.pages.length, isSingle());
    render();
  }

  function render() {
    const count = state.pages.length;
    const position = state.current;
    const sides = spread.slots(position, count, isSingle());
    bookNode.classList.toggle("cover-closed", !isSingle() && sides.closed);
    if (isSingle()) {
      left.replaceChildren();
      right.replaceChildren(pageAt(sides.right));
    } else {
      // No left sheet exists until the front cover is opened.
      if (sides.closed) left.replaceChildren();
      else left.replaceChildren(pageAt(sides.left));
      right.replaceChildren(pageAt(sides.right));
    }
    turnLayer.replaceChildren();
    const indicator = spread.status(position, count, isSingle());
    el("progress").textContent = indicator.label;
    el("progressFill").style.width = (indicator.total ? Math.round(indicator.shown / indicator.total * 100) : 0) + "%";
    el("prev").disabled = state.busy || spread.adjacent(position, -1, count, isSingle()) === null;
    el("next").disabled = state.busy || spread.adjacent(position, 1, count, isSingle()) === null;
    // Select the first actual chapter on the spread (ignore blank inside covers).
    const visiblePage = sides.left != null && sides.left > 0 ? sides.left : sides.right;
    const chapterIndex = Number(state.pages[visiblePage]?.dataset.chapter ?? -1);
    chapterSelect.value = String(chapterIndex);
  }

  function navigate(direction) {
    if (state.busy || !state.pages.length) return;
    const nextIndex = spread.adjacent(state.current, direction, state.pages.length, isSingle());
    if (nextIndex === null) return;
    if (state.motionOff || reducedSystem.matches) {
      state.current = nextIndex;
      render();
      return;
    }
    state.busy = true;
    const from = state.current;
    const single = isSingle();
    const fromSides = spread.slots(from, state.pages.length, single);
    const toSides = spread.slots(nextIndex, state.pages.length, single);
    const front = pageAt(direction > 0 ? fromSides.right : (single ? fromSides.right : fromSides.left));
    const back = pageAt(direction > 0 ? (single ? toSides.right : toSides.left) : toSides.right);
    if (single || direction > 0) {
      right.replaceChildren(pageAt(toSides.right));
    } else {
      left.replaceChildren(pageAt(toSides.left));
    }
    const leaf = element("div", "turn-sheet " + (direction > 0 ? "next" : "prev"));
    const faceFront = element("div", "face front"), faceBack = element("div", "face back");
    faceFront.append(front); faceBack.append(back);
    leaf.append(faceFront, faceBack);
    turnLayer.replaceChildren(leaf);
    el("prev").disabled = true; el("next").disabled = true;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      state.current = nextIndex;
      state.busy = false;
      render();
    };
    leaf.addEventListener("transitionend", event => {
      if (event.target === leaf && event.propertyName === "transform") finish();
    });
    requestAnimationFrame(() => requestAnimationFrame(() => leaf.classList.add("active")));
    window.setTimeout(finish, 920);
  }

  function init() {
    if (!book || !book.pages.length) {
      fail("ไม่พบหนังสือสาธารณะสำหรับทดลอง กรุณาตรวจสอบแค็ตตาล็อก WD Books");
      return;
    }
    el("bookTitle").textContent = book.title;
    motionButton.setAttribute("aria-pressed", String(state.motionOff));
    chapterSelect.append(element("option", "", "หน้าปก"));
    chapterSelect.lastElementChild.value = "-1";
    book.pages.forEach((item, index) => {
      const option = element("option", "", (index + 1) + ". " + (item.title || "บทที่ " + (index + 1)));
      option.value = String(index);
      chapterSelect.append(option);
    });
    paginate();
    el("prev").addEventListener("click", () => navigate(-1));
    el("next").addEventListener("click", () => navigate(1));
    chapterSelect.addEventListener("change", () => {
      const selected = Number(chapterSelect.value);
      const chapter = state.chapters[selected];
      state.current = selected < 0 ? 0 : (chapter?.page || 0);
      state.current = spread.positionForPage(state.current, state.pages.length, isSingle());
      render();
      stage.focus({ preventScroll: true });
    });
    fontSelect.addEventListener("change", () => {
      state.font = Number(fontSelect.value);
      document.documentElement.style.setProperty("--font-scale", String(state.font / 100));
      paginate();
    });
    motionButton.addEventListener("click", () => {
      state.motionOff = !state.motionOff;
      motionButton.setAttribute("aria-pressed", String(state.motionOff));
    });
    stage.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); navigate(1); }
    });
    let pointer = null;
    stage.addEventListener("pointerdown", event => {
      if (state.busy || event.target.closest("button,select,a")) return;
      pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
    });
    stage.addEventListener("pointerup", event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      pointer = null;
      if (Math.abs(dx) >= 42 && Math.abs(dx) > Math.abs(dy) * 1.3) navigate(dx < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", () => { pointer = null; });
    let resized;
    window.addEventListener("resize", () => {
      window.clearTimeout(resized);
      resized = window.setTimeout(() => { if (!state.busy) paginate(); }, 180);
    });
    if (typeof reducedSystem.addEventListener === "function") {
      reducedSystem.addEventListener("change", event => {
        if (event.matches) {
          state.motionOff = true;
          motionButton.setAttribute("aria-pressed", "true");
        }
      });
    }
  }
  try { init(); } catch (error) { console.error("Flipbook Pilot:", error); fail("เกิดข้อผิดพลาดระหว่างจัดหน้า โปรดลองรีเฟรชหรือลดขนาดตัวอักษร"); }
})();