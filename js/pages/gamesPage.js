/**
 * Games page
 * -----------
 * Mirrors AppsPage but filtered to the "games" category, matching the
 * mockups' dedicated Games browse view.
 */
const GamesPage = (function () {
  async function render() {
    const games = await CatalogService.getAppsByCategory("games");
    const sorted = [...games].sort((a, b) => b.downloads - a.downloads);

    const html = `
      <div class="eol-page">
        <div class="eol-page-header">
          <h1 class="eol-title">Games</h1>
        </div>
        <div class="eol-section">
          <div class="eol-section-header">
            <h2 class="eol-section-title">All games</h2>
            <span class="eol-subtitle">${games.length} games</span>
          </div>
          ${TileComponent.renderTileGrid(sorted)}
        </div>
      </div>`;
    return html;
  }
  return { render };
})();
