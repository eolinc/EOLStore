/**
 * Home page
 * ----------
 * Reproduces the mockups' homepage structure: a large featured hero with
 * vertical selectors, followed by horizontal-feeling tile rows ("Top
 * apps", "New releases") and a categories strip. All data comes from
 * CatalogService/FeaturedService - nothing here is hard-coded art.
 */
const HomePage = (function () {
  async function render() {
    const [featuredSet, topApps, newReleases, categories, allApps] = await Promise.all([
      FeaturedService.getFeaturedSet(),
      CatalogService.getTopByDownloads(6),
      CatalogService.getNewReleases(6),
      CatalogService.getCategories(),
      CatalogService.getAllApps()
    ]);

    const appsByCategory = {};
    allApps.forEach((app) => {
      (appsByCategory[app.category] = appsByCategory[app.category] || []).push(app);
    });

    const startIndex = FeaturedService.pickStartIndex(featuredSet);

    const html = `
      <div class="eol-page">
        <div id="home-hero">${HeroComponent.render(featuredSet, Math.max(startIndex, 0))}</div>

        <div class="eol-section">
          <div class="eol-section-header">
            <h2 class="eol-section-title">Top apps</h2>
            <button class="eol-see-all" data-nav="route" data-id="apps">See all</button>
          </div>
          ${TileComponent.renderTileGrid(topApps)}
        </div>

        <div class="eol-section">
          <div class="eol-section-header">
            <h2 class="eol-section-title">New releases</h2>
            <button class="eol-see-all" data-nav="route" data-id="apps">See all</button>
          </div>
          ${TileComponent.renderTileGrid(newReleases)}
        </div>

        <div class="eol-section">
          <div class="eol-section-header">
            <h2 class="eol-section-title">Browse by category</h2>
            <button class="eol-see-all" data-nav="route" data-id="categories">See all</button>
          </div>
          ${CategoryComponent.renderGrid(categories.slice(0, 6), appsByCategory)}
        </div>
      </div>`;

    function afterRender(container) {
      const heroWrap = container.querySelector("#home-hero");
      let activeIndex = Math.max(startIndex, 0);
      let rotationTimer = null;

      function paint() {
        heroWrap.innerHTML = HeroComponent.render(featuredSet, activeIndex);
      }

      function startRotation() {
        if (featuredSet.length < 2) return;
        rotationTimer = setInterval(() => {
          activeIndex = (activeIndex + 1) % featuredSet.length;
          paint();
        }, EOLConfig.featuredRotationIntervalMs);
      }

      heroWrap.addEventListener("click", (e) => {
        const selectBtn = e.target.closest("[data-hero-select]");
        if (!selectBtn) return;
        e.stopPropagation();
        const id = selectBtn.dataset.heroSelect;
        const idx = featuredSet.findIndex((a) => a.id === id);
        if (idx === -1) return;
        activeIndex = idx;
        paint();
        // manual pick resets the rotation clock so the user's choice sticks around
        if (rotationTimer) clearInterval(rotationTimer);
        startRotation();
      });

      startRotation();
      const stopCategoryShowcase = CategoryComponent.initShowcase(container);

      return function cleanup() {
        if (rotationTimer) clearInterval(rotationTimer);
        stopCategoryShowcase();
      };
    }

    return { html, afterRender };
  }

  return { render };
})();
