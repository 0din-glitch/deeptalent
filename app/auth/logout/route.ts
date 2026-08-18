import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Signs the current user out and returns them to the home page.
 * Handles both GET (link click from the admin sidebar / nav) and POST.
 */
async function handle(request: Request) {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore — we still want to bounce the user home even if the
    // session was already invalid.
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
