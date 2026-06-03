import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import legacyData from "./_legacy-data.json";

export const runtime = "nodejs";
export const maxDuration = 300;

type LegacyUser = {
  legacy_user_id: string;
  name: string | null;
  role: string;
  created_at: string | null;
  talent_profile: Record<string, any> | null;
  client_profile: Record<string, any> | null;
  verification_requests: any[];
  client_requests: any[];
  engagements: any[];
  interviews: any[];
};

const data = legacyData as Record<string, LegacyUser>;

export async function POST() {
  const sbAuth = await createClient();
  const {
    data: { user },
  } = await sbAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: prof } = await sbAuth.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!prof || prof.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "missing service role env" }, { status: 500 });
  }
  const sb = createAdminClient(url, serviceKey, { auth: { persistSession: false } });

  // Map emails -> existing supabase user ids
  const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailToId = new Map<string, string>();
  for (const u of list?.users || []) {
    if (u.email) emailToId.set(u.email.toLowerCase(), u.id);
  }

  let updatedProfiles = 0;
  let insertedResumes = 0;
  let insertedCerts = 0;
  let skippedNoUser = 0;
  const errors: { email: string; error: string }[] = [];

  for (const [emailLc, legacy] of Object.entries(data)) {
    const userId = emailToId.get(emailLc);
    if (!userId) {
      skippedNoUser++;
      continue;
    }

    const tp = legacy.talent_profile;
    const cp = legacy.client_profile;

    // Build profile patch
    const patch: Record<string, any> = { id: userId, email: emailLc, full_name: legacy.name };
    if (tp) {
      patch.phone = tp.phone ?? null;
      patch.location = tp.location ?? null;
      patch.bio = tp.bio ?? null;
      patch.primary_skill = tp.primary_skill ?? null;
      patch.role_category = tp.primary_skill ?? null;
      patch.specialization = Array.isArray(tp.secondary_skills) ? tp.secondary_skills[0] ?? null : null;
      patch.skills = Array.isArray(tp.secondary_skills) ? tp.secondary_skills : [];
      patch.secondary_skills = Array.isArray(tp.secondary_skills) ? tp.secondary_skills : [];
      patch.tools = Array.isArray(tp.tools) ? tp.tools : [];
      patch.availability = tp.availability ?? null;
      patch.portfolio_url = tp.portfolio_url ?? null;
      patch.verification_status = tp.verification_status ?? null;
      // experience_years is stored as a range string ("2-4")
      const ey = String(tp.experience_years || "");
      const num = ey.match(/\d+/)?.[0];
      if (num) patch.years_experience = parseInt(num, 10);
    }
    if (cp) {
      patch.company_name = cp.company_name ?? null;
      patch.industry = cp.industry ?? null;
      patch.tax_id = cp.tax_id ?? null;
      patch.website_url = cp.website ?? null;
      patch.location = cp.location ?? patch.location ?? null;
      patch.phone = cp.phone ?? patch.phone ?? null;
    }

    patch.legacy_snapshot = {
      legacy_user_id: legacy.legacy_user_id,
      role: legacy.role,
      legacy_created_at: legacy.created_at,
      verification_requests: legacy.verification_requests,
      client_requests: legacy.client_requests,
      engagements: legacy.engagements,
      interviews: legacy.interviews,
    };

    const { error: profileError } = await sb.from("profiles").upsert(patch, { onConflict: "id" });
    if (profileError) {
      errors.push({ email: emailLc, error: `profile: ${profileError.message}` });
      continue;
    }
    updatedProfiles++;

    // Insert resume from talent_profile.resume_url (if not already linked)
    if (tp?.resume_url) {
      const { data: existing } = await sb
        .from("talent_resumes")
        .select("id")
        .eq("user_id", userId)
        .eq("external_url", tp.resume_url)
        .maybeSingle();
      if (!existing) {
        const fileName = decodeURIComponent(String(tp.resume_url).split("/").pop() || "resume.pdf");
        const { error } = await sb.from("talent_resumes").insert({
          user_id: userId,
          title: "Legacy resume",
          external_url: tp.resume_url,
          file_name: fileName,
          is_primary: true,
          notes: "Imported from previous DeepTalent platform",
        });
        if (error) errors.push({ email: emailLc, error: `resume: ${error.message}` });
        else insertedResumes++;
      }
    }

    // Insert certifications from talent_profile.certifications [{name, url}]
    if (tp?.certifications && Array.isArray(tp.certifications)) {
      for (const c of tp.certifications) {
        const certUrl = c?.url || null;
        const certName = c?.name || "Legacy certification";
        if (!certUrl) continue;
        const { data: existing } = await sb
          .from("talent_certifications")
          .select("id")
          .eq("user_id", userId)
          .eq("external_url", certUrl)
          .maybeSingle();
        if (existing) continue;
        const fileName = decodeURIComponent(String(certUrl).split("/").pop() || "certification.pdf");
        const { error } = await sb.from("talent_certifications").insert({
          user_id: userId,
          name: certName,
          external_url: certUrl,
          file_name: fileName,
          notes: "Imported from previous DeepTalent platform",
        });
        if (error) errors.push({ email: emailLc, error: `cert: ${error.message}` });
        else insertedCerts++;
      }
    }

    // Also insert verification request docs as certifications so they show up
    if (Array.isArray(legacy.verification_requests)) {
      for (const v of legacy.verification_requests) {
        if (!v?.id_card_url) continue;
        const { data: existing } = await sb
          .from("talent_certifications")
          .select("id")
          .eq("user_id", userId)
          .eq("external_url", v.id_card_url)
          .maybeSingle();
        if (existing) continue;
        const fileName = decodeURIComponent(String(v.id_card_url).split("/").pop() || "id-card");
        await sb.from("talent_certifications").insert({
          user_id: userId,
          name: "Identity verification document",
          external_url: v.id_card_url,
          file_name: fileName,
          notes: `Verification status: ${v.status || "pending"}${v.admin_notes ? ` — ${v.admin_notes}` : ""}`,
        });
      }
    }
  }

  return NextResponse.json({
    updatedProfiles,
    insertedResumes,
    insertedCerts,
    skippedNoUser,
    errors,
    note: "Re-runs are safe; existing rows (matched by external_url) are skipped.",
  });
}
