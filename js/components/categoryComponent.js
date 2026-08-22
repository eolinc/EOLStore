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
 * Visual style: a big Windows 95-style raised button - the same chrome
 * as the classic Start button, scaled up to comfortably hold an icon and
 * label. The icon sits in a small "well" that cycles through the hero
 * art of a few apps in that category every
 * EOLConfig.categoryShowcaseIntervalMs, so each button also shows a
 * rotating sample of what's inside - driven entirely by catalog data.
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
      <div class="eol-category-slot win95-sunken">
        <button class="eol-category-tile win95-raised" data-nav="category" data-id="${category.id}">
          <span class="eol-category-well" data-showcase-bgs="${bgsAttr}" style="background:${bgs[0]}">
            ${UI.imageWithFallback(category.icon, category.name, monogram(category), "eol-category-icon")}
          </span>
          <span class="eol-category-tile-text">
            <span class="name">${category.name}</span>
            ${count ? `<span class="count">${count} app${count === 1 ? "" : "s"}</span>` : `<span class="count">${category.tagline || ""}</span>`}
          </span>
        </button>
      </div>`;
  }

  function renderGrid(categories, appsByCategory = {}) {
    if (!categories.length) return `<p class="eol-search-hint">No categories available.</p>`;
    return `<div class="eol-category-grid">${categories
      .map((c) => renderTile(c, appsByCategory[c.id] || []))
      .join("")}</div>`;
  }

  /**
   * Starts the background-swap timers for every showcase well inside
   * `container`. Returns a cleanup function that clears them all - call
   * this from a page's afterRender and return its result (or chain it)
   * so Navigation clears timers on route change.
   */
  function initShowcase(container) {
    const timers = [];
    container.querySelectorAll("[data-showcase-bgs]").forEach((well) => {
      let bgs;
      try {
        bgs = JSON.parse(well.dataset.showcaseBgs.replace(/&quot;/g, '"'));
      } catch (e) {
        bgs = null;
      }
      if (!bgs || bgs.length < 2) return;
      let idx = 0;
      timers.push(setInterval(() => {
        idx = (idx + 1) % bgs.length;
        well.style.background = bgs[idx];
      }, EOLConfig.categoryShowcaseIntervalMs));
    });
    return () => timers.forEach(clearInterval);
  }

  return { renderTile, renderGrid, initShowcase };
})();
