import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, Output } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const ReviewSchema = z.object({
  overall_score: z.number(),
  headline: z.object({ score: z.number(), feedback: z.string(), rewrite: z.string() }),
  about: z.object({ score: z.number(), feedback: z.string(), rewrite: z.string() }),
  experience: z.object({ score: z.number(), feedback: z.string(), top_tips: z.array(z.string()) }),
  skills: z.object({ score: z.number(), feedback: z.string(), missing_skills: z.array(z.string()) }),
  visual_presence: z.object({
    score: z.number(),
    feedback: z.string(),
    issues: z.array(z.string()),
  }).optional(),
  recruiter_view: z.object({
    first_impression: z.string(),
    ats_score: z.number(),
    quick_wins: z.array(z.string()),
  }),
  summary: z.string(),
});

const CREDIT_COST = 4;

/** Fetch a public web page and extract readable text. Returns null on failure. */
async function scrapePage(url: string): Promise<{ text: string; title: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const metaDesc =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] ||
      "";

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#\d+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const combined = [metaDesc, text].filter(Boolean).join(" ");

    const looksBlocked =
      /sign in|join now|log in to linkedin|authwall|please enable javascript/i.test(combined) &&
      combined.length < 1200;

    if (looksBlocked || combined.replace(/\s/g, "").length < 400) return null;

    return { text: combined.slice(0, 12_000), title };
  } catch {
    return null;
  }
}

/** Validate a base64 data URL and return its MIME type. */
function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/i);
  if (!match) return null;
  return { mimeType: match[1].toLowerCase(), base64: match[3] };
}

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { url, target_role, screenshots } = body as {
    url?: string;
    target_role?: string;
    screenshots?: string[]; // base64 data URLs, up to 3
  };
  let { headline, about, experience, skills } = body as {
    headline?: string;
    about?: string;
    experience?: string;
    skills?: string;
  };

  let scrapedText: string | null = null;

  // Validate screenshots — max 3, must be images
  const validScreenshots: { mimeType: string; base64: string }[] = [];
  if (screenshots?.length) {
    for (const s of screenshots.slice(0, 3)) {
      const parsed = parseDataUrl(s);
      if (parsed) validScreenshots.push(parsed);
    }
  }

  // URL mode: try to scrape BEFORE touching credits
  if (url?.trim() && validScreenshots.length === 0) {
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
    try {
      new URL(normalized);
    } catch {
      return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
    }

    const scraped = await scrapePage(normalized);
    if (!scraped) {
      return NextResponse.json({
        needsManual: true,
        message:
          "We couldn't read that page automatically (LinkedIn and some sites block automated access). Paste your profile details below — or upload up to 3 screenshots of your profile instead.",
      });
    }
    scrapedText = scraped.text;
  }

  // Need at least something to review
  const hasText = !!(scrapedText || headline?.trim() || about?.trim());
  const hasImages = validScreenshots.length > 0;
  if (!hasText && !hasImages) {
    return NextResponse.json(
      {
        error:
          "Please provide a profile URL, paste your headline/About section, or upload screenshots of your profile.",
      },
      { status: 400 },
    );
  }

  // Check + deduct credits
  const { data: profile } = await sb.from("profiles").select("ai_credits").eq("id", user.id).single();
  if (!profile || profile.ai_credits < CREDIT_COST) {
    return NextResponse.json(
      { error: "Not enough credits. You need 4 credits for a profile review." },
      { status: 402 },
    );
  }

  const { error: deductError } = await sb
    .from("profiles")
    .update({ ai_credits: profile.ai_credits - CREDIT_COST })
    .eq("id", user.id)
    .gte("ai_credits", CREDIT_COST);

  if (deductError) {
    return NextResponse.json({ error: "Credit deduction failed. Please try again." }, { status: 500 });
  }

  await sb.from("ai_credit_transactions").insert({
    user_id: user.id,
    delta: -CREDIT_COST,
    tool: "linkedinReview",
    description: hasImages
      ? `Profile Review (${validScreenshots.length} screenshot${validScreenshots.length > 1 ? "s" : ""})`
      : url
      ? "Profile Review (scraped)"
      : "Profile Review (manual)",
  });

  const profileContent = scrapedText
    ? `The following is the raw text scraped from the candidate's public profile page (${url}). Parse out the headline, summary/about, experience, and skills from it:\n\n${scrapedText}`
    : [
        headline ? `HEADLINE:\n${headline}` : "",
        about ? `ABOUT:\n${about}` : "",
        experience ? `EXPERIENCE:\n${experience}` : "",
        skills ? `SKILLS:\n${skills}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

  const systemPrompt = `You are a world-class LinkedIn profile and personal-branding coach specialising in helping African tech talent land global remote roles. You score profiles objectively and give specific, actionable rewrites.

For each section, give a score out of 10 (be honest — most profiles score 4–7). Write feedback that is direct and specific, never generic. Rewrites should be ready to paste. If a section is missing from the source, score it low and explain what to add.

${hasImages ? "You are also analysing screenshots of the profile. Assess the visual_presence: profile photo quality, banner image, overall visual impression, and any layout issues visible in the screenshots." : ""}

Target role context: ${target_role || "a remote tech/finance/ops role with global companies"}.`;

  // Build the message content — text + optional images
  const userContent: any[] = [];

  if (hasImages) {
    userContent.push({
      type: "text",
      text: `Review this LinkedIn profile. I am providing ${validScreenshots.length} screenshot(s) of the profile${profileContent ? ` as well as the following extracted text:\n\n${profileContent}` : ""}. Return a structured audit.`,
    });
    for (const img of validScreenshots) {
      userContent.push({
        type: "image",
        image: `data:${img.mimeType};base64,${img.base64}`,
      });
    }
  } else {
    userContent.push({
      type: "text",
      text: `Review this professional profile and return a structured audit:\n\n${profileContent}`,
    });
  }

  const { experimental_output: review } = await generateText({
    model: "openai/gpt-4.1",
    experimental_output: Output.object({ schema: ReviewSchema }),
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  return NextResponse.json({ review });
}
