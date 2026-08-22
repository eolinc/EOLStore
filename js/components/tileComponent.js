/**
 * Tile components
 * ----------------
 * Small, pure render functions that turn an App into an HTML string. Every
 * page (home, category, search, my apps) builds its grids out of these so
 * the tile's markup and click wiring only exist in one place.
 *
 * Visual style: each tile is a Windows 95-style raised 3D button
 * (.win95-raised, see metro.css) with the app's own art shown as a
 * smaller centered "chip" - the button chrome stays neutral grey, the
 * chip carries the per-app color/icon, so the whole grid still reads as
 * a proper Store while matching the requested beveled-button look.
 */
const TileComponent = (function () {
  /** Small square Win95-button tile - used in dense grids (home rows, category browse). */
  function renderTile(app) {
    const priceBadge = app.price && app.price !== "Free"
      ? `<span class="eol-tile-price">${app.price}</span>`
      : "";
    return `
      <button class="eol-tile win95-raised" data-nav="details" data-id="${app.id}" aria-label="${app.name}">
        <div class="eol-tile-art">
          <span class="eol-tile-chip" style="background:${app.icon.bg};color:${app.icon.fg}">${app.icon.glyph}</span>
          ${priceBadge}
        </div>
        <div class="eol-tile-body">
          <p class="eol-tile-name">${app.name}</p>
          <div class="eol-tile-sub">
            <span>${app.price === "Free" ? "Free" : app.price}</span>
            <span class="eol-stars" aria-hidden="true">${formatStars(app.rating)}</span>
          </div>
        </div>
      </button>`;
  }

  /** Wider list-style card with description - used on search results and category detail. */
  function renderListCard(app) {
    return `
      <button class="eol-list-card win95-raised" data-nav="details" data-id="${app.id}" aria-label="${app.name}">
        <div class="eol-tile-art">
          <span class="eol-tile-chip" style="background:${app.icon.bg};color:${app.icon.fg}">${app.icon.glyph}</span>
        </div>
        <div class="eol-list-card-body">
          <div class="eol-list-card-name">${app.name}</div>
          <div class="eol-list-card-desc">${app.shortDescription}</div>
          <div class="eol-tile-sub">
            <span class="eol-stars" aria-hidden="true">${formatStars(app.rating)}</span>
            <span>${formatCount(app.ratingCount)}</span>
            <span>&middot;</span>
            <span>${app.price}</span>
          </div>
        </div>
      </button>`;
  }

  function renderTileGrid(apps, { compact = false } = {}) {
    if (!apps.length) return `<p class="eol-search-hint">No applications to show.</p>`;
    return `<div class="eol-tile-grid ${compact ? "compact" : ""}">${apps.map(renderTile).join("")}</div>`;
  }

  function renderListGrid(apps) {
    if (!apps.length) return `<p class="eol-search-hint">No applications found.</p>`;
    return `<div class="eol-list-grid">${apps.map(renderListCard).join("")}</div>`;
  }

  return { renderTile, renderListCard, renderTileGrid, renderListGrid };
})();
