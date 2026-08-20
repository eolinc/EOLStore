/**
 * EOLStore configuration
 * -----------------------
 * Centralizes everything environment-specific so the rest of the app never
 * hard-codes a data source. To point the store at a real IIS deployment,
 * change CATALOG_URL to something like:
 *
 *   "https://your-server/catalog.json"
 *
 * Everything else (models, services, UI) is agnostic to where the JSON
 * came from.
 */
const EOLConfig = Object.freeze({
  storeName: "EOLStore",
  storeTagline: "Everyoneonline",

  // Local first-version catalog. Swap for an absolute IIS URL later, e.g.
  // "https://store.example.com/catalog.json"
  catalogUrl: "data/catalog.json",

  // Root apps/ and images/ folders on the eventual IIS server. Package and
  // image paths in catalog.json are resolved relative to this when they
  // are not already absolute URLs.
  assetRoot: "",

  // How often (ms) the homepage hero should auto-advance to the next
  // featured application. Sits comfortably slower than a human deciding
  // to click a selector.
  featuredRotationIntervalMs: 6000,

  // Supported future Windows package types, in order of preference.
  supportedPackageTypes: [".appxbundle", ".msixbundle", ".appx", ".msix"],

  // Minimum Windows version this build targets. Kept explicit so nothing
  // downstream quietly assumes a Windows 10/11-only API.
  targetWindowsVersion: "8.1",

  // Local storage keys used to fake "installed app" state on the website.
  // The future APPX client replaces this with real package APIs.
  storageKeys: {
    myApps: "eolstore.myApps.v1",
    featuredSeed: "eolstore.featuredSeed.v1"
  }
});
