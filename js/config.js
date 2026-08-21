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

  // ---- Branding / visual asset paths ----------------------------------
  // Every path below is the ONLY place that needs to change to swap an
  // asset. Drop a new file at the same path (same filename) and nothing
  // else in the project needs to be touched. If a file is missing, the UI
  // falls back gracefully instead of breaking (see ui.js/imageWithFallback).
  assets: {
    // Official EOLStore logo. Not yet supplied - drop the file here and
    // it will automatically replace the text-mark fallback in the header.
    logo: "assets/branding/eolstore-logo.png",

    // Main store background image, shown behind every page with a dark
    // overlay for readability.
    background: "assets/backgrounds/store-background.jpg",

    // Category icon folder. Expected filename per category: "<id>.png"
    // e.g. assets/categories/games.png for the "games" category.
    categoryIconFolder: "assets/categories/",

    // Optional custom store theme loop. If this file exists it is used
    // as-is (looped). If it's missing, the store falls back to a short
    // original synthesized theme so the "background music" feature works
    // out of the box without depending on any specific track.
    themeMusic: "assets/audio/store-theme.mp3"
  },

  // How often (ms) the homepage hero should auto-advance to the next
  // featured application. Sits comfortably slower than a human deciding
  // to click a selector.
  featuredRotationIntervalMs: 6000,

  // How often (ms) a category tile's showcase art cycles to the next app
  // in that category (Categories page + home "Browse by category").
  categoryShowcaseIntervalMs: 3200,

  // Supported future Windows package types, in order of preference.
  supportedPackageTypes: [".appxbundle", ".msixbundle", ".appx", ".msix"],

  // Minimum Windows version this build targets. Kept explicit so nothing
  // downstream quietly assumes a Windows 10/11-only API.
  targetWindowsVersion: "8.1",

  // Local storage keys used to fake "installed app" state on the website.
  // The future APPX client replaces this with real package APIs.
  storageKeys: {
    myApps: "eolstore.myApps.v1",
    featuredSeed: "eolstore.featuredSeed.v1",
    audioEnabled: "eolstore.audioEnabled.v1"
  }
});
