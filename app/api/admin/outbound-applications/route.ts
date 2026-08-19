import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/outbound-applications — list outbound applications with a
// summary of the salary economics (market rate vs. DeepTalent -30% rate).
export async function GET() {
  const { ctx, response } = await requireAdmin();
  if (response) return response;

  const { data, error } = await ctx.service
    .from("outbound_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];

  // Aggregate figures for the summary cards.
  const withMarket = rows.filter((r: any) => typeof r.market_salary_usd === "number");
  const totalMarket = withMarket.reduce((s: number, r: any) => s + (r.market_salary_usd || 0), 0);
  const totalDt = withMarket.reduce((s: number, r: any) => s + (r.dt_rate_usd || 0), 0);
  const summary = {
    total: rows.length,
    uniqueApplicants: new Set(rows.map((r: any) => r.applicant_email || r.id)).size,
    matched: rows.filter((r: any) => r.matched_role_id).length,
    totalMarketMonthlyUsd: totalMarket,
    totalDtMonthlyUsd: totalDt,
    totalMonthlySavingsUsd: totalMarket - totalDt,
  };

  return NextResponse.json({ rows, summary });
}
