/**
 * Featured application service
 * ------------------------------
 * Owns the logic for "which apps does the hero show, and in what order".
 * The homepage UI only asks this service for a list and a starting index -
 * it never decides featured status itself, so featured selection can move
 * entirely into catalog.json (via each app's "featured"/"featuredOrder"
 * fields) without touching any rendering code.
 */
const FeaturedService = (function () {
  /** Fisher-Yates shuffle, using a supplied random source so it's testable. */
  function shuffle(array, rng = Math.random) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Returns the featured set for this homepage load: every app flagged
   * "featured" in the catalog, randomized so a different app leads the
   * hero (and the selector order shifts) on each visit. Falls back to the
   * catalog's curated order if fewer than 2 apps are featured, since
   * there's nothing meaningful to shuffle.
   */
  async function getFeaturedSet() {
    const featured = await CatalogService.getFeaturedApps();
    if (featured.length < 2) return featured;
    return shuffle(featured);
  }

  /** Picks a random starting index into a featured set, for the initial hero app. */
  function pickStartIndex(featuredSet) {
    if (!featuredSet.length) return -1;
    return Math.floor(Math.random() * featuredSet.length);
  }

  return { getFeaturedSet, pickStartIndex, shuffle };
})();
