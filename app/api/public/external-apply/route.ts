import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { outboundEconomics } from "@/lib/salary/scale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Count approved in-network talents whose role matches the given SALARY_SCALE
 * role id. Best-effort: returns 0 if the query fails.
 */
async function countInNetwork(
  sb: ReturnType<typeof serviceClient>,
  roleLabel: string | null,
  roleAliases: string[]
): Promise<number> {
  if (!roleLabel) return 0;
  try {
    // Approved talents live in talent_applications with status 'approved'.
    const { data } = await sb
      .from("talent_applications")
      .select("id, role_category, specialization, inferred_role, status")
      .eq("status", "approved")
      .limit(500);
    if (!data) return 0;
    const needles = [roleLabel.toLowerCase(), ...roleAliases.map((a) => a.toLowerCase())];
    return data.filter((r: any) => {
      const hay = `${r.role_category || ""} ${r.specialization || ""} ${r.inferred_role || ""}`.toLowerCase();
      return needles.some((n) => n.length >= 3 && hay.includes(n));
    }).length;
  } catch {
    return 0;
  }
}

/**
 * GET /api/public/external-apply?title=...&category=...&salary=...
 * Returns the in-network alternative (matched role, DeepTalent -30% rate,
 * available talent count) WITHOUT recording anything. Used to preview the
 * alternative before the user commits to applying.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const category = searchParams.get("category");
  const salary = searchParams.get("salary");

  const econ = outboundEconomics({ title, category, statedSalaryText: salary });
  const sb = serviceClient();
  const inNetworkCount = await countInNetwork(
    sb,
    econ.row?.label ?? null,
    econ.row?.aliases ?? []
  );

  return NextResponse.json({
    matchedRole: econ.row ? { id: econ.row.id, label: econ.row.label } : null,
    marketSalaryUsd: econ.marketMonthlyUsd,
    dtRateUsd: econ.dtMonthlyUsd,
    inNetworkCount,
  });
}

/**
 * POST /api/public/external-apply
 * Records an outbound application (a talent applying to a job outside the
 * DeepTalent network) and returns the in-network alternative to surface to
 * the user. Writes via the service role so it works for anonymous visitors.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    externalJobId,
    title,
    company,
    source,
    url,
    location,
    category,
    salary,
    name,
    email,
    viaDeepTalent,
  } = body || {};

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Resolve the applicant from the session when available; fall back to any
  // name/email supplied in the body (anonymous visitors).
  let applicantUserId: string | null = null;
  let applicantName: string | null = typeof name === "string" ? name : null;
  let applicantEmail: string | null = typeof email === "string" ? email : null;
  try {
    const authed = await createServerClient();
    const { data: userData } = await authed.auth.getUser();
    if (userData.user) {
      applicantUserId = userData.user.id;
      applicantEmail = applicantEmail || userData.user.email || null;
      const { data: profile } = await authed
        .from("profiles")
        .select("full_name, email")
        .eq("id", userData.user.id)
        .single();
      applicantName = applicantName || profile?.full_name || null;
      applicantEmail = applicantEmail || profile?.email || null;
    }
  } catch {
    // ignore — anonymous application
  }

  const econ = outboundEconomics({ title, category, statedSalaryText: salary });
  const sb = serviceClient();
  const inNetworkCount = await countInNetwork(
    sb,
    econ.row?.label ?? null,
    econ.row?.aliases ?? []
  );

  const { error } = await sb.from("outbound_applications").insert({
    applicant_user_id: applicantUserId,
    applicant_name: applicantName,
    applicant_email: applicantEmail,
    external_job_id: externalJobId ?? null,
    external_title: title,
    external_company: company ?? null,
    external_source: source ?? null,
    external_url: url ?? null,
    external_location: location ?? null,
    external_category: category ?? null,
    matched_role_id: econ.row?.id ?? null,
    matched_role_label: econ.row?.label ?? null,
    market_salary_usd: econ.marketMonthlyUsd,
    dt_rate_usd: econ.dtMonthlyUsd,
    in_network_count: inNetworkCount,
    via_deeptalent: viaDeepTalent === true,
  });

  if (error) {
    console.log("[v0] outbound-apply insert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    matchedRole: econ.row ? { id: econ.row.id, label: econ.row.label } : null,
    marketSalaryUsd: econ.marketMonthlyUsd,
    dtRateUsd: econ.dtMonthlyUsd,
    inNetworkCount,
  });
}
