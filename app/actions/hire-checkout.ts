"use server";

import { headers } from "next/headers";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { isSeniority, priceForRoleLevel } from "@/lib/salary/scale";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type HireQuote = {
  inquiryId: string;
  company: string;
  roleLabel: string;
  roleTitle: string | null;
  roleCategory: string | null;
  level: "junior" | "mid" | "senior";
  levelLabel: string;
  amountUsd: number;
};

export type HireInquiryInput = {
  user_id?: string | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  team_size?: string | null;
  role_category?: string | null;
  role_title?: string | null;
  urgency?: string | null;
  // The selected seniority level — the monthly amount is always recomputed
  // from the salary scale at checkout, never trusted from the client.
  level?: string | null;
  notes?: string | null;
};

/**
 * Insert a company inquiry server-side using the service-role client. This
 * bypasses RLS safely (the insert is validated here) and returns the new id,
 * which the client needs to start checkout. Doing this server-side avoids the
 * RLS returning-select restriction that blocks reading the row back as anon.
 */
export async function submitHireInquiry(
  input: HireInquiryInput
): Promise<{ id: string } | { error: string }> {
  if (!input.company_name?.trim() || !input.contact_name?.trim() || !input.email?.trim()) {
    return { error: "Please fill in your company, name, and email." };
  }

  const sb = adminClient();
  const { data, error } = await sb
    .from("company_inquiries")
    .insert({
      user_id: input.user_id ?? null,
      company_name: input.company_name,
      contact_name: input.contact_name,
      email: input.email,
      phone: input.phone || null,
      website: input.website || null,
      team_size: input.team_size || null,
      role_category: input.role_category || null,
      role_title: input.role_title || null,
      urgency: input.urgency || null,
      budget_range: input.level || null,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message || "Could not submit your inquiry. Please try again." };
  }
  return { id: data.id };
}

/**
 * Securely resolve the monthly amount for an inquiry. The price is always
 * recomputed server-side from the canonical salary scale using the role +
 * level stored on the inquiry, so it can never be tampered with by the client.
 */
export async function getHireQuote(inquiryId: string): Promise<HireQuote | null> {
  if (!inquiryId) return null;
  const sb = adminClient();
  const { data, error } = await sb
    .from("company_inquiries")
    .select("id, company_name, role_title, role_category, budget_range")
    .eq("id", inquiryId)
    .maybeSingle();

  if (error || !data) return null;

  const level = (data.budget_range || "").toLowerCase();
  if (!isSeniority(level)) return null;

  const priced = priceForRoleLevel({
    roleTitle: data.role_title,
    roleCategory: data.role_category,
    level,
  });
  if (!priced) return null;

  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

  return {
    inquiryId: data.id,
    company: data.company_name || "Your company",
    roleLabel: priced.row.label,
    roleTitle: data.role_title,
    roleCategory: data.role_category,
    level,
    levelLabel,
    amountUsd: priced.amountUsd,
  };
}

export async function startHireCheckout(inquiryId: string) {
  const quote = await getHireQuote(inquiryId);
  if (!quote) {
    throw new Error("We couldn't determine a price for this role. Please contact us.");
  }

  const priced = priceForRoleLevel({
    roleTitle: quote.roleTitle,
    roleCategory: quote.roleCategory,
    level: quote.level,
  })!;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${quote.roleLabel} · ${quote.levelLabel}`,
            description: `Monthly placement for ${quote.company} — ${quote.levelLabel} level, billed every month.`,
          },
          unit_amount: priced.amountCents,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/companies/hire/pay/success?inquiry=${quote.inquiryId}`,
    cancel_url: `${origin}/companies/hire/pay?inquiry=${quote.inquiryId}`,
    metadata: {
      inquiry_id: quote.inquiryId,
      role: quote.roleLabel,
      level: quote.level,
    },
  });

  if (!session.url) {
    throw new Error("Could not start checkout. Please try again.");
  }
  return session.url;
}
