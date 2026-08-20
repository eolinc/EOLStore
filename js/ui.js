/**
 * UI
 * ---
 * Generic, page-agnostic DOM wiring. Any element rendered anywhere in the
 * app can opt into navigation just by carrying a data-nav attribute -
 * pages don't need to attach their own click listeners for basic
 * "open this app / category" behavior.
 */
const UI = (function () {
  function wireDynamicHandlers(container) {
    container.addEventListener("click", (e) => {
      const navEl = e.target.closest("[data-nav]");
      if (!navEl) return;
      const kind = navEl.dataset.nav;
      const id = navEl.dataset.id;
      if (kind === "details" && id) Navigation.go(`/details/${encodeURIComponent(id)}`);
      else if (kind === "category" && id) Navigation.go(`/category/${encodeURIComponent(id)}`);
      else if (kind === "route" && id) Navigation.go(`/${id}`);
    }, { once: false });
  }

  return { wireDynamicHandlers };
})();
