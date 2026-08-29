/**
 * Converts any string (e.g., "Format Guides", "how to convert webp to png")
 * into a clean, URL-safe hyphenated slug (e.g., "format-guides", "how-to-convert-webp-to-png").
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars except space and hyphen
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/-+/g, '-')          // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');     // Trim leading/trailing -
}
