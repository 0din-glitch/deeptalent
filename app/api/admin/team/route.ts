import { NextResponse } from "next/server";
import { requireAdmin, SUPER_ADMIN_EMAILS, ADMIN_EMAILS } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the roster of admin team members that can be assigned tasks.
 * Each member is tagged with a tier: "super_admin" | "admin" | "staff".
 * - super_admin: in SUPER_ADMIN_EMAILS or profiles.is_super_admin
 * - admin: known ADMIN_EMAILS (non-super) or profiles.role = 'admin'
 * - staff: any other admin-role profile
 */
export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { ctx } = auth;

  const { data: rows } = await ctx.service
    .from("profiles")
    .select("id, full_name, email, role, is_super_admin, avatar_url")
    .eq("role", "admin")
    .order("full_name", { ascending: true });

  const superSet = new Set(SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()));
  const adminSet = new Set(ADMIN_EMAILS.map((e) => e.toLowerCase()));

  const members = (rows ?? []).map((r) => {
    const email = (r.email || "").toLowerCase();
    const isSuper = r.is_super_admin === true || superSet.has(email);
    const isNamedAdmin = adminSet.has(email);
    const tier = isSuper ? "super_admin" : isNamedAdmin ? "admin" : "staff";
    return {
      id: r.id,
      name: r.full_name || r.email || "Team member",
      email: r.email,
      avatar_url: r.avatar_url || null,
      tier,
    };
  });

  return NextResponse.json({ members, me: { id: ctx.userId, email: ctx.email, isSuperAdmin: ctx.isSuperAdmin } });
}
