(() => {
  "use strict";
  const data = window.WD_LIBRARY_DATA;
  if (!data || !Array.isArray(data.manuals) || !Array.isArray(data.categories)) return;

  const $ = (id) => document.getElementById(id);
  const create = (tag, css, value) => {
    const el = document.createElement(tag);
    if (css) el.className = css;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const state = { category: "all", availability: "all", sort: "default", query: "", manual: null, page: 0, scale: 1, opener: null, readingMode: "paged" };
  // Reader single-page threshold includes portrait tablets and narrow Split View.
  const isMobile = window.matchMedia("(max-width: 1100px)");
  const statuses = { published: "พร้อมอ่าน", review: "รอตรวจรับ", planned: "ตามแผน" };
  const lookup = Object.fromEntries(data.categories.map((c) => [c.id, c]));
  const normalized = (s) => String(s || "").toLocaleLowerCase("th-TH").trim();

  function totalFor(id) {
    return data.manuals.filter((book) => id === "all" || book.category === id).length;
  }
  function selectCategory(id) {
    state.category = id;
    renderCategories();
    renderCatalog();
  }
  function categoryButton(cat, kind) {
    const label = cat.id === "all" ? "ทั้งหมด" : cat.label;
    const button = create("button", "", "");
    button.type = "button";
    button.setAttribute("aria-pressed", String(cat.id === state.category));
    button.classList.toggle(kind === "chips" ? "selected" : "active", cat.id === state.category);
    if (kind === "nav") {
      button.append(create("span", "category-icon", cat.icon));
      button.append(create("span", "", label));
      button.append(create("span", "category-count", String(totalFor(cat.id))));
    } else {
      button.textContent = label;
    }
    button.addEventListener("click", () => selectCategory(cat.id));
    return button;
  }
  function renderCategories() {
    const cats = [{ id: "all", label: "ทั้งหมด", icon: "▦" }, ...data.categories];
    $("categoryNav").replaceChildren(...cats.map((cat) => categoryButton(cat, "nav")));
    $("categoryChips").replaceChildren(...cats.map((cat) => categoryButton(cat, "chips")));
  }
  function renderStats() {
    $("statPublished").textContent = String(data.manuals.filter((b) => b.status === "published").length);
    $("statPending").textContent = String(data.manuals.filter((b) => b.status !== "published").length);
    $("statCategories").textContent = String(data.categories.length);
  }
  const catalogCore = window.WD_CATALOG_CORE?.createCatalogCore(data);
  if (!catalogCore) throw new Error("WD Books catalog core is missing");
  function cardFor(book) {
    const article = create("article", "manual-card");
    const isReadable = book.status === "published" && Boolean(book.pages?.length);
    if (isReadable) {
      article.classList.add("manual-card-readable");
      article.setAttribute("role", "button");
      article.setAttribute("tabindex", "0");
      article.setAttribute("aria-label", "เปิดหนังสือ " + book.title);
      article.addEventListener("click", event => {
        if (event.target.closest("button, a, input, select, textarea")) return;
        openBook(book, article);
      });
      article.addEventListener("keydown", event => {
        if (event.target !== article || !["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        openBook(book, article);
      });
    }
    const cover = create("div", "book-cover cover-" + (book.color || "forest"));
    cover.append(create("span", "cover-eyebrow", book.coverTop || "MANUAL"));
    cover.append(create("strong", "", book.coverTitle || book.title));
    cover.append(create("span", "cover-subtitle", book.subtitle));
    const body = create("div", "card-body");
    body.append(create("span", "card-category", lookup[book.category]?.label || "คู่มือ"));
    body.append(create("h3", "", book.title));
    body.append(create("p", "", book.description));
    const foot = create("div", "card-footer");
    foot.append(create("span", "card-meta", book.edition + (book.readTime !== "—" ? " · " + book.readTime : "")));
    if (isReadable) {
      const open = create("button", "open-book", "เปิดอ่าน ↗");
      open.type = "button";
      open.setAttribute("aria-label", "เปิดหนังสือ " + book.title);
      open.addEventListener("click", () => openBook(book, open));
      foot.append(open);
      const favorite = create("button", "favorite-book cover-favorite");
      favorite.type = "button";
      // SVG keeps the heart proportions consistent across Android/iOS fonts.
      const heartIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      heartIcon.setAttribute("viewBox", "0 0 24 24");
      heartIcon.setAttribute("width", "24");
      heartIcon.setAttribute("height", "24");
      heartIcon.setAttribute("aria-hidden", "true");
      heartIcon.setAttribute("focusable", "false");
      const heartPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      heartPath.setAttribute("d", "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z");
      heartIcon.append(heartPath);
      favorite.append(heartIcon);
      const syncFavorite = () => {
        const saved = Boolean(window.WD_EXPERIENCE?.isFavorite?.(book.id));
        // Preserve the SVG node while updating pressed state and accessible label.
        favorite.classList.toggle("is-saved", saved);
        favorite.title = saved ? "นำออกจากหนังสือของฉัน" : "เก็บไว้ในหนังสือของฉัน";
        favorite.setAttribute("aria-pressed", String(saved));
        favorite.setAttribute("aria-label", (saved ? "นำออกจากหนังสือของฉัน " : "เพิ่มในหนังสือของฉัน ") + book.title);
      };
      syncFavorite();
      favorite.addEventListener("click", () => {
        window.WD_EXPERIENCE?.toggleFavorite?.(book.id);
        syncFavorite();
        const saved = Boolean(window.WD_EXPERIENCE?.isFavorite?.(book.id));
        const status = $("pwaStatus");
        if (status) {
          status.textContent = saved ? "บันทึกในหนังสือของฉันแล้ว" : "นำออกจากหนังสือของฉันแล้ว";
          status.hidden = false;
          window.clearTimeout(favorite.noticeTimer);
          favorite.noticeTimer = window.setTimeout(() => { status.hidden = true; }, 2200);
        }
      });
      cover.append(favorite);

    } else {
      foot.append(create("span", "pending-text", book.status === "review" ? "ยังไม่เผยแพร่เนื้อหา" : "ยังไม่มีเนื้อหา"));
    }
    body.append(foot);
    const badge = create("span", "card-state" + (book.status === "published" ? " ready" : ""), (book.id === "welcome-to-manual-library" ? "สาธิต · เปิดอ่าน" : statuses[book.status] || "ตามแผน"));
    article.append(cover, badge, body);
    return article;
  }
  const catalogUI = window.WD_CATALOG_UI?.create({data, state, $, cardFor, renderCategories, catalogCore, normalized});
  if (!catalogUI) throw new Error("WD Books catalog UI is missing");
  const renderCatalog = catalogUI.renderCatalog;

  // Stable resume card: do not replace its button when a page turn saves progress,
  // or the original focus target would disappear while its dialog is open.
  const myBooks = window.WD_MYBOOKS_SELECTORS?.createMyBooksSelectors(data.manuals);
  if (!myBooks) throw new Error("WD Books My Books selectors are missing");
  let featuredBookId = null;
  let featureNodes = null;
  function renderContinueFeature() {
    const section = $("continueFeature"), host = $("continueFeatureCard");
    if (!section || !host) return;
    const book = myBooks.resume(window.WD_EXPERIENCE?.getHistory?.() || []);
    if (!book) {
      section.hidden = true;
      host.replaceChildren();
      featuredBookId = null;
      featureNodes = null;
      return;
    }
    section.hidden = false;
    if (featuredBookId !== book.id || !featureNodes) {
      const card = create("div", "resume-feature-card");
      const cover = create("div", "resume-feature-cover");
      cover.append(create("span", "resume-feature-cover-kicker", book.coverTop || "WD BOOKS"));
      cover.append(create("strong", "", book.coverTitle || book.title));
      const copy = create("div", "resume-feature-copy");
      const label = create("span", "resume-feature-label", "หนังสือที่อ่านล่าสุด");
      const title = create("h3", "", book.title);
      const subtitle = create("p", "", book.subtitle || lookup[book.category]?.label || "คู่มือ");
      const progressText = create("span", "resume-feature-progress");
      const track = create("div", "resume-feature-track");
      track.setAttribute("aria-hidden", "true");
      const bar = create("span", "");
      track.append(bar);
      const read = create("button", "resume-feature-action", "อ่านต่อ →");
      read.type = "button";
      read.setAttribute("aria-label", "อ่าน " + book.title + " ต่อจากหน้าล่าสุด");
      read.addEventListener("click", () => openBook(book, read));
      copy.append(label, title, subtitle, progressText, track, read);
      card.append(cover, copy);
      host.replaceChildren(card);
      featureNodes = { progressText, bar };
      featuredBookId = book.id;
    }
    const page = window.WD_EXPERIENCE?.getProgress?.(book.id) || 0;
    featureNodes.progressText.textContent = "หน้า " + (page + 1) + " จาก " + book.pages.length + " · " + Math.round(((page + 1) / book.pages.length) * 100) + "%";
    featureNodes.bar.style.width = ((page + 1) / book.pages.length * 100) + "%";
  }

  function shelfRow(book, includeRemove = false) {
    const row = create("div", "personal-row");
    const cover = create("span", "personal-book-cover", "WD");
    cover.setAttribute("aria-hidden", "true");
    const detail = create("div", "personal-book-detail");
    detail.append(create("strong", "", book.title));
    const page = window.WD_EXPERIENCE?.getProgress?.(book.id) || 0;
    detail.append(create("small", "", "อ่านถึงหน้า " + (page + 1) + " / " + book.pages.length));
    const actions = create("div", "personal-book-actions");
    const read = create("button", "", "อ่านต่อ ↗");
    read.type = "button";
    read.setAttribute("aria-label", "อ่าน " + book.title + " ต่อ");
    read.addEventListener("click", () => openBook(book, read));
    actions.append(read);
    if (includeRemove) {
      const remove = create("button", "remove-favorite", "นำออก");
      remove.type = "button";
      remove.setAttribute("aria-label", "นำ " + book.title + " ออกจากหนังสือของฉัน");
      remove.addEventListener("click", () => window.WD_EXPERIENCE?.toggleFavorite?.(book.id));
      actions.append(remove);
    }
    detail.append(actions);
    row.append(cover, detail);
    return row;
  }
  const bookmarkShelfUI = { query: "", expanded: new Set(), showAll: new Set(), initialized: false };
  function renderGroupedBookmarks() {
    const shelf = $("myBookmarksShelf");
    if (!shelf) return;
    const experience = window.WD_EXPERIENCE;
    const history = experience?.getHistory?.() || [];
    const groups = myBooks.bookmarks(id => experience?.getBookmarks?.(id), history);
    if (!bookmarkShelfUI.initialized && groups.length) {
      bookmarkShelfUI.expanded.add(groups[0].book.id);
      bookmarkShelfUI.initialized = true;
    }
    const total = groups.reduce((sum, group) => sum + group.indices.length, 0);
    $("myBookmarksCount").textContent = total + " ตอน";
    $("myBookmarksSummary").textContent = total ? total + " ตอน จาก " + groups.length + " คู่มือ · เก็บไว้เฉพาะในเครื่องนี้" : "แตะหัวข้อเพื่อเปิดอ่านตอนที่บันทึกไว้ในเครื่องนี้";
    const query = normalized(bookmarkShelfUI.query);
    const filtered = groups.map(group => ({
      ...group,
      visible: !query || normalized(group.book.title).includes(query)
        ? group.indices
        : group.indices.filter(index => normalized(group.book.pages[index].title).includes(query) || normalized("ตอน " + (index + 1)).includes(query))
    })).filter(group => group.visible.length);
    const nodes = filtered.map(group => {
      const id = group.book.id;
      const expanded = !!query || bookmarkShelfUI.expanded.has(id);
      const wrapper = create("section", "bookmark-book-group");
      const heading = create("button", "bookmark-book-heading");
      heading.type = "button";
      heading.setAttribute("aria-expanded", String(expanded));
      heading.append(create("span", "bookmark-book-icon", "▤"));
      const info = create("span", "bookmark-book-info");
      info.append(create("strong", "", group.book.title), create("small", "", group.indices.length + " ตอนที่คั่นไว้"));
      heading.append(info, create("span", "bookmark-book-chevron", expanded ? "⌃" : "⌄"));
      heading.addEventListener("click", () => {
        if (bookmarkShelfUI.expanded.has(id)) bookmarkShelfUI.expanded.delete(id);
        else bookmarkShelfUI.expanded.add(id);
        renderGroupedBookmarks();
      });
      wrapper.append(heading);
      if (expanded) {
        const body = create("div", "bookmark-book-body");
        const limited = !query && !bookmarkShelfUI.showAll.has(id) && group.visible.length > 5;
        (limited ? group.visible.slice(0, 5) : group.visible).forEach(index => {
          const go = create("button", "bookmark-chapter-open");
          go.type = "button";
          go.append(create("span", "bookmark-chapter-icon", "🔖"), create("span", "", "ตอน " + (index + 1) + " · " + group.book.pages[index].title));
          go.setAttribute("aria-label", "เปิด " + group.book.title + " ตอน " + (index + 1) + " " + group.book.pages[index].title);
          go.addEventListener("click", () => { openBook(group.book, go); jumpTo(index); });
          body.append(go);
        });
        if (limited) {
          const more = create("button", "bookmark-show-all", "ดูทั้งหมด " + group.visible.length + " ตอน");
          more.type = "button";
          more.addEventListener("click", () => { bookmarkShelfUI.showAll.add(id); renderGroupedBookmarks(); });
          body.append(more);
        }
        wrapper.append(body);
      }
      return wrapper;
    });
    shelf.replaceChildren(...(nodes.length ? nodes : [create("p", "personal-empty", query ? "ไม่พบคั่นหน้าที่ตรงกับคำค้น" : "ยังไม่มีตอนที่คั่นไว้ เปิดคู่มือแล้วแตะ ⋯ เพื่อคั่นหน้า")]));
  }
  $("myBookmarksFilter")?.addEventListener("input", event => {
    bookmarkShelfUI.query = event.target.value;
    renderGroupedBookmarks();
  });
  function renderShelf() {
    const recentNode = $("recentShelf"), favoritesNode = $("favoritesShelf");
    if (!recentNode || !favoritesNode) return;
    const experience = window.WD_EXPERIENCE;
    const recent = myBooks.recent(experience?.getHistory?.() || []);
    recentNode.replaceChildren(...(recent.length ? recent.map(book => shelfRow(book))
      : [create("p", "personal-empty", "ยังไม่มีหนังสือที่อ่าน เริ่มอ่านเล่มใดก็ได้จากชั้นหนังสือ")]));
    const favorites = myBooks.favorites(experience?.getFavorites?.() || []);
    favoritesNode.replaceChildren(...(favorites.length
      ? favorites.map(book => shelfRow(book, true))
      : [create("p", "personal-empty", "ยังไม่มีหนังสือที่บันทึกไว้ กด ♡ เก็บไว้ บนเล่มที่สนใจ")]));
    if ($("favoritesCount")) $("favoritesCount").textContent = favorites.length + " เล่ม";
    renderGroupedBookmarks();

  }
  const dialog = $("readerDialog");
  // UX-P0E: modal body lock is restored by the native dialog close lifecycle.
  dialog.addEventListener("close", () => document.body.classList.remove("reader-open"));
  // A swipe started on the narrow stage gutter should move the actual book,
  // not a non-scrollable shell. Do not intercept buttons, panels or horizontal swipes.
  (() => {
    const stage = document.querySelector(".reader-stage");
    let lastY = null, lastX = null, redirect = false;
    stage.addEventListener("touchstart", event => {
      redirect = false;
      if (!dialog.open || !isMobile.matches || event.touches.length !== 1) return;
      if (event.target.closest("button,a,input,select,textarea,.book-page,.continuous-pages,.reader-bottom")) return;
      const t = event.touches[0];
      lastY = t.clientY; lastX = t.clientX; redirect = true;
    }, {passive:true});
    stage.addEventListener("touchmove", event => {
      if (!redirect || event.touches.length !== 1) return;
      const t = event.touches[0], dy = t.clientY-lastY, dx = t.clientX-lastX;
      if (Math.abs(dx)>Math.abs(dy)*1.2) { redirect=false; return; }
      const target = state.readingMode === "continuous" ? $("continuousPages") : $("pageLeft");
      if (target && Math.abs(dy)>0) { target.scrollTop -= dy; event.preventDefault(); }
      lastY=t.clientY; lastX=t.clientX;
    }, {passive:false});
    for (const eventName of ["touchend","touchcancel"]) stage.addEventListener(eventName,()=>{redirect=false;lastY=null;lastX=null},{passive:true});
    stage.addEventListener("wheel",event => {
      if (!dialog.open || !isMobile.matches || event.target.closest(".book-page,.continuous-pages,.reader-bottom,button,input,select")) return;
      const target=state.readingMode==="continuous" ? $("continuousPages") : $("pageLeft");
      if (target && Math.abs(event.deltaY)>Math.abs(event.deltaX)) {target.scrollTop+=event.deltaY;event.preventDefault();}
    },{passive:false});
  })();
  const mobileTocSheet = $("mobileTocSheet");
  const mobileTocButton = $("openMobileToc");
  const mobileTocClose = $("closeMobileToc");
  let tocReturnFocus = null;
  function isTocOpen() { return Boolean(mobileTocSheet && !mobileTocSheet.hidden); }
  function openMobileToc() {
    if (!dialog?.open || !state.manual || !isMobile.matches || !mobileTocSheet || isTocOpen()) return;
    tocReturnFocus = document.activeElement;
    mobileTocSheet.hidden = false;
    mobileTocButton.setAttribute("aria-expanded", "true");
    $("bookSpread")?.setAttribute("aria-hidden", "true");
    const background = document.querySelector(".reader-content");
    if (background) background.inert = true;
    const header = document.querySelector(".reader-topbar");
    if (header) header.inert = true;
    mobileTocClose.focus();
  }
  function closeMobileToc(restoreFocus = true) {
    if (!isTocOpen()) return;
    mobileTocSheet.hidden = true;
    mobileTocButton.setAttribute("aria-expanded", "false");
    $("bookSpread")?.removeAttribute("aria-hidden");
    const background = document.querySelector(".reader-content");
    if (background) background.inert = false;
    const header = document.querySelector(".reader-topbar");
    if (header) header.inert = false;
    if (restoreFocus && dialog.open) (tocReturnFocus?.isConnected ? tocReturnFocus : mobileTocButton).focus();
    tocReturnFocus = null;
  }
  mobileTocButton?.addEventListener("click", openMobileToc);
  mobileTocClose?.addEventListener("click", () => closeMobileToc());
  $("mobileTocBackdrop")?.addEventListener("click", () => closeMobileToc());
  mobileTocSheet?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation?.();
      closeMobileToc();
    } else if (event.key === "Tab") {
      const choices = [mobileTocClose, ...$("mobileTocItems").children].filter(Boolean);
      if (!choices.length) return;
      const active = document.activeElement;
      const current = choices.indexOf(active);
      if (event.shiftKey && (current <= 0)) { event.preventDefault(); choices[choices.length - 1].focus(); }
      else if (!event.shiftKey && (current === choices.length - 1 || current < 0)) {
        event.preventDefault(); choices[0].focus();
      }
    }
  });
  dialog.addEventListener("cancel", event => {
    if (isTocOpen()) { event.preventDefault(); closeMobileToc(); }
  });
  function openBook(book, opener) {
    if (book.status !== "published" || !book.pages?.length) return;
    state.manual = book;
    searchInput.value = "";
    closeReaderSearch();
    closeBookmarks(false);
    const remembered = window.WD_EXPERIENCE?.getProgress?.(book.id) || 0;
    state.page = isMobile.matches ? remembered : Math.floor(remembered / 2) * 2;
    state.readingMode = window.WD_EXPERIENCE?.getReadingMode?.() || "paged";
    state.scale = window.WD_EXPERIENCE?.getScale?.() || 1;
    state.opener = opener;
    $("bookSpread").style.setProperty("--readerScale", String(state.scale));
    $("readerTitle").textContent = book.title;
    $("readerMobileBookTitle").textContent = book.title;
    $("readerMobileBookTitle").title = book.title;
    $("readerBookmarksBookTitle").textContent = book.title;
    $("readerCategory").textContent = (lookup[book.category]?.label || "คู่มือ") + " · " + book.edition;
    const prompterButton = $("readerTeleprompterOpen");
    if (prompterButton) {
      prompterButton.hidden = book.id !== "ai-five-questions-speaking-handbook-25691026";
      prompterButton.onclick = prompterButton.hidden ? null : () => window.WD_TELEPROMPTER?.open?.(book, state.page);
    }
    $("bookSpread").classList.add("reader-loading");
    renderReader();
    syncBookmarks();
    requestAnimationFrame(() => $("bookSpread").classList.remove("reader-loading"));
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("reader-open");
    window.WD_AUDIO_READER?.selectBook?.(book, state.page);
    $("readerClose").focus();
  }
  const toolsToggle = $("readerToolsToggle"), extraTools = $("readerExtraTools");
  // Wide readers have no overflow-menu trigger: never hide their always-visible tools.
  const closeTools = () => {
    if (!window.matchMedia("(max-width:1100px)").matches) return;
    extraTools.hidden = true;
    toolsToggle.setAttribute("aria-expanded","false");
  };
  // Avoid iOS interpreting two rapid taps on ⋯ as page zoom; preserve pinch zoom elsewhere.
  toolsToggle.addEventListener("dblclick", event => event.preventDefault());
  toolsToggle.addEventListener("touchend", event => {
    if (event.cancelable) event.preventDefault();
    toolsToggle.click();
  }, {passive:false});
  toolsToggle.addEventListener("click", () => {
    extraTools.hidden = !extraTools.hidden;
    if (!extraTools.hidden) {
      for (const [panel, button] of [["readerAaPanel","readerAaToggle"],["readerSearchPanel","readerSearchToggle"],["readerBookmarksPanel","readerBookmarksListToggle"]]) {
        $(panel).hidden = true; $(button).setAttribute("aria-expanded","false");
      }
    }
    toolsToggle.setAttribute("aria-expanded",String(!extraTools.hidden));
  });
  const syncToolsViewport = () => {
    if (window.matchMedia("(min-width:1101px)").matches) {
      extraTools.hidden = false;
      toolsToggle.setAttribute("aria-expanded","false");
    } else closeTools();
  };
  syncToolsViewport();
  window.matchMedia("(min-width:1101px)").addEventListener?.("change",syncToolsViewport);
  dialog.addEventListener("close",() => { if (window.matchMedia("(max-width:1100px)").matches) closeTools(); });
  extraTools.addEventListener("click",event => {
    if (event.target.closest("[data-reader-theme]")) return;
    if (event.target.closest("button")) closeTools();
  });
  // Dismiss transient reader controls when tapping the book or unused dialog area.
  // A tap inside the menu or an open panel is not an outside tap.
  dialog.addEventListener("pointerdown", event => {
    if (event.target.closest("#readerToolsToggle,#readerExtraTools,#readerAaPanel,#readerSearchPanel,#readerBookmarksPanel,#openMobileToc,#mobileTocSheet")) return;
    if (window.matchMedia("(max-width:1100px)").matches) closeTools();
    closeReaderSubpanels();
  });
  dialog.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const hasOpenPanel = ["readerAaPanel","readerSearchPanel","readerBookmarksPanel"].some(id => !$(id).hidden);
    const hasOpenMenu = window.matchMedia("(max-width:1100px)").matches && !extraTools.hidden;
    if (hasOpenPanel || hasOpenMenu) {
      event.preventDefault(); event.stopPropagation();
      if (window.matchMedia("(max-width:1100px)").matches) closeTools();
      closeReaderSubpanels(); toolsToggle.focus();
    }
  });
  const bookmarkToggle = $("readerBookmarkToggle"), bookmarkListToggle = $("readerBookmarksListToggle"), bookmarksPanel = $("readerBookmarksPanel");
  const bookmarkClose = $("readerBookmarksClose"), bookmarkBackdrop = $("readerBookmarksBackdrop");
  const bookmarkSheetMode = () => window.matchMedia("(max-width:1100px)").matches;
  let bookmarkReturnFocus = null;
  function closeBookmarks(restoreFocus = true) {
    if (bookmarksPanel.hidden) return;
    bookmarksPanel.hidden = true;
    bookmarkListToggle.setAttribute("aria-expanded","false");
    if (restoreFocus && bookmarkReturnFocus?.isConnected && dialog.open) bookmarkReturnFocus.focus();
    bookmarkReturnFocus = null;
  }
  bookmarkClose.addEventListener("click", () => closeBookmarks());
  bookmarkBackdrop.addEventListener("click", () => closeBookmarks());
  bookmarksPanel.addEventListener("keydown", event => {
    if (!bookmarkSheetMode()) return;
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeBookmarks(); return; }
    if (event.key !== "Tab") return;
    const focusables = [...bookmarksPanel.querySelectorAll("button:not([disabled]):not([tabindex='-1'])")];
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });

  function closeReaderSubpanels(except) {
    for (const [panel, button] of [["readerAaPanel","readerAaToggle"],["readerSearchPanel","readerSearchToggle"],["readerBookmarksPanel","readerBookmarksListToggle"]]) {
      if (panel !== except) { if (panel === "readerBookmarksPanel") closeBookmarks(false); else { $(panel).hidden = true; $(button).setAttribute("aria-expanded","false"); } }
    }
  }
  function syncBookmarks() {
    if (!state.manual) return;
    const id = state.manual.id, indices = window.WD_EXPERIENCE?.getBookmarks?.(id) || [];
    const saved = indices.includes(state.page);
    const bookmarkSymbol = bookmarkToggle.querySelector(".tool-symbol");
    if (bookmarkSymbol) bookmarkSymbol.textContent = saved ? "🔖" : "♧";
    bookmarkToggle.textContent = saved ? "✓ คั่นหน้าตอนนี้แล้ว · แตะเพื่อนำออก" : "＋ คั่นหน้าตอนที่กำลังอ่าน";
    bookmarkToggle.setAttribute("aria-pressed", String(saved));
    bookmarkToggle.setAttribute("aria-label", saved ? "นำคั่นหน้าออก" : "คั่นหน้าตอนนี้");
    $("readerBookmarksStatus").textContent = indices.length ? "บันทึกไว้ " + indices.length + " ตอน · แตะชื่อเพื่อเปิดอ่าน" : "ยังไม่มีตอนที่คั่นไว้";
    const items = $("readerBookmarksItems");
    items.replaceChildren(...indices.map(index => {
      const row = create("div", "reader-bookmark-row");
      const label = "ตอน " + (index+1) + " · " + state.manual.pages[index].title;
      const b = create("button", "reader-bookmark-jump", label);
      b.type = "button";
      b.addEventListener("click", () => { jumpTo(index); closeBookmarks(); });
      const remove = create("button", "reader-bookmark-remove", "ลบ");
      remove.type = "button";
      remove.setAttribute("aria-label", "นำที่คั่นหน้าออก: " + label);
      remove.addEventListener("click", () => {
        if (window.WD_EXPERIENCE?.getBookmarks?.(id)?.includes(index)) window.WD_EXPERIENCE.toggleBookmark(id,index);
        syncBookmarks();
        renderShelf();
      });
      row.append(b,remove);
      return row;
    }));
  }
  bookmarkToggle.addEventListener("click", () => {
    if (!state.manual) return;
    window.WD_EXPERIENCE?.toggleBookmark?.(state.manual.id,state.page);
    syncBookmarks();
    renderShelf();
  });
  bookmarkListToggle.addEventListener("click", () => {
    if (!bookmarksPanel.hidden) { closeBookmarks(); return; }
    closeReaderSubpanels("readerBookmarksPanel");
    bookmarkReturnFocus = bookmarkListToggle;
    bookmarksPanel.hidden = false;
    bookmarkListToggle.setAttribute("aria-expanded","true");
    syncBookmarks();
    if (bookmarkSheetMode()) bookmarkClose.focus();
  });
  // UX-SEARCH-HIGHLIGHT-R1: compact results and next/previous chapter navigation.
  const searchPanel = $("readerSearchPanel"), searchToggle = $("readerSearchToggle");
  const searchInput = $("readerSearchInput"), searchResults = $("readerSearchResults");
  const searchStatus = $("readerSearchStatus");
  const searchNav = $("readerSearchNav"), searchPrev = $("readerSearchPrev"), searchNext = $("readerSearchNext");
  const searchPosition = $("readerSearchPosition"), searchExpand = $("readerSearchExpand");
  let readerHighlightTerm = "", readerSearchMatches = [], readerSearchSelected = -1, readerSearchCollapsed = false;
  function closeReaderSearch() {
    searchPanel.hidden = true;
    searchToggle.setAttribute("aria-expanded","false");
  }
  function setSearchCollapsed(value) {
    readerSearchCollapsed = value;
    searchResults.hidden = value;
    searchExpand.textContent = value ? "แสดงผลค้นหา" : "ยุบผลค้นหา";
    searchExpand.setAttribute("aria-expanded", String(!value));
  }
  function syncSearchNavigation() {
    const count = readerSearchMatches.length;
    searchNav.hidden = !count;
    searchPosition.textContent = readerSearchSelected < 0 ? "เลือกตอนจากผลค้นหา" : "ตอนที่เลือก " + (readerSearchSelected + 1) + " / " + count;
    searchPrev.disabled = !count || readerSearchSelected <= 0;
    searchNext.disabled = !count || readerSearchSelected >= count - 1;
    [...searchResults.children].forEach((node, i) => {
      node.classList.toggle("is-selected", i === readerSearchSelected);
      node.setAttribute("aria-current", i === readerSearchSelected ? "true" : "false");
    });
  }
  function selectSearchResult(position) {
    if (position < 0 || position >= readerSearchMatches.length) return;
    readerSearchSelected = position;
    jumpTo(readerSearchMatches[position].index);
    syncSearchNavigation();
    setSearchCollapsed(true);
    // Keep the compact search controls accessible while reading.
  }
  searchPrev.addEventListener("click", () => selectSearchResult(readerSearchSelected - 1));
  searchNext.addEventListener("click", () => selectSearchResult(readerSearchSelected + 1));
  searchExpand.addEventListener("click", () => setSearchCollapsed(!readerSearchCollapsed));
  searchToggle.addEventListener("click", () => {
    const opening = searchPanel.hidden;
    if (opening) closeReaderSubpanels("readerSearchPanel");
    searchPanel.hidden = !opening;
    searchToggle.setAttribute("aria-expanded",String(!searchPanel.hidden));
    if (!searchPanel.hidden) { updateReaderSearch(); searchInput.focus(); }
    else searchToggle.focus();
  });
  function searchablePage(page) {
    return [page.title,page.kicker,...(page.paragraphs||[]),...(page.bullets||[]),page.tip].filter(x=>typeof x==="string").join(" ");
  }
  function cleanSearchSnippet(value) {
    return value.replace(/[\\u200B-\\u200D\\uFEFF\\uFFFD]/g,"").replace(/\\s+/g," ").trim();
  }
  function updateReaderSearch() {
    searchResults.replaceChildren();
    const term = normalized(searchInput.value).replace(/\\s+/g," ");
    readerHighlightTerm = term;
    readerSearchMatches = [];
    readerSearchSelected = -1;
    if (state.manual && dialog.open) renderReader();
    if (!term || !state.manual || state.manual.status !== "published") {
      searchStatus.textContent = "พิมพ์ข้อความเพื่อค้นหา";
      searchNav.hidden = true;
      setSearchCollapsed(false);
      return;
    }
    state.manual.pages.forEach((page,index) => {
      const source = searchablePage(page);
      const pos = normalized(source).indexOf(term);
      if (pos >= 0) readerSearchMatches.push({page,index,source,pos});
    });
    searchStatus.textContent = readerSearchMatches.length ? "พบ " + readerSearchMatches.length + " ตอน" : "ไม่พบข้อความในเล่มนี้";
    readerSearchMatches.forEach(({page,index,source,pos},position) => {
      const button = create("button","reader-search-result");
      button.type = "button";
      button.append(create("strong","", "ตอน " + (index+1) + " · " + page.title));
      const before = Math.max(0,pos-34), after = Math.min(source.length,pos+term.length+55);
      button.append(create("span","",cleanSearchSnippet((before?"…":"") + source.slice(before,after) + (after<source.length?"…":""))));
      button.addEventListener("click", () => selectSearchResult(position));
      searchResults.append(button);
    });
    setSearchCollapsed(false);
    syncSearchNavigation();
  }
  searchInput.addEventListener("input",updateReaderSearch);
  $("readerSearchClear").addEventListener("click",() => {
    searchInput.value = "";
    readerHighlightTerm = "";
    updateReaderSearch();
    searchInput.focus();
  });
  dialog.addEventListener("close",() => {
    closeReaderSearch();
    searchInput.value = "";
    searchResults.replaceChildren();
    readerHighlightTerm = "";
    readerSearchMatches = [];
    readerSearchSelected = -1;
    searchNav.hidden = true;
    setSearchCollapsed(false);
  });
  function highlightVisiblePages() {
    document.querySelectorAll(".reader-stage .book-page").forEach(highlightPage);
  }
  function highlightPage(root) {
    if (!root || !readerHighlightTerm) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest("mark, .book-page-number")) continue;
      if (node.nodeValue?.toLocaleLowerCase().includes(readerHighlightTerm)) nodes.push(node);
    }
    nodes.forEach(node => {
      const value = node.nodeValue;
      const lower = value.toLocaleLowerCase();
      const fragment = document.createDocumentFragment();
      let cursor = 0, found;
      while ((found = lower.indexOf(readerHighlightTerm, cursor)) !== -1) {
        if (found > cursor) fragment.append(document.createTextNode(value.slice(cursor, found)));
        const mark = document.createElement("mark");
        mark.className = "reader-search-highlight";
        mark.textContent = value.slice(found, found + readerHighlightTerm.length);
        fragment.append(mark);
        cursor = found + readerHighlightTerm.length;
      }
      if (cursor < value.length) fragment.append(document.createTextNode(value.slice(cursor)));
      node.replaceWith(fragment);
    });
  }
  function pageNode(target, page, index) {
    target.replaceChildren();
    target.classList.toggle("blank-page", !page);
    if (!page) {
      target.append(create("span", "blank-mark", "✳"));
      return;
    }
    target.setAttribute("aria-label", "หน้า " + (index + 1) + " " + page.title);
    target.append(create("div", "page-kicker", page.kicker || "WD SCHOOL MANUAL"));
    target.append(create("h2", "page-heading", page.title));
    (page.paragraphs || []).forEach((text) => target.append(create("p", "page-copy", text)));
    if (["target-result", "year-comparison"].includes(page.chart?.kind) && Array.isArray(page.chart.rows)) {
      const figure = create("figure", "sar-chart");
      figure.setAttribute("aria-label", page.chart.title || "เปรียบเทียบเป้าหมายกับผลประเมิน");
      figure.append(create("figcaption", "sar-chart-title", page.chart.title || "เปรียบเทียบเป้าหมายและผลประเมิน"));
      page.chart.rows.forEach(row => {
        const targetValue = Number(row.target), resultValue = Number(row.result);
        if (![targetValue, resultValue].every(Number.isFinite) || targetValue < 0 || targetValue > 100 || resultValue < 0 || resultValue > 100) return;
        const group = create("div", "sar-chart-group");
        group.append(create("div", "sar-chart-label", row.label));
        [[targetValue,page.chart.labels?.[0] || "เป้าหมาย","target"],[resultValue,page.chart.labels?.[1] || "ผลประเมิน","result"]].forEach(([value,label,kind]) => {
          const line = create("div", "sar-chart-line");
          line.append(create("span", "sar-chart-legend", label));
          const track = create("div", "sar-chart-track");
          const bar = create("div", "sar-chart-bar sar-chart-" + kind);
          bar.style.width = value + "%";
          track.append(bar);
          line.append(track, create("strong", "sar-chart-value", value + "%"));
          group.append(line);
        });
        figure.append(group);
      });
      target.append(figure);
    }
    if (page.insight && typeof page.insight.headline === "string") {
      const summary = create("section", "sar-insight");
      summary.setAttribute("aria-label", "สรุปสารสนเทศ");
      summary.append(create("strong", "sar-insight-headline", page.insight.headline));
      if (page.insight.primary) summary.append(create("p", "sar-insight-primary", page.insight.primary));
      if (page.insight.detail) summary.append(create("p", "sar-insight-detail", page.insight.detail));
      target.append(summary);
    }
    if (page.bullets?.length) {
      const ul = create("ul", "page-list");
      page.bullets.forEach((text) => ul.append(create("li", "", text)));
      target.append(ul);
    }
    if (page.tip) target.append(create("div", "page-callout", page.tip));
    target.append(create("div", "book-page-number", "WD MANUAL LIBRARY  ·  " + (index + 1)));
    highlightPage(target);
    target.scrollTop = 0;
  }
  function renderToc() {
    const toc = $("tocItems");
    // Keep the desktop TOC where the reader left it; rebuilding buttons on each
    // page turn must not jump the independent sidebar back to its beginning.
    const tocScroller = toc.closest?.(".reader-toc");
    const savedTocScroll = tocScroller?.scrollTop ?? 0;
    toc.replaceChildren(...state.manual.pages.map((page, i) => {
      const b = create("button", "", "");
      const displayed = state.readingMode === "continuous" || isMobile.matches ? state.page === i : state.page <= i && i < state.page + 2;
      b.classList.toggle("active", displayed);
      b.setAttribute("aria-current", displayed ? "page" : "false");
      b.append(create("span", "toc-number", String(i + 1).padStart(2, "0")));
      b.append(create("span", "", page.title));
      b.addEventListener("click", () => jumpTo(i));
      return b;
    }));
    if (tocScroller) tocScroller.scrollTop = savedTocScroll;
  }
  function renderMobileToc() {
    const mobileItems = $("mobileTocItems");
    if (!mobileItems || !state.manual) return;
    const count = state.manual.pages.length;
    const current = Math.min(state.page + 1, count);
    $("mobileTocStatus").textContent = "หน้า " + current + " จาก " + count + " · " + state.manual.title;
    mobileItems.replaceChildren(...state.manual.pages.map((page, i) => {
      const b = create("button", "mobile-toc-item");
      b.type = "button";
      const currentPage = state.readingMode === "continuous" || isMobile.matches ? i === state.page : state.page <= i && i < state.page + 2;
      b.setAttribute("aria-current", currentPage ? "page" : "false");
      b.setAttribute("aria-label", "หน้า " + (i + 1) + " " + page.title + (currentPage ? " กำลังอ่าน" : ""));
      b.append(create("span", "toc-number", String(i + 1).padStart(2, "0")));
      b.append(create("span", "toc-name", page.title));
      b.addEventListener("click", () => {
        jumpTo(i);
        closeMobileToc();
      });
      return b;
    }));
  }
  function renderReader() {
    syncReadingMode();
    if (state.readingMode === "continuous") { renderContinuous(); return; }
    continuousObserver?.disconnect();
    $("bookSpread").classList.remove("is-continuous");
    $("continuousPages").hidden = true;
    if (!state.manual) return;
    const count = state.manual.pages.length;
    const mobile = isMobile.matches;
    const first = state.page;
    pageNode($("pageLeft"), state.manual.pages[first], first);
    pageNode($("pageRight"), mobile ? null : state.manual.pages[first + 1], first + 1);
    $("prevPage").disabled = first === 0;
    $("nextPage").disabled = first + (mobile ? 1 : 2) >= count;
    const last = Math.min(first + (mobile ? 1 : 2), count);
    $("pageCounter").textContent = "หน้า " + (first + 1) + (last > first + 1 ? "–" + last : "") + " / " + count;
    $("progressBar").style.width = ((last / count) * 100) + "%";
    renderToc();
    renderMobileToc();
    syncBookmarks();
    window.WD_EXPERIENCE?.recordProgress?.(state.manual.id, first);
    window.WD_AUDIO_READER?.syncPage?.(state.manual.id, first);
  }
  let continuousObserver = null;
  function renderContinuous() {
    if (!state.manual) return;
    continuousObserver?.disconnect();
    const container = $("continuousPages"), spread = $("bookSpread");
    spread.classList.add("is-continuous");
    container.hidden = false;
    const pages = state.manual.pages;
    container.replaceChildren(...pages.map((page, index) => {
      const section = create("section", "continuous-section book-page");
      section.dataset.sectionIndex = String(index);
      pageNode(section, page, index);
      return section;
    }));
    $("prevPage").hidden = true;
    $("nextPage").hidden = true;
    const current = Math.min(state.page, pages.length - 1);
    updateContinuousPosition(current, true);
    requestAnimationFrame(() => {
      container.children[current]?.scrollIntoView({block:"start",behavior:"instant"});
      continuousObserver = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio);
        if (visible.length && state.readingMode === "continuous" && state.manual) {
          const index = Number(visible[0].target.dataset.sectionIndex);
          if (index !== state.page) updateContinuousPosition(index, true);
        }
      }, {root:container,threshold:[0.1,0.4,0.7]});
      [...container.children].forEach(section => continuousObserver.observe(section));
    });
  }
  function updateContinuousPosition(index, save) {
    state.page = index;
    const count = state.manual.pages.length;
    $("pageCounter").textContent = "ตอน " + (index+1) + " / " + count;
    $("progressBar").style.width = (((index+1)/count)*100) + "%";
    renderToc();
    renderMobileToc();
    syncBookmarks();
    if (save) window.WD_EXPERIENCE?.recordProgress?.(state.manual.id,index);
  }
  function syncReadingMode() {
    const continuous = state.readingMode === "continuous";
    $("readerModeToggle").setAttribute("aria-pressed", String(continuous));
    $("readerModeToggle").setAttribute("aria-label", continuous ? "เปลี่ยนเป็นโหมดพลิกหน้า" : "เปลี่ยนเป็นโหมดเลื่อนอ่านต่อเนื่อง");
    $("readerModeToggle").title = continuous ? "พลิกทีละหน้า" : "เลื่อนอ่านต่อเนื่อง";
    $("prevPage").hidden = continuous;
    $("nextPage").hidden = continuous;
    $("readerModeStatus").textContent = continuous ? "เลื่อนขึ้น–ลงเพื่ออ่านต่อ" : "พลิกทีละหน้า";
    const modeLabel = $("readerModeToggle").querySelector(".tool-label");
    if (modeLabel) modeLabel.textContent = continuous ? "พลิกหน้า" : "เลื่อนอ่าน";
    $("pageLeft").hidden = continuous;
    $("pageRight").hidden = continuous;
  }
  $("readerModeToggle")?.addEventListener("click", () => {
    state.readingMode = state.readingMode === "paged" ? "continuous" : "paged";
    window.WD_EXPERIENCE?.setReadingMode?.(state.readingMode);
    syncReadingMode();
    if (state.readingMode === "paged" && !isMobile.matches) state.page = Math.floor(state.page/2)*2;
    renderReader();
  });
  function jumpTo(i) {
    if (!state.manual) return;
    const n = Math.max(0, Math.min(i, state.manual.pages.length - 1));
    state.page = state.readingMode === "continuous" || isMobile.matches ? n : Math.floor(n / 2) * 2;
    renderReader();
  }
  function movePage(direction) {
    if (!state.manual || state.readingMode === "continuous") return;
    const step = isMobile.matches ? 1 : 2;
    const next = state.page + (direction * step);
    if (next < 0 || next >= state.manual.pages.length) return;
    const left = $("pageLeft"), right = $("pageRight");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { jumpTo(next); return; }
    left.classList.add("turning");
    right.classList.add("turning");
    window.setTimeout(() => {
      jumpTo(next);
      left.classList.remove("turning");
      right.classList.remove("turning");
    }, 105);
  }
  // UX-P0C: horizontal swipe within the book page only. Do not hijack pinch,
  // vertical scrolling, interactive elements, TOC, or OS edge navigation.
  (() => {
    const pages = [$("pageLeft"), $("pageRight")].filter(Boolean);
    let start = null;
    const reset = () => { start = null; };
    const interactive = target => Boolean(target?.closest?.("button,a,input,textarea,select,[contenteditable]"));
    pages.forEach(page => { page.addEventListener("touchstart", event => {
      reset();
      if (!dialog.open || state.readingMode === "continuous" || isTocOpen() || event.touches.length !== 1 || interactive(event.target)) return;
      const touch = event.touches[0];
      if (touch.clientX < 32 || touch.clientX > window.innerWidth - 32) return;
      start = { x: touch.clientX, y: touch.clientY, at: Date.now() };
    }, { passive: true });
    page.addEventListener("touchmove", event => {
      if (event.touches.length !== 1) reset();
    }, { passive: true });
    page.addEventListener("touchcancel", reset, { passive: true });
    page.addEventListener("touchend", event => {
      if (!start || !dialog.open || isTocOpen() || event.changedTouches.length !== 1) { reset(); return; }
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
      const elapsed = Date.now() - start.at;
      reset();
      if (elapsed > 850 || Math.abs(dx) < 75 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      movePage(dx < 0 ? 1 : -1);
    }, { passive: true });
    });
    dialog.addEventListener("close", reset);
  })();
  // Focus mode keeps page navigation and close controls visible.
  const focusToggle = $("readerFocusToggle");
  const syncFocus = () => {
    const active = dialog.classList.contains("reader-focus-mode");
    focusToggle?.setAttribute("aria-pressed", String(active));
    focusToggle?.setAttribute("aria-label", active ? "ปิดโหมดอ่านอย่างมีสมาธิ" : "เปิดโหมดอ่านอย่างมีสมาธิ");
  };
  focusToggle?.addEventListener("click", () => {
    dialog.classList.toggle("reader-focus-mode");
    syncFocus();
  });
  dialog.addEventListener("close", () => {
    dialog.classList.remove("reader-focus-mode");
    syncFocus();
  });
  $("prevPage").addEventListener("click", () => movePage(-1));
  $("nextPage").addEventListener("click", () => movePage(1));
  $("readerClose").addEventListener("click", () => dialog.close());
  // UX-P1A: accessible reader typography controls; no new storage key.
  const aaToggle = $("readerAaToggle"), aaPanel = $("readerAaPanel");
  aaToggle?.addEventListener("click", () => {
    const opening = aaPanel.hidden;
    if (opening) closeReaderSubpanels("readerAaPanel");
    aaPanel.hidden = !opening;
    aaToggle.setAttribute("aria-expanded", String(!aaPanel.hidden));
  });
  for (const [id, field] of [["readerFontFamily","family"],["readerLineSpacing","line"],["readerPageMargin","margin"]]) {
    $(id)?.addEventListener("change", event => window.WD_EXPERIENCE?.setTypography?.(field, event.target.value));
  }
  $("readerResetTypography")?.addEventListener("click", () => {
    for (const [field,value] of [["family","system"],["line","normal"],["margin","normal"]]) {
      window.WD_EXPERIENCE?.setTypography?.(field,value);
    }
  });
  dialog.addEventListener("close", () => {
    if (aaPanel) aaPanel.hidden = true;
    aaToggle?.setAttribute("aria-expanded","false");
  });
  $("fontDecrease").addEventListener("click", () => resize(-.1));
  $("fontIncrease").addEventListener("click", () => resize(.1));
  function resize(amount) {
    const next = Math.max(.9, Math.min(1.6, Math.round((state.scale + amount) * 10) / 10));
    state.scale = next;
    $("bookSpread").style.setProperty("--readerScale", String(state.scale));
    window.WD_EXPERIENCE?.setScale?.(next);
  }
  dialog.addEventListener("close", () => {
    closeMobileToc(false);
    closeBookmarks(false);
    continuousObserver?.disconnect();
    state.manual = null;
    if (state.opener?.isConnected) state.opener.focus();
    state.opener = null;
  });
  dialog.addEventListener("keydown", (event) => {
    if (state.readingMode === "continuous" || isTocOpen() || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight") { event.preventDefault(); movePage(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); movePage(-1); }
  });
  isMobile.addEventListener?.("change", () => {
    if (!isMobile.matches) closeMobileToc(false);
    if (state.manual && state.readingMode !== "continuous") { state.page = isMobile.matches ? state.page : Math.floor(state.page / 2) * 2; renderReader(); }
  });
  catalogUI.bindDiscovery();
  const readerCoordinator = window.WD_READER_COORDINATOR?.createReaderCoordinator({
    experience: window.WD_EXPERIENCE, renderShelf, renderContinueFeature, openBook
  });
  if (!readerCoordinator) throw new Error("WD Books Reader coordinator is missing");
  window.WD_EXPERIENCE?.bindReader?.(
    (scale) => { state.scale = scale; $("bookSpread").style.setProperty("--readerScale", String(scale)); },
    readerCoordinator.openReadable
  );
  renderStats();
  renderCategories();
  renderCatalog();
  readerCoordinator.connect();
})();
