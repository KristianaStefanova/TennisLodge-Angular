export function resolvePublicAssetUrl(href: string | undefined | null): string | null {
  if (href == null) {
    return null;
  }
  const s = String(href).trim();
  if (!s) {
    return null;
  }
  if (/^https?:\/\//i.test(s)) {
    return s;
  }
  return s.startsWith('/') ? s : `/${s}`;
}
