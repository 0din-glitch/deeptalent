"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitHireInquiry } from "@/app/actions/hire-checkout";
import { SiteFooter } from "@/components/site/site-footer";
import { SENIORITY_LEVELS, priceForRoleLevel, SALARY_SCALE, type Seniority } from "@/lib/salary/scale";
import { Loader2, CheckCircle2, Wallet, ShieldCheck } from "lucide-react";

const ROLE_CATEGORIES = [
  "Finance, Accounting & Compliance",
  "Engineering & Cloud",
  "Data & AI",
  "Cybersecurity & Risk",
  "Executive & Business Operations",
  "Customer Experience & Support",
  "Other",
];

const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
const URGENCY = ["Immediate", "Within 30 days", "1-3 months", "Exploring options"];

export default function CompanyHirePage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    team_size: "",
    role_category: "",
    role_title: "",
    urgency: "",
    level: "" as "" | Seniority,
    notes: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Live monthly quote derived from the selected role + level. The same figure
  // is recomputed server-side at checkout so it can never be tampered with.
  const quote =
    form.level && (form.role_title || form.role_category)
      ? priceForRoleLevel({
          roleTitle: form.role_title,
          roleCategory: form.role_category,
          level: form.level,
        })
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    // Insert via a server action (service-role) so it isn't blocked by RLS and
    // we can reliably read back the new inquiry id to start checkout.
    const result = await submitHireInquiry({
      user_id: userData.user?.id ?? null,
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone,
      website: form.website,
      team_size: form.team_size,
      role_category: form.role_category,
      role_title: form.role_title,
      urgency: form.urgency,
      level: form.level || null,
      notes: form.notes,
    });

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // If we can price this role + level, send the company straight to payment.
    // Otherwise fall back to the standard "we'll be in touch" confirmation.
    if (quote) {
      router.push(`/companies/hire/pay?inquiry=${result.id}`);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Minimal top bar with back-to-home */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-8 w-auto" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#3B5BDB] transition-colors"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to home
          </Link>
        </div>
      </header>
      <div className="pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center">
              <div className="size-16 rounded-full bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] mx-auto mb-4">
                <CheckCircle2 className="size-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 text-balance">
                Inquiry Submitted
              </h1>
              <p className="text-gray-600 mb-8 text-pretty">
                Thanks for reaching out. A DeepTalent partner will reach out within 1 business day to discuss your hiring needs and shortlist candidates.
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex h-11 px-6 items-center justify-center rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
              >
                Back to home
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">
                  Hire Elite Talent
                </h1>
                <p className="text-gray-600 mt-3 text-pretty">
                  Tell us about your hiring needs. We&apos;ll match you with vetted candidates within 48 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-10 flex flex-col gap-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Company name" required>
                    <input
                      required
                      value={form.company_name}
                      onChange={(e) => update("company_name", e.target.value)}
                      className="form-input"
                      placeholder="Acme Inc."
                    />
                  </Field>
                  <Field label="Your name" required>
                    <input
                      required
                      value={form.contact_name}
                      onChange={(e) => update("contact_name", e.target.value)}
                      className="form-input"
                      placeholder="Jane Doe"
                    />
                  </Field>
                  <Field label="Work email" required>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="form-input"
                      placeholder="jane@acme.com"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="form-input"
                      placeholder="+1 555 123 4567"
                    />
                  </Field>
                  <Field label="Company website">
                    <input
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                      className="form-input"
                      placeholder="acme.com"
                    />
                  </Field>
                  <Field label="Team size">
                    <select
                      value={form.team_size}
                      onChange={(e) => update("team_size", e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select team size</option>
                      {TEAM_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Role" required>
                    <select
                      required
                      value={form.role_title}
                      onChange={(e) => update("role_title", e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select a role</option>
                      {SALARY_SCALE.map((r) => (
                        <option key={r.id} value={r.label}>{r.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Role category">
                    <select
                      value={form.role_category}
                      onChange={(e) => update("role_category", e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select a category</option>
                      {ROLE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Hiring urgency">
                    <select
                      value={form.urgency}
                      onChange={(e) => update("urgency", e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select urgency</option>
                      {URGENCY.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Level of expertise — drives the monthly amount the company pays */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Level of expertise <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    The monthly rate is set by the role above and the level you choose here.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SENIORITY_LEVELS.map((l) => {
                      const active = form.level === l.value;
                      const priced =
                        form.role_title || form.role_category
                          ? priceForRoleLevel({
                              roleTitle: form.role_title,
                              roleCategory: form.role_category,
                              level: l.value,
                            })
                          : null;
                      return (
                        <button
                          key={l.value}
                          type="button"
                          onClick={() => update("level", l.value)}
                          aria-pressed={active}
                          className={`text-left rounded-xl border p-4 transition-colors ${
                            active
                              ? "border-[#3B5BDB] bg-[#3B5BDB]/5 ring-1 ring-[#3B5BDB]"
                              : "border-gray-200 bg-white hover:border-[#3B5BDB]/40"
                          }`}
                        >
                          <span
                            className={`block text-sm font-semibold ${
                              active ? "text-[#3B5BDB]" : "text-gray-900"
                            }`}
                          >
                            {l.label}
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5 leading-snug">
                            {l.blurb}
                          </span>
                          {priced && (
                            <span className="block text-sm font-bold text-emerald-700 mt-2">
                              ${priced.amountUsd.toLocaleString("en-US")}/mo
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {quote ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 flex items-start gap-3">
                    <div className="size-9 rounded-lg bg-white border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Wallet className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {quote.row.label} · {form.level.charAt(0).toUpperCase() + form.level.slice(1)}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="text-xl font-extrabold text-emerald-700">
                          ${quote.amountUsd.toLocaleString("en-US")}
                        </span>{" "}
                        <span className="text-xs text-gray-500">/ month, billed monthly</span>
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 inline-flex items-center gap-1">
                        <ShieldCheck className="size-3.5 text-emerald-600" /> You&apos;ll pay securely via Stripe on the next step.
                      </p>
                    </div>
                  </div>
                ) : form.level ? (
                  <p className="text-xs text-gray-500">
                    Enter a role title or category above and we&apos;ll calculate your monthly rate. If we can&apos;t match it automatically, a partner will follow up with a custom quote.
                  </p>
                ) : null}

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto md:self-end h-12 px-8 inline-flex items-center justify-center rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : quote ? (
                    "Continue to payment"
                  ) : (
                    "Submit inquiry"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
