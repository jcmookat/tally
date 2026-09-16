// Slugs that would collide with a real top-level route or a static
// file served from /public — a board can never take one of these.
export const RESERVED_SLUGS = new Set([
  "api",
  "icon",
  "apple-icon",
  "icon-192.png",
  "icon-512.png",
  "icon-512-maskable.png",
  "manifest.webmanifest",
  "offline.html",
  "sw.js",
  "favicon.ico",
  "_next",
]);

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
