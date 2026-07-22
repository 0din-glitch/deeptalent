import "server-only";

/**
 * Social media analytics provider layer.
 *
 * Each platform is gated behind its own env var. When a platform's credential
 * is missing, `fetchMetrics` returns { configured: false } and NO data is
 * fabricated — the UI shows a "needs API key" state.
 *
 * YouTube is fully implemented against the public Data API v3 (needs
 * YOUTUBE_API_KEY). The others are wired with the same contract and activate
 * once you add the corresponding token + finish the platform-specific call.
 */

export type Platform = "youtube" | "twitter" | "instagram" | "tiktok";

export const PLATFORMS: { key: Platform; label: string; env: string; ready: boolean }[] = [
  { key: "youtube", label: "YouTube", env: "YOUTUBE_API_KEY", ready: true },
  { key: "twitter", label: "X (Twitter)", env: "TWITTER_BEARER_TOKEN", ready: false },
  { key: "instagram", label: "Instagram", env: "INSTAGRAM_ACCESS_TOKEN", ready: false },
  { key: "tiktok", label: "TikTok", env: "TIKTOK_ACCESS_TOKEN", ready: false },
];

export type MetricsResult =
  | {
      configured: true;
      followers: number | null;
      following: number | null;
      posts: number | null;
      engagementRate: number | null;
      extra?: Record<string, unknown>;
    }
  | { configured: false; reason: string };

export function isPlatformConfigured(platform: Platform): boolean {
  const entry = PLATFORMS.find((p) => p.key === platform);
  if (!entry) return false;
  return Boolean(process.env[entry.env]);
}

export async function fetchMetrics(platform: Platform, handle: string): Promise<MetricsResult> {
  switch (platform) {
    case "youtube":
      return fetchYouTube(handle);
    case "twitter":
      return fetchTwitter(handle);
    case "instagram":
      return fetchInstagram(handle);
    case "tiktok":
      return fetchTikTok(handle);
    default:
      return { configured: false, reason: "Unknown platform." };
  }
}

// ── YouTube (Data API v3) ───────────────────────────────────────────────────
async function fetchYouTube(handle: string): Promise<MetricsResult> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { configured: false, reason: "YOUTUBE_API_KEY is not set." };

  const clean = handle.replace(/^@/, "").trim();
  const base = "https://www.googleapis.com/youtube/v3/channels?part=statistics&";

  // Try handle first, then channel id, then username.
  const attempts = [
    `${base}forHandle=@${encodeURIComponent(clean)}&key=${key}`,
    `${base}id=${encodeURIComponent(handle.trim())}&key=${key}`,
    `${base}forUsername=${encodeURIComponent(clean)}&key=${key}`,
  ];

  for (const url of attempts) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const data = await res.json();
    const stats = data.items?.[0]?.statistics;
    if (stats) {
      const subs = stats.subscriberCount ? Number(stats.subscriberCount) : null;
      const views = stats.viewCount ? Number(stats.viewCount) : null;
      const videos = stats.videoCount ? Number(stats.videoCount) : null;
      // Rough engagement proxy: avg views-per-video relative to subscriber base.
      const engagement =
        subs && views && videos ? Number((((views / videos) / subs) * 100).toFixed(2)) : null;
      return {
        configured: true,
        followers: subs,
        following: null,
        posts: videos,
        engagementRate: engagement,
        extra: { totalViews: views },
      };
    }
  }
  return { configured: false, reason: "Channel not found. Use the @handle, channel ID, or username." };
}

// ── Placeholders wired to the same contract (activate with token + call) ─────
async function fetchTwitter(_handle: string): Promise<MetricsResult> {
  if (!process.env.TWITTER_BEARER_TOKEN)
    return { configured: false, reason: "TWITTER_BEARER_TOKEN is not set." };
  // Ready to implement against the X API v2 /users/by/username endpoint.
  return { configured: false, reason: "X provider not yet enabled. Token detected — implementation pending." };
}

async function fetchInstagram(_handle: string): Promise<MetricsResult> {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN)
    return { configured: false, reason: "INSTAGRAM_ACCESS_TOKEN is not set." };
  return { configured: false, reason: "Instagram provider not yet enabled. Token detected — implementation pending." };
}

async function fetchTikTok(_handle: string): Promise<MetricsResult> {
  if (!process.env.TIKTOK_ACCESS_TOKEN)
    return { configured: false, reason: "TIKTOK_ACCESS_TOKEN is not set." };
  return { configured: false, reason: "TikTok provider not yet enabled. Token detected — implementation pending." };
}
