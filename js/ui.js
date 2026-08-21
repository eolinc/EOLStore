/**
 * UI
 * ---
 * Generic, page-agnostic DOM wiring. Any element rendered anywhere in the
 * app can opt into navigation just by carrying a data-nav attribute -
 * pages don't need to attach their own click listeners for basic
 * "open this app / category" behavior.
 */
const UI = (function () {
  /**
   * Renders an <img> with a graceful fallback. If `src` 404s (e.g. a
   * category icon or the logo hasn't been dropped into /assets yet), the
   * broken image is hidden and `fallbackHtml` is shown in its place
   * instead - so missing assets never show a broken-image icon, and
   * supplying the real file later just works with no code change.
   */
  function imageWithFallback(src, altText, fallbackHtml, extraClass) {
    return `
      <span class="eol-img-fallback-wrap ${extraClass || ""}">
        <img src="${src}" alt="${altText || ""}"
             onerror="this.style.display='none'; this.parentElement.classList.add('fallback-active');" />
        <span class="eol-img-fallback-inner">${fallbackHtml}</span>
      </span>`;
  }

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

  return { wireDynamicHandlers, imageWithFallback };
})();
