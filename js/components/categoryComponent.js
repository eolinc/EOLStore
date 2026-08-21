/**
 * Category component
 * --------------------
 * Renders category tiles from catalog.json's "categories" array. Each
 * category can define its own icon via a plain image path
 * (category.icon) - nothing here hard-codes an icon; drop a PNG at that
 * path and it appears everywhere a category is shown, with no code
 * changes. Until real icons are supplied, a plain typographic monogram
 * (not an emoji or generic stock icon) stands in so the layout never
 * shows a broken image.
 *
 * Tiles also cycle through the hero art of a few apps in that category
 * every EOLConfig.categoryShowcaseIntervalMs, giving each tile the
 * "now showing App A / App B / App C" rotation - driven entirely by
 * catalog data, so it automatically reflects whatever apps are actually
 * in a category.
 */
const CategoryComponent = (function () {
  function monogram(category) {
    return `<span class="eol-category-monogram" style="background:${category.color}">${(category.name || "?").charAt(0)}</span>`;
  }

  function renderTile(category, apps = []) {
    const showcase = apps.slice(0, 5);
    const bgs = showcase.length ? showcase.map((a) => a.hero.bg) : [category.color];
    const bgsAttr = JSON.stringify(bgs).replace(/"/g, "&quot;");
    const count = apps.length;

    return `
      <button class="eol-category-tile" data-nav="category" data-id="${category.id}"
              data-showcase-bgs="${bgsAttr}"
              style="background:${bgs[0]}">
        <div class="eol-category-tile-caption">
          ${UI.imageWithFallback(category.icon, category.name, monogram(category), "eol-category-icon")}
          <span class="eol-category-tile-text">
            <span class="name">${category.name}</span>
            ${count ? `<span class="count">${count} app${count === 1 ? "" : "s"}</span>` : `<span class="count">${category.tagline || ""}</span>`}
          </span>
        </div>
      </button>`;
  }

  function renderGrid(categories, appsByCategory = {}) {
    if (!categories.length) return `<p class="eol-search-hint">No categories available.</p>`;
    return `<div class="eol-category-grid">${categories
      .map((c) => renderTile(c, appsByCategory[c.id] || []))
      .join("")}</div>`;
  }

  /**
   * Starts the background-swap timers for every showcase tile inside
   * `container`. Returns a cleanup function that clears them all - call
   * this from a page's afterRender and return its result (or chain it)
   * so Navigation clears timers on route change.
   */
  function initShowcase(container) {
    const timers = [];
    container.querySelectorAll("[data-showcase-bgs]").forEach((tile) => {
      let bgs;
      try {
        bgs = JSON.parse(tile.dataset.showcaseBgs.replace(/&quot;/g, '"'));
      } catch (e) {
        bgs = null;
      }
      if (!bgs || bgs.length < 2) return;
      let idx = 0;
      timers.push(setInterval(() => {
        idx = (idx + 1) % bgs.length;
        tile.style.background = bgs[idx];
      }, EOLConfig.categoryShowcaseIntervalMs));
    });
    return () => timers.forEach(clearInterval);
  }

  return { renderTile, renderGrid, initShowcase };
})();
