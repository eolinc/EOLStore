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

  document.addEventListener("DOMContentLoaded", () => {
    registerRoutes();
    wireHeaderSearch();
    wireBrand();
    Navigation.init({
      main: document.getElementById("eol-main"),
      headerNav: document.getElementById("eol-nav")
    });
  });
})();
