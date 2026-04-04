/**
 * Normalizes an asset URL to a root-relative path (e.g. "/uploads/avatars/foo.jpg").
 *
 * Problem: The database stores avatarUrl as absolute URLs such as:
 *   - "http://localhost:3333/uploads/avatars/avatar-xxx.jpg"  (from dev environment)
 *   - "https://sdm.bprbaperabatang.com/uploads/avatars/..."   (from production)
 *
 * When the page is served over HTTPS and the <img src> contains an "http://"
 * absolute URL, the browser blocks it as a Mixed Content error.
 *
 * Fix: Strip the scheme + host so only the path remains. Nginx already proxies
 * "/uploads/*" to the backend container, so a relative path works on both HTTP and HTTPS.
 */
export function normalizeAssetUrl(url: string | null | undefined, fallback = '/avatars/default-avatar.jpg'): string {
  if (!url) return fallback;

  // Already a relative path — nothing to do
  if (url.startsWith('/')) return url;

  // Strip "http://..." or "https://..." + host (and optional port) to get the path
  const match = url.match(/^https?:\/\/[^/]+(\/.*)/);
  if (match) return match[1];

  // Unknown format — return as-is (don't break data URLs or blob: URLs)
  return url;
}
