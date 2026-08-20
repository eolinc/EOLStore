/**
 * EOLStore data models
 * ---------------------
 * Thin, dependency-free helpers around the raw catalog JSON shape. Keeping
 * these separate from both the catalog service (which fetches/caches) and
 * the UI (which renders) means the catalog.json shape can evolve without
 * touching rendering code, and vice versa.
 */

/**
 * Normalizes a raw catalog record into a consistent App object.
 * Anything the UI reads should flow through here so missing/optional
 * catalog fields don't cause renderer crashes.
 */
function createApp(raw) {
  return {
    id: raw.id,
    name: raw.name,
    publisher: raw.publisher || "Unknown publisher",
    version: raw.version || "1.0.0",
    category: raw.category || "utilities",
    description: raw.description || "",
    shortDescription: raw.shortDescription || (raw.description || "").slice(0, 110),
    icon: raw.icon || { glyph: "\u25a3", bg: "#2E3192", fg: "#ffffff" },
    hero: raw.hero || { bg: "linear-gradient(135deg,#1b1f4a,#2E3192)", accent: "#ffffff" },
    screenshots: raw.screenshots || [],
    packageUrl: raw.packageUrl || "",
    size: raw.size || 0,
    releaseDate: raw.releaseDate || null,
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    ratingCount: raw.ratingCount || 0,
    downloads: raw.downloads || 0,
    tags: raw.tags || [],
    changelog: raw.changelog || [],
    minWindowsVersion: raw.minWindowsVersion || "8.1",
    architectures: raw.architectures || ["x86", "x64"],
    featured: !!raw.featured,
    featuredOrder: typeof raw.featuredOrder === "number" ? raw.featuredOrder : 999,
    price: raw.price || "Free"
  };
}

/** Formats a byte count the way the Store mockups do ("123 MB", "1.2 GB"). */
function formatSize(bytes) {
  if (!bytes || bytes <= 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  const precision = unitIndex >= 2 ? 1 : 0;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

/** Formats a download count the way the Store mockups do ("1,357", "136,511"). */
function formatCount(n) {
  if (!n) return "0";
  return n.toLocaleString("en-US");
}

/** Formats an ISO date string into a short, readable date. */
function formatDate(iso) {
  if (!iso) return "Unknown";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Renders a star string like the mockups' "\u2605\u2605\u2605\u2605\u2606" for a 0-5 rating. */
function formatStars(rating) {
  const full = Math.round(rating);
  return "\u2605".repeat(full) + "\u2606".repeat(5 - full);
}

/** Resolves the package file extension so we can show it as a badge (.appx, .msix, ...). */
function packageExtension(packageUrl) {
  const match = /\.(appxbundle|msixbundle|appx|msix)$/i.exec(packageUrl || "");
  return match ? "." + match[1].toLowerCase() : "";
}
