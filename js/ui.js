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

  /**
   * Lets a horizontally-scrolling container (the Metro-style home canvas)
   * be panned with a mouse wheel (vertical wheel motion moves it
   * horizontally) or by holding the left mouse button and dragging -
   * exactly like Windows 8's Start screen/Store, which don't scroll
   * vertically at all. Touch swiping works for free via the browser's
   * native overflow-x panning, no JS needed for that part.
   * Returns a cleanup function that removes all the listeners.
   */
  function enableHorizontalPan(container) {
    function onWheel(e) {
      // Only take over when there's actually more to pan and the
      // gesture is primarily vertical (a real horizontal trackpad swipe
      // should still work normally).
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (container.scrollWidth <= container.clientWidth) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = 0;

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startScroll = container.scrollLeft;
      container.classList.add("panning");
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const delta = e.clientX - startX;
      moved = Math.max(moved, Math.abs(delta));
      container.scrollLeft = startScroll - delta;
    }
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      container.classList.remove("panning");
    }
    // A real drag (moved more than a few px) shouldn't also fire the
    // tile's click-to-navigate underneath it - swallow just that one
    // click, in the capture phase so it never reaches data-nav handlers.
    function onClickCapture(e) {
      if (moved > 6) {
        e.stopPropagation();
        e.preventDefault();
      }
      moved = 0;
    }

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("mousedown", onPointerDown);
    container.addEventListener("click", onClickCapture, true);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", endDrag);

    return function cleanup() {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("mousedown", onPointerDown);
      container.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", endDrag);
    };
  }

  return { wireDynamicHandlers, imageWithFallback, enableHorizontalPan };
})();
