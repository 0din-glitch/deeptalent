import { NextResponse } from "next/server";

const CHANNEL_ID = "UChLDSerUzrbEXHSp0VFpTqw";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

// Cache the feed on the server for an hour; YouTube RSS updates infrequently.
export const revalidate = 3600;

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  published: string;
  isShort: boolean;
  url: string;
};

function decode(str: string) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function parseFeed(xml: string): { channelTitle: string; videos: Video[] } {
  const channelTitle = decode(xml.match(/<title>([^<]+)<\/title>/)?.[1] ?? "DeepTalent Platform");
  const entries = xml.split("<entry>").slice(1);
  const videos: Video[] = [];

  for (const entry of entries) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    if (!id) continue;
    const title = decode(entry.match(/<media:title>([^<]+)<\/media:title>/)?.[1] ?? entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? "Untitled");
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
    const link = entry.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? `https://www.youtube.com/watch?v=${id}`;
    const isShort = link.includes("/shorts/");
    videos.push({
      id,
      title,
      published,
      isShort,
      url: link,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  }

  return { channelTitle, videos };
}

export async function GET() {
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DeepTalentBot/1.0)" },
      next: { revalidate },
    });
    if (!res.ok) {
      return NextResponse.json({ channelTitle: "DeepTalent Platform", videos: [], channelUrl: `https://www.youtube.com/channel/${CHANNEL_ID}` });
    }
    const xml = await res.text();
    const { channelTitle, videos } = parseFeed(xml);
    return NextResponse.json({
      channelTitle,
      channelUrl: `https://www.youtube.com/channel/${CHANNEL_ID}`,
      videos: videos.slice(0, 8),
    });
  } catch {
    return NextResponse.json({ channelTitle: "DeepTalent Platform", videos: [], channelUrl: `https://www.youtube.com/channel/${CHANNEL_ID}` });
  }
}
