/**
 * App bootstrap
 * ---------------
 * The only file that knows about all the page modules at once. Registers
 * every route with Navigation, wires the always-visible header search
 * box, and starts the router. Nothing else in the project needs to change
 * when a new page/route is added - just write the page module and add one
 * line here.
 */
(function () {
  function registerRoutes() {
    Navigation.register("home", HomePage.render);
    Navigation.register("apps", AppsPage.render);
    Navigation.register("games", GamesPage.render);
    Navigation.register("categories", CategoriesPage.render);
    Navigation.register("category", CategoryDetailPage.render);
    Navigation.register("search", SearchPage.render);
    Navigation.register("myapps", MyAppsPage.render);
    Navigation.register("details", DetailsPage.render);
  }

  function wireHeaderSearch() {
    const form = document.getElementById("header-search-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = form.elements.q.value.trim();
      Navigation.go(`/search?q=${encodeURIComponent(value)}`);
      form.elements.q.value = "";
    });
  }

  function wireBrand() {
    document.getElementById("brand-home-link").addEventListener("click", () => Navigation.go("/home"));
  }

  /**
   * Applies the configured store background image if (and only if) it
   * actually exists. Preloading it first means a missing file silently
   * keeps the existing diagonal Metro backdrop instead of showing a
   * broken/blank background - swap the file at EOLConfig.assets.background
   * and this picks it up automatically.
   */
  function wireBackground() {
    const probe = new Image();
    probe.onload = () => {
      const main = document.getElementById("eol-main");
      main.classList.add("has-store-background");
      main.style.backgroundImage =
        `linear-gradient(rgba(10,12,30,0.72), rgba(10,12,30,0.8)), url("${EOLConfig.assets.background}")`;
    };
    probe.src = EOLConfig.assets.background;
  }

  function wireAudioToggle() {
    const btn = document.getElementById("eol-audio-toggle");
    if (!btn) return;
    AudioService.init();

    function paint(isOn) {
      btn.classList.toggle("on", isOn);
      btn.setAttribute("aria-pressed", String(isOn));
      btn.title = isOn ? "Store music: on" : "Store music: off";
    }

    btn.addEventListener("click", async () => {
      const isOn = await AudioService.toggle();
      paint(isOn);
    });

    paint(AudioService.isEnabled());
  }

  document.addEventListener("DOMContentLoaded", () => {
    registerRoutes();
    wireHeaderSearch();
    wireBrand();
    wireBackground();
    wireAudioToggle();
    Navigation.init({
      main: document.getElementById("eol-main"),
      headerNav: document.getElementById("eol-nav")
    });
  });
})();
