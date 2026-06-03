import { NextResponse } from "next/server";
import { requireAdmin, logAuditEntry } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  let query = ctx.service
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (status && ["draft", "published", "archived"].includes(status)) {
    query = query.eq("status", status);
  }
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const explicitSlug = body.slug ? slugify(String(body.slug)) : null;
  let slug = explicitSlug || slugify(title);

  // ensure unique slug
  for (let i = 0; i < 6; i++) {
    const { data: existing } = await ctx.service
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${explicitSlug || slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const status = ["draft", "published", "archived"].includes(body.status) ? body.status : "draft";

  const { data, error } = await ctx.service
    .from("blog_posts")
    .insert({
      slug,
      title,
      excerpt: body.excerpt || null,
      content: body.content || null,
      category: body.category || null,
      cover_image_url: body.cover_image_url || null,
      status,
      read_time_minutes: body.read_time_minutes ?? null,
      published_at: status === "published" ? body.published_at || new Date().toISOString() : null,
      author_id: ctx.userId,
      author_email: ctx.email,
      author_name: ctx.email,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "blog_post.create",
    resource_type: "blog_post",
    resource_id: data.id,
    summary: `Created post "${data.title}" (${status})`,
    metadata: { slug: data.slug, status },
  });

  return NextResponse.json({ post: data });
}
