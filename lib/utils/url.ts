/**
 * Normalizes a user-entered link into a safe, absolute href.
 *
 * Applicants frequently type links without a scheme (e.g. "linkedin.com/in/jane"
 * or "janedoe.dev"). Rendered as-is in an <a href>, the browser treats these as
 * RELATIVE paths, producing broken URLs like
 * `https://app.example.com/linkedin.com/in/jane`.
 *
 * This helper guarantees an absolute URL:
 *   - Existing schemes (http, https, mailto, tel) are preserved.
 *   - Protocol-relative URLs ("//host/…") get https.
 *   - Everything else is treated as an external web address and prefixed
 *     with "https://".
 *
 * Returns `null` for empty/whitespace input so callers can conditionally render.
 */
export function externalHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  // Already has a usable scheme.
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;

  // Protocol-relative — assume https.
  if (value.startsWith("//")) return `https:${value}`;

  // Bare domain / path — treat as an external web address.
  return `https://${value.replace(/^\/+/, "")}`;
}

/** True when the href points to an external site (http/https), not mailto/tel. */
export function isExternalWebHref(href: string | null | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href);
}
