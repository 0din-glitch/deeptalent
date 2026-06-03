import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin, logAuditEntry } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;
  const { id } = await params;

  const { data, error } = await ctx.service
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ post: data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const { data: current, error: readErr } = await ctx.service
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (readErr || !current)
    return NextResponse.json({ error: readErr?.message || "Not found" }, { status: 404 });

  const update: Record<string, any> = {};
  if (body.title !== undefined) update.title = String(body.title).trim();
  if (body.excerpt !== undefined) update.excerpt = body.excerpt || null;
  if (body.content !== undefined) update.content = body.content || null;
  if (body.category !== undefined) update.category = body.category || null;
  if (body.cover_image_url !== undefined) update.cover_image_url = body.cover_image_url || null;
  if (body.read_time_minutes !== undefined) update.read_time_minutes = body.read_time_minutes ?? null;
  if (body.slug !== undefined) update.slug = slugify(String(body.slug));

  if (body.status !== undefined && ["draft", "published", "archived"].includes(body.status)) {
    update.status = body.status;
    if (body.status === "published" && !current.published_at) {
      update.published_at = body.published_at || new Date().toISOString();
    }
    if (body.status !== "published") {
      // keep published_at if previously published, but allow override
      if (body.published_at === null) update.published_at = null;
    }
  } else if (body.published_at !== undefined) {
    update.published_at = body.published_at || null;
  }

  const { data, error } = await ctx.service
    .from("blog_posts")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "blog_post.update",
    resource_type: "blog_post",
    resource_id: id,
    summary: `Updated post "${data.title}"`,
    metadata: { changed_fields: Object.keys(update), status: data.status },
  });
  return NextResponse.json({ post: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;
  const { id } = await params;

  const { data: existing } = await ctx.service
    .from("blog_posts")
    .select("title, slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await ctx.service.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAuditEntry(ctx.service, {
    actor_id: ctx.userId,
    actor_email: ctx.email,
    action: "blog_post.delete",
    resource_type: "blog_post",
    resource_id: id,
    summary: `Deleted post "${existing?.title || id}"`,
    metadata: { slug: existing?.slug || null },
  });
  return NextResponse.json({ success: true });
}
