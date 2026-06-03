import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { bucket, path } -> { url } — short-lived signed URL for admins.
export async function POST(request: Request) {
  const sbAuth = await createServerClient();
  const { data: userData } = await sbAuth.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await sbAuth
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { bucket?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const bucket = body.bucket?.trim();
  const path = body.path?.trim();
  if (!bucket || !path) {
    return NextResponse.json({ error: "bucket and path are required" }, { status: 400 });
  }

  // External URLs (legacy resumes pointing at Tigris/etc.) just pass through.
  if (/^https?:\/\//i.test(path)) {
    return NextResponse.json({ url: path });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Public bucket → public URL; otherwise signed URL.
  if (bucket === "avatars") {
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  }

  const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, 60 * 10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
