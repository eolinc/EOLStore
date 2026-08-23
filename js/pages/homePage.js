/**
 * Home page
 * ----------
 * A single horizontally-panning canvas, like the Windows 8/8.1 Start
 * screen and Store actually work: nothing stacks vertically below the
 * fold. The hero sits as the first "column", and Top apps / New
 * releases / Browse by category continue to its right as further
 * columns - reveal them with touch swipe, mouse wheel, or by holding the
 * left mouse button and dragging (UI.enableHorizontalPan handles the
 * wheel/drag input; touch panning is native browser behavior).
 */
const HomePage = (function () {
  async function render() {
    const [featuredSet, topApps, newReleases, categories, allApps] = await Promise.all([
      FeaturedService.getFeaturedSet(),
      CatalogService.getTopByDownloads(8),
      CatalogService.getNewReleases(8),
      CatalogService.getCategories(),
      CatalogService.getAllApps()
    ]);

    const appsByCategory = {};
    allApps.forEach((app) => {
      (appsByCategory[app.category] = appsByCategory[app.category] || []).push(app);
    });

    const startIndex = FeaturedService.pickStartIndex(featuredSet);

    function tileColumn(title, apps, seeAllRoute) {
      return `
        <section class="eol-home-col">
          <div class="eol-section-header">
            <h2 class="eol-section-title">${title}</h2>
            <button class="eol-see-all" data-nav="route" data-id="${seeAllRoute}">See all</button>
          </div>
          <div class="eol-home-col-tiles">${TileComponent.renderTileGrid(apps)}</div>
        </section>`;
    }

    const html = `
      <div class="eol-page eol-page--home">
        <div class="eol-home-scroll" id="home-scroll">
          <section class="eol-home-col eol-home-col--hero" id="home-hero">
            ${HeroComponent.render(featuredSet, Math.max(startIndex, 0))}
          </section>

          ${tileColumn("Top apps", topApps, "apps")}
          ${tileColumn("New releases", newReleases, "apps")}

          <section class="eol-home-col eol-home-col--categories">
            <div class="eol-section-header">
              <h2 class="eol-section-title">Browse by category</h2>
              <button class="eol-see-all" data-nav="route" data-id="categories">See all</button>
            </div>
            <div class="eol-home-col-categories">
              ${CategoryComponent.renderGrid(categories.slice(0, 6), appsByCategory)}
            </div>
          </section>
        </div>
      </div>`;

    function afterRender(container) {
      const scrollEl = container.querySelector("#home-scroll");
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
      const stopPan = UI.enableHorizontalPan(scrollEl);

      return function cleanup() {
        if (rotationTimer) clearInterval(rotationTimer);
        stopCategoryShowcase();
        stopPan();
      };
    }

    return { html, afterRender };
  }

  return { render };
})();
