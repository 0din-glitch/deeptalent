"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SiteFooter } from "@/components/site/site-footer";
import { SENIORITY_LEVELS, inferSeniority } from "@/lib/salary/scale";
import {
  Loader2,
  CheckCircle2,
  Briefcase,
  UserPlus,
  LogIn,
  X,
  ArrowLeft,
  ArrowRight,
  User,
  MapPin,
  Sparkles,
  Wallet,
  FileText,
  Globe,
} from "lucide-react";

const ROLE_CATEGORIES = [
  "Finance, Accounting & Compliance",
  "Engineering & Cloud",
  "Data & AI",
  "Cybersecurity & Risk",
  "Executive & Business Operations",
  "Customer Experience & Support",
  "Other",
];

const AVAILABILITY = ["Immediately", "Within 2 weeks", "Within 1 month", "Within 2–3 months", "Just exploring"];
const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Freelance"];
const ENGLISH_LEVELS = ["Native / Bilingual", "Fluent (C1–C2)", "Professional (B2)", "Conversational (B1)"];
const HEAR_FROM = ["LinkedIn", "Google search", "Referral", "Twitter / X", "Industry event", "DeepTalent client", "Other"];

const DRAFT_KEY = "deeptalent.apply.draft";

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role_category: string;
  specialization: string;
  seniority: string;
  years_experience: string;
  availability: string;
  work_type: string;
  english_level: string;
  expected_monthly_usd: string;
  willing_to_relocate: string;
  linkedin_url: string;
  portfolio_url: string;
  github_url: string;
  bio: string;
  hear_from: string;
  agree_terms: boolean;
};

const STEPS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "about", label: "About you", icon: User },
  { id: "role", label: "Your role", icon: Briefcase },
  { id: "details", label: "Details", icon: Sparkles },
  { id: "review", label: "Review", icon: CheckCircle2 },
];

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRoleId = searchParams.get("role_id");
  const targetRoleTitle = searchParams.get("role_title");
  const targetRoleCategory = searchParams.get("role_category");
  const targetCompany = searchParams.get("company");

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authPrompt, setAuthPrompt] = useState(false);

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    role_category: "",
    specialization: "",
    seniority: "",
    years_experience: "",
    availability: "",
    work_type: "",
    english_level: "",
    expected_monthly_usd: "",
    willing_to_relocate: "",
    linkedin_url: "",
    portfolio_url: "",
    github_url: "",
    bio: "",
    hear_from: "",
    agree_terms: false,
  });

  // Prefill role-related fields from query params (also handles deep-links from
  // the salary scale, which pass role_title + years_experience without a role_id).
  useEffect(() => {
    const yearsParam = searchParams.get("years_experience");
    if (!targetRoleId && !targetRoleTitle && !targetRoleCategory && !yearsParam) return;
    setForm((f) => ({
      ...f,
      role_category:
        targetRoleCategory && ROLE_CATEGORIES.includes(targetRoleCategory)
          ? targetRoleCategory
          : f.role_category,
      specialization: f.specialization || (targetRoleTitle ?? ""),
      years_experience: f.years_experience || (yearsParam ?? ""),
    }));
  }, [targetRoleId, targetRoleCategory, targetRoleTitle, searchParams]);

  // Prefill from the signed-in user's profile so they can skip fields they've
  // already filled in. Only fills fields that are still empty, so a restored
  // draft or role deep-link always takes precedence.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "full_name, email, phone, country, city, role_category, specialization, primary_skill, headline, years_experience, linkedin_url, portfolio_url, github_url, bio"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const p = (profile ?? {}) as Record<string, unknown>;
      const str = (v: unknown) => (typeof v === "string" ? v : "");
      const years = typeof p.years_experience === "number" ? p.years_experience : null;
      const spec = str(p.specialization) || str(p.primary_skill) || str(p.headline);
      const cat = str(p.role_category);

      setForm((f) => ({
        ...f,
        full_name: f.full_name || str(p.full_name),
        email: f.email || str(p.email) || user.email || "",
        phone: f.phone || str(p.phone),
        country: f.country || str(p.country),
        city: f.city || str(p.city),
        role_category: f.role_category || (ROLE_CATEGORIES.includes(cat) ? cat : ""),
        specialization: f.specialization || spec,
        seniority: f.seniority || (years != null ? inferSeniority(years, spec) : ""),
        years_experience: f.years_experience || (years != null ? String(years) : ""),
        linkedin_url: f.linkedin_url || str(p.linkedin_url),
        portfolio_url: f.portfolio_url || str(p.portfolio_url),
        github_url: f.github_url || str(p.github_url),
        bio: f.bio || str(p.bio),
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore draft from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setForm((f) => ({ ...f, ...parsed }));
        }
      }
    } catch {}
  }, []);

  function persistDraft(next: FormState) {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
  }
  function clearDraft() {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {}
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      persistDraft(next);
      return next;
    });
  }

  // Per-step validation
  const stepValidity = useMemo<boolean[]>(() => {
    const v0 =
      form.full_name.trim().length > 1 &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.country.trim().length > 1;
    const v1 =
      form.role_category.trim().length > 0 &&
      form.specialization.trim().length > 1 &&
      form.seniority.trim().length > 0;
    const v2 = form.bio.trim().length >= 40;
    const v3 = form.agree_terms === true;
    return [v0, v1, v2, v3];
  }, [form]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      persistDraft(form);
      setLoading(false);
      setAuthPrompt(true);
      return;
    }

    // Compose a structured "extra" block to attach to bio without
    // requiring schema changes.
    const extras: Array<[string, string]> = [];
    if (form.city) extras.push(["City", form.city]);
    if (form.seniority) {
      const lvl = SENIORITY_LEVELS.find((l) => l.value === form.seniority);
      extras.push(["Seniority level", lvl?.label ?? form.seniority]);
    }
    if (form.availability) extras.push(["Availability", form.availability]);
    if (form.work_type) extras.push(["Work type", form.work_type]);
    if (form.english_level) extras.push(["English", form.english_level]);
    if (form.expected_monthly_usd) extras.push(["Expected monthly (USD)", `$${form.expected_monthly_usd}`]);
    if (form.willing_to_relocate) extras.push(["Open to relocation", form.willing_to_relocate]);
    if (form.github_url) extras.push(["GitHub", form.github_url]);
    if (form.hear_from) extras.push(["Heard about us via", form.hear_from]);

    const extrasBlock = extras.length
      ? `\n\n---\nApplication details:\n${extras.map(([k, v]) => `• ${k}: ${v}`).join("\n")}`
      : "";

    const roleHeader =
      targetRoleId && targetCompany
        ? `Applying for: ${targetRoleTitle} @ ${targetCompany} (role_id: ${targetRoleId})\n\n`
        : "";

    const fullBio = `${roleHeader}${form.bio}${extrasBlock}`.trim();

    const { error: insertError } = await supabase.from("talent_applications").insert({
      user_id: userData.user.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      country: form.country || null,
      role_category: form.role_category || null,
      specialization: form.specialization || null,
      years_experience: form.years_experience ? Number(form.years_experience) : null,
      linkedin_url: form.linkedin_url || null,
      portfolio_url: form.portfolio_url || null,
      bio: fullBio || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    clearDraft();
    setSubmitted(true);
    setLoading(false);
  }

  function buildAuthHref(target: "sign-up" | "login") {
    const here =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/talents/apply/form";
    const params = new URLSearchParams({ next: here });
    if (form.full_name) params.set("name", form.full_name);
    if (form.email) params.set("email", form.email);
    if (target === "sign-up") params.set("role", "talent");
    return `/auth/${target}?${params.toString()}`;
  }

  // ---------- Render ----------

  if (submitted) {
    return (
      <main className="bg-white min-h-screen">
        <TopBar />
        <div className="pt-28 pb-20 px-6 md:px-12">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center">
            <div className="size-16 rounded-full bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] mx-auto mb-4">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-balance">Application received</h1>
            <p className="text-gray-600 mb-8 text-pretty leading-relaxed">
              Thank you for applying to DeepTalent. Our team reviews every application and will reach out within
              5 business days if there&apos;s a fit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
              >
                Back to home
              </Link>
              <Link
                href="/talents/apply"
                className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
              >
                See open roles
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <TopBar />
      <div className="pt-24 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <Link
            href="/talents/apply"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3B5BDB] mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to open roles
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance leading-tight">
              {targetRoleTitle ? `Apply for ${targetRoleTitle}` : "Apply to join DeepTalent"}
            </h1>
            <p className="text-gray-600 mt-3 text-pretty">
              Takes about 4 minutes. Your progress saves automatically.
            </p>
            {targetRoleTitle && targetCompany && (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex items-start gap-3">
                <div className="size-9 rounded-lg bg-white border border-blue-100 text-[#3B5BDB] flex items-center justify-center shrink-0">
                  <Briefcase className="size-4" />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-gray-900">{targetRoleTitle}</p>
                  <p className="text-gray-600">{targetCompany}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stepper */}
          <ol className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <li key={s.id} className="flex items-center flex-1 min-w-0">
                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      active
                        ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                        : done
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 mx-2 h-px ${
                        done ? "bg-emerald-200" : "bg-gray-200"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Step body */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-9">
            {step === 0 && <StepAbout form={form} update={update} />}
            {step === 1 && <StepRole form={form} update={update} />}
            {step === 2 && <StepDetails form={form} update={update} />}
            {step === 3 && <StepReview form={form} update={update} />}

            {error && (
              <div className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || loading}
                className="h-11 px-5 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="size-4" /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  disabled={!stepValidity[step]}
                  className="h-11 px-6 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !stepValidity[3]}
                  className="h-11 px-6 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : "Submit application"}
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-5">
            Step {step + 1} of {STEPS.length} · Your progress is saved on this device.
          </p>
        </div>
      </div>
      <SiteFooter />

      {/* Auth prompt */}
      {authPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setAuthPrompt(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <button
              onClick={() => setAuthPrompt(false)}
              className="absolute top-4 right-4 size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <div className="size-12 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center mb-4">
              <UserPlus className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-balance">Almost there ��� let&apos;s save your application</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed text-pretty">
              Create an account (or log in) so we can attach this application to your profile and notify you of next steps. Your form data is saved and will fill itself in when you come back.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <Link
                href={buildAuthHref("sign-up")}
                className="h-11 inline-flex items-center justify-center gap-2 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
              >
                <UserPlus className="size-4" /> Create account
              </Link>
              <Link
                href={buildAuthHref("login")}
                className="h-11 inline-flex items-center justify-center gap-2 rounded-full bg-white border border-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <LogIn className="size-4" /> I already have an account
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function TopBar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/">
          <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-8 w-auto" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#3B5BDB] transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </div>
    </header>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="size-10 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-balance">{title}</h2>
        <p className="text-sm text-gray-600 text-pretty">{desc}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

type StepProps = {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
};

function StepAbout({ form, update }: StepProps) {
  return (
    <div>
      <SectionHeader icon={User} title="About you" desc="Tell us how to reach you. This is never shown publicly." />
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Full name" required>
          <input
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="form-input"
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="form-input"
            placeholder="jane@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Phone (with country code)">
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="form-input"
            placeholder="+1 555 123 4567"
            autoComplete="tel"
          />
        </Field>
        <Field label="Country" required>
          <input
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className="form-input"
            placeholder="Nigeria"
            autoComplete="country-name"
            required
          />
        </Field>
        <Field label="City">
          <input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="form-input"
            placeholder="Lagos"
            autoComplete="address-level2"
          />
        </Field>
        <Field label="LinkedIn URL" hint="Strongly recommended">
          <input
            value={form.linkedin_url}
            onChange={(e) => update("linkedin_url", e.target.value)}
            className="form-input"
            placeholder="linkedin.com/in/..."
          />
        </Field>
      </div>
    </div>
  );
}

function StepRole({ form, update }: StepProps) {
  return (
    <div>
      <SectionHeader icon={Briefcase} title="Your role" desc="What you do, and where you are in your career." />
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Role category" required>
          <select
            value={form.role_category}
            onChange={(e) => update("role_category", e.target.value)}
            className="form-input"
            required
          >
            <option value="">Select a category</option>
            {ROLE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Specialization" required hint="e.g. Senior Backend Engineer, KYC Analyst, FP&A">
          <input
            value={form.specialization}
            onChange={(e) => update("specialization", e.target.value)}
            className="form-input"
            placeholder="Senior Backend Engineer"
            required
          />
        </Field>
        <Field label="Years of experience">
          <input
            type="number"
            min="0"
            max="50"
            value={form.years_experience}
            onChange={(e) => update("years_experience", e.target.value)}
            className="form-input"
            placeholder="5"
          />
        </Field>
        <Field label="Availability">
          <select
            value={form.availability}
            onChange={(e) => update("availability", e.target.value)}
            className="form-input"
          >
            <option value="">Select availability</option>
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred work type">
          <select
            value={form.work_type}
            onChange={(e) => update("work_type", e.target.value)}
            className="form-input"
          >
            <option value="">Any</option>
            {WORK_TYPES.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>
        <Field label="English proficiency">
          <select
            value={form.english_level}
            onChange={(e) => update("english_level", e.target.value)}
            className="form-input"
          >
            <option value="">Select level</option>
            {ENGLISH_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-1.5">
          Level of expertise <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Where you sit in your career. This helps us match you to the right roles.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SENIORITY_LEVELS.map((l) => {
            const active = form.seniority === l.value;
            return (
              <button
                key={l.value}
                type="button"
                onClick={() => update("seniority", l.value)}
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
                <span className="block text-xs text-gray-500 mt-1 leading-snug">
                  {l.blurb}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepDetails({ form, update }: StepProps) {
  return (
    <div>
      <SectionHeader icon={Sparkles} title="The details that win" desc="The richer this is, the faster we can match you." />
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Expected monthly comp (USD)" hint="Optional. Helps us match faster.">
          <div className="relative">
            <Wallet className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min="0"
              value={form.expected_monthly_usd}
              onChange={(e) => update("expected_monthly_usd", e.target.value)}
              className="form-input pl-9"
              placeholder="4500"
            />
          </div>
        </Field>
        <Field label="Open to relocation?">
          <select
            value={form.willing_to_relocate}
            onChange={(e) => update("willing_to_relocate", e.target.value)}
            className="form-input"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Maybe — for the right role">Maybe — for the right role</option>
          </select>
        </Field>
        <Field label="Portfolio / website">
          <div className="relative">
            <Globe className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={form.portfolio_url}
              onChange={(e) => update("portfolio_url", e.target.value)}
              className="form-input pl-9"
              placeholder="yourdomain.com"
            />
          </div>
        </Field>
        <Field label="GitHub (engineers only)">
          <input
            value={form.github_url}
            onChange={(e) => update("github_url", e.target.value)}
            className="form-input"
            placeholder="github.com/username"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          label="Tell us about yourself"
          required
          hint={`${form.bio.trim().length}/40 minimum characters`}
        >
          <textarea
            rows={6}
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            className="form-input"
            placeholder="What's your story? Top 2–3 projects, the kind of teams you thrive in, and what you're hoping for next."
            required
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="How did you hear about DeepTalent?">
          <select
            value={form.hear_from}
            onChange={(e) => update("hear_from", e.target.value)}
            className="form-input"
          >
            <option value="">Select an option</option>
            {HEAR_FROM.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function StepReview({ form, update }: StepProps) {
  const items: Array<[string, string]> = [
    ["Name", form.full_name],
    ["Email", form.email],
    ["Phone", form.phone],
    ["Location", [form.city, form.country].filter(Boolean).join(", ")],
    ["Category", form.role_category],
    ["Specialization", form.specialization],
    ["Level of expertise", SENIORITY_LEVELS.find((l) => l.value === form.seniority)?.label ?? ""],
    ["Experience", form.years_experience ? `${form.years_experience} yrs` : ""],
    ["Availability", form.availability],
    ["Work type", form.work_type],
    ["English", form.english_level],
    ["Expected (USD/mo)", form.expected_monthly_usd ? `$${form.expected_monthly_usd}` : ""],
    ["Open to relocation", form.willing_to_relocate],
    ["LinkedIn", form.linkedin_url],
    ["Portfolio", form.portfolio_url],
    ["GitHub", form.github_url],
    ["Heard about us via", form.hear_from],
  ];
  return (
    <div>
      <SectionHeader icon={CheckCircle2} title="Review &amp; submit" desc="Quick check before you send. You can still go back and edit any step." />

      <div className="rounded-xl border border-gray-100 bg-gray-50/60 divide-y divide-gray-100">
        {items.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
            <span className="text-gray-500 shrink-0">{k}</span>
            <span className="text-gray-900 font-medium text-right break-words max-w-[60%]">
              {v || <span className="text-gray-300 italic">— not provided —</span>}
            </span>
          </div>
        ))}
      </div>

      {form.bio && (
        <div className="mt-5">
          <p className="text-sm font-medium text-gray-700 mb-1.5 inline-flex items-center gap-1.5">
            <FileText className="size-4 text-gray-400" /> About you
          </p>
          <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">
            {form.bio}
          </div>
        </div>
      )}

      <label className="mt-6 flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agree_terms}
          onChange={(e) => update("agree_terms", e.target.checked)}
          className="mt-0.5 size-4 rounded border-gray-300 text-[#3B5BDB] focus:ring-[#3B5BDB]"
        />
        <span>
          I confirm the information above is accurate and agree that DeepTalent may contact me about
          relevant opportunities. I&apos;ve read the{" "}
          <Link href="/privacy" className="text-[#3B5BDB] hover:underline">
            privacy policy
          </Link>
          .
        </span>
      </label>
    </div>
  );
}

export default function TalentApplyFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <FormContent />
    </Suspense>
  );
}
