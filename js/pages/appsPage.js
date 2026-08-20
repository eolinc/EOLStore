/**
 * Apps page
 * ----------
 * The Store's general "Apps" section - every catalog item that isn't
 * filed under Games, arranged the same way as the mockups' browse grids.
 */
const AppsPage = (function () {
  async function render() {
    const apps = await CatalogService.getAllApps();
    const nonGames = apps.filter((a) => a.category !== "games");
    const topFree = [...nonGames].sort((a, b) => b.downloads - a.downloads);

    const html = `
      <div class="eol-page">
        <div class="eol-page-header">
          <h1 class="eol-title">Apps</h1>
        </div>
        <div class="eol-section">
          <div class="eol-section-header">
            <h2 class="eol-section-title">All apps</h2>
            <span class="eol-subtitle">${nonGames.length} apps</span>
          </div>
          ${TileComponent.renderTileGrid(topFree)}
        </div>
      </div>`;
    return html;
  }
  return { render };
})();
