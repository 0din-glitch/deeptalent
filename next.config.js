/** @type {import('next').NextConfig} */

// Report-only CSP: logs violations without blocking, so a too-tight rule can't
// break the live site. Tighten and switch to `Content-Security-Policy` once the
// reports are clean. `connect-src` uses https: so Supabase, Resend and the AI
// Gateway keep working; Next.js emits inline hydration scripts hence the
// 'unsafe-inline' allowances on script/style.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https: wss:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
]
  .join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // App has authenticated dashboards, so block off-origin framing (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Camera + microphone are used by the AI interview flow, so allow them (self);
  // deny features the app doesn't use.
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(), browsing-topics=()',
  },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
]

module.exports = {
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
};
