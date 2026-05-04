export const CDN_BASE_URL = "https://cdn.nekomin.com";

export function resolveMediaUrl(key: string): string {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("/")) return key;
  return `${CDN_BASE_URL}/${key}`;
}

export function urlToMediaKey(url: string): string {
  if (url.startsWith(`${CDN_BASE_URL}/`)) return url.slice(CDN_BASE_URL.length + 1);
  return url;
}
