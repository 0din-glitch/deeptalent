import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LegacyFileLite = {
  bucket: string;
  storage_path: string;
  file_name: string;
  size_bytes: number | null;
  content_type: string | null;
  source: "legacy" | "resume" | "certification";
};

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  if (kind !== "talent_application" && kind !== "company_inquiry") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const table = kind === "talent_application" ? "talent_applications" : "company_inquiries";
  const { data, error } = await sb
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows: any[] = data ?? [];

  // ---------------------------------------------------------------------------
  // Enrich talent applications with the user's files + an inferred role.
  //
  //   talent_applications.user_id  ──►  profiles.id
  //                       OR ─emails─►  profiles.email
  //                                     │
  //                                     ▼
  //              profiles.legacy_snapshot->>'legacy_user_id'
  //                                     │
  //                                     ▼
  //                         legacy_files.legacy_user_ref
  //                         talent_resumes.user_id
  //                         talent_certifications.user_id
  // ---------------------------------------------------------------------------
  if (kind === "talent_application" && rows.length) {
    const userIds = Array.from(
      new Set(rows.map((r) => r.user_id).filter(Boolean))
    ) as string[];
    const emails = Array.from(
      new Set(rows.map((r) => (r.email ? String(r.email).toLowerCase() : null)).filter(Boolean))
    ) as string[];

    // profiles by id
    const profilesById = new Map<string, any>();
    if (userIds.length) {
      const { data: profs } = await sb
        .from("profiles")
        .select("id,email,role_category,primary_skill,specialization,legacy_snapshot")
        .in("id", userIds);
      for (const p of profs ?? []) profilesById.set(p.id, p);
    }
    // profiles by email (fallback for anon submitters)
    const profilesByEmail = new Map<string, any>();
    if (emails.length) {
      const { data: profs2 } = await sb
        .from("profiles")
        .select("id,email,role_category,primary_skill,specialization,legacy_snapshot")
        .in("email", emails);
      for (const p of profs2 ?? []) {
        if (p.email) profilesByEmail.set(String(p.email).toLowerCase(), p);
      }
    }

    // Resolve every row to a profile + legacy_user_ref
    const resolvedProfileIds = new Set<string>();
    const legacyRefs = new Set<string>();
    const rowMeta = rows.map((r) => {
      const p =
        (r.user_id && profilesById.get(r.user_id)) ||
        (r.email && profilesByEmail.get(String(r.email).toLowerCase())) ||
        null;
      const legacyRef: string | null =
        (p?.legacy_snapshot && p.legacy_snapshot.legacy_user_id) || null;
      if (p?.id) resolvedProfileIds.add(p.id);
      if (legacyRef) legacyRefs.add(legacyRef);
      return { row: r, profile: p, legacyRef };
    });

    // Pull legacy files keyed by legacy_user_ref
    const legacyByRef = new Map<string, LegacyFileLite[]>();
    if (legacyRefs.size) {
      const { data: lf } = await sb
        .from("legacy_files")
        .select("legacy_user_ref,bucket,storage_path,file_name,size_bytes,content_type")
        .in("legacy_user_ref", Array.from(legacyRefs));
      for (const f of lf ?? []) {
        if (!f.legacy_user_ref) continue;
        const list = legacyByRef.get(f.legacy_user_ref) ?? [];
        list.push({
          bucket: f.bucket,
          storage_path: f.storage_path,
          file_name: f.file_name,
          size_bytes: f.size_bytes,
          content_type: f.content_type,
          source: "legacy",
        });
        legacyByRef.set(f.legacy_user_ref, list);
      }
    }

    // Pull uploaded resumes/certifications keyed by user_id
    const resumesByUser = new Map<string, LegacyFileLite[]>();
    const certsByUser = new Map<string, LegacyFileLite[]>();
    if (resolvedProfileIds.size) {
      const ids = Array.from(resolvedProfileIds);
      const [{ data: rzm }, { data: crt }] = await Promise.all([
        sb
          .from("talent_resumes")
          .select("user_id,file_path,file_name,file_size_bytes,mime_type,external_url,is_primary")
          .in("user_id", ids),
        sb
          .from("talent_certifications")
          .select("user_id,file_path,file_name,external_url,name")
          .in("user_id", ids),
      ]);
      for (const r of rzm ?? []) {
        if (!r.user_id) continue;
        const list = resumesByUser.get(r.user_id) ?? [];
        list.push({
          bucket: r.file_path ? "talent-documents" : "external",
          storage_path: r.file_path || r.external_url || "",
          file_name: r.file_name || "Resume",
          size_bytes: r.file_size_bytes ?? null,
          content_type: r.mime_type ?? null,
          source: "resume",
        });
        resumesByUser.set(r.user_id, list);
      }
      for (const c of crt ?? []) {
        if (!c.user_id) continue;
        const list = certsByUser.get(c.user_id) ?? [];
        list.push({
          bucket: c.file_path ? "talent-documents" : "external",
          storage_path: c.file_path || c.external_url || "",
          file_name: c.file_name || c.name || "Certification",
          size_bytes: null,
          content_type: null,
          source: "certification",
        });
        certsByUser.set(c.user_id, list);
      }
    }

    // Stitch onto rows; also infer role applied for if missing.
    rows = rowMeta.map(({ row, profile: p, legacyRef }) => {
      const files: LegacyFileLite[] = [];
      if (legacyRef && legacyByRef.has(legacyRef)) files.push(...legacyByRef.get(legacyRef)!);
      if (p?.id) {
        if (resumesByUser.has(p.id)) files.push(...resumesByUser.get(p.id)!);
        if (certsByUser.has(p.id)) files.push(...certsByUser.get(p.id)!);
      }

      // Infer "applied for" — the application row itself is the source of truth,
      // but if specialization/role_category are blank we fall back to the
      // user's profile / legacy snapshot so admins can still see what they applied for.
      const legacySnap = p?.legacy_snapshot ?? null;
      const legacyTalent = legacySnap?.talent_profile ?? null;
      const lastClientRequest =
        Array.isArray(legacySnap?.client_requests) && legacySnap.client_requests.length
          ? legacySnap.client_requests[legacySnap.client_requests.length - 1]
          : null;

      const inferredRole =
        row.specialization ||
        row.role_category ||
        p?.specialization ||
        p?.role_category ||
        p?.primary_skill ||
        legacyTalent?.primary_skill ||
        lastClientRequest?.title ||
        null;

      return {
        ...row,
        files,
        inferred_role: inferredRole,
        legacy_user_ref: legacyRef,
        profile_id: p?.id ?? null,
      };
    });
  }

  return NextResponse.json({ rows });
}
