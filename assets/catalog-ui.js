/* ARCH-01C: Catalog DOM updates and discovery controls only. Reader stays in app.js. */
(() => {
  "use strict";
  window.WD_CATALOG_UI = Object.freeze({
    create({data, state, $, cardFor, renderCategories, catalogCore, normalized}) {
      function renderCatalog() {
        const history = window.WD_EXPERIENCE?.getHistory?.() || [];
        const filtered = catalogCore.select(state, history);
        $("manualGrid").replaceChildren(...filtered.map(cardFor));
        $("manualGrid").setAttribute("aria-busy","false");
        document.querySelectorAll("[data-discovery-filter]").forEach(button => {
          const active = button.dataset.discoveryFilter === state.availability;
          button.setAttribute("aria-pressed", String(active));
          button.classList.toggle("selected", active);
        });
        const readyCount = filtered.filter(book => book.status === "published" && book.pages?.length).length;
        $("resultsText").textContent = filtered.length ? "พบคู่มือพร้อมอ่าน " + readyCount + " เล่ม · รายการทั้งหมด " + filtered.length + " จาก " + data.manuals.length + " รายการ" : "ไม่พบคู่มือที่ตรงกับคำค้นหาและตัวกรองที่เลือก";
        $("resetDiscoveryFilters").hidden = filtered.length > 0;
        $("discoverySort").value = state.sort;
        $("emptyResults").textContent = "ลองล้างตัวกรองเพื่อดูคู่มือทั้งหมดอีกครั้ง";
        $("emptyResults").hidden = filtered.length > 0;
      }


      function bindDiscovery() {
        function updateQuery(value, source) {
          state.query = normalized(value);
          for (const id of ["searchInput", "homeSearchInput"]) {
            const field = $(id);
            if (field && field !== source) field.value = value;
          }
          renderCatalog();
        }
        for (const id of ["searchInput", "homeSearchInput"]) {
          $(id)?.addEventListener("input", (event) => updateQuery(event.target.value, event.target));
        }
        $("resetDiscoveryFilters").addEventListener("click", () => {
          state.availability = "all";
          state.category = "all";
          state.sort = "default";
          state.query = "";
          for (const id of ["searchInput", "homeSearchInput"]) { if ($(id)) $(id).value = ""; }
          renderCategories();
          renderCatalog();
          $("resultsText").focus();
        });
        $("discoverySort").addEventListener("change", event => {
          state.sort = ["default", "title", "recent"].includes(event.target.value) ? event.target.value : "default";
          renderCatalog();
        });
        document.querySelectorAll("[data-discovery-filter]").forEach(button => {
          button.addEventListener("click", () => {
            state.availability = button.dataset.discoveryFilter;
            renderCatalog();
          });
        });

      }
      return Object.freeze({renderCatalog, bindDiscovery});
    }
  });
})();
