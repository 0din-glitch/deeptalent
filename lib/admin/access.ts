import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPER_ADMIN_EMAILS = [
  "adedayo.setro@deeptalentplatform.com",
  "admin@deeptalentplatform.com",
];

export const ADMIN_EMAILS = [
  ...SUPER_ADMIN_EMAILS,
  "osazuwa.emmanuel@deeptalentplatform.com",
  "joke.toluwani@deeptalentplatform.com",
  "opeyemi.ibrahim@deeptalentplatform.com",
];

export type AdminContext = {
  userId: string;
  email: string;
  role: "admin";
  isSuperAdmin: boolean;
  service: SupabaseClient;
};

export function createServiceClient(): SupabaseClient {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Resolves the calling admin from the active Supabase session.
 * Returns either { ctx } on success or { response } with a NextResponse to return immediately.
 */
export async function requireAdmin(): Promise<
  | { ctx: AdminContext; response?: undefined }
  | { ctx?: undefined; response: NextResponse }
> {
  const sb = await createServerClient();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role, is_super_admin, email, suspended_at")
    .eq("id", userData.user.id)
    .single();

  const email = (profile?.email || userData.user.email || "").toLowerCase();
  const isAdmin =
    profile?.role === "admin" || ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);
  if (!isAdmin) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (profile?.suspended_at) {
    return {
      response: NextResponse.json(
        { error: "Your account is suspended. Contact a super admin." },
        { status: 403 }
      ),
    };
  }

  const isSuperAdmin =
    profile?.is_super_admin === true ||
    SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email);

  return {
    ctx: {
      userId: userData.user.id,
      email: userData.user.email || profile?.email || "",
      role: "admin",
      isSuperAdmin,
      service,
    },
  };
}

export async function requireSuperAdmin() {
  const result = await requireAdmin();
  if (result.response) return result;
  if (!result.ctx.isSuperAdmin) {
    return {
      response: NextResponse.json(
        { error: "Super admin permission required for this action." },
        { status: 403 }
      ),
    };
  }
  return result;
}

/**
 * Append an entry to admin_audit_log. Best-effort: errors are swallowed
 * so they never block the underlying admin action.
 */
export async function logAuditEntry(
  service: SupabaseClient,
  entry: {
    actor_id: string | null;
    actor_email: string | null;
    action: string;
    resource_type?: string | null;
    resource_id?: string | null;
    summary?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await service.from("admin_audit_log").insert({
      actor_id: entry.actor_id,
      actor_email: entry.actor_email,
      action: entry.action,
      resource_type: entry.resource_type ?? null,
      resource_id: entry.resource_id ?? null,
      summary: entry.summary ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    console.error("[audit-log] insert failed", err);
  }
}
