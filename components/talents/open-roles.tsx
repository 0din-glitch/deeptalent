"use client";

import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Briefcase, Building2, Clock, Users, Lock, Loader2, X } from "lucide-react";

type Role = {
  id: string;
  company: string;
  title: string;
  category: string | null;
  team_size: string | null;
  urgency: string | null;
  budget_range: string | null;
  summary: string | null;
  posted_at: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function urgencyTone(u?: string | null) {
  const v = (u || "").toLowerCase();
  if (v.includes("urgent") || v.includes("immediate")) return "bg-rose-50 text-rose-700 border-rose-100";
  if (v.includes("soon") || v.includes("month")) return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-emerald-50 text-emerald-700 border-emerald-100";
}

export function OpenRoles({ initialRole }: { initialRole?: string }) {
  const { data, isLoading } = useSWR<{ roles: Role[] }>("/api/public/roles", fetcher);
  const [filter, setFilter] = useState<string>("All");
  const [authPrompt, setAuthPrompt] = useState<Role | null>(null);
  const [checking, setChecking] = useState<string | null>(null);

  const roles = data?.roles || [];
  const categories = ["All", ...Array.from(new Set(roles.map((r) => r.category).filter(Boolean) as string[]))];
  const visible = filter === "All" ? roles : roles.filter((r) => r.category === filter);

  async function handleApply(role: Role) {
    setChecking(role.id);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    setChecking(null);

    if (!userData.user) {
      // Need to sign in / create account first
      setAuthPrompt(role);
      return;
    }

    // Logged in — jump straight to the application form, prefilled with the role.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams({
        role_id: role.id,
        role_title: role.title,
        role_category: role.category || "",
        company: role.company,
      });
      window.location.href = `/talents/apply/form?${params.toString()}`;
    }
  }

  return (
    <section id="roles" className="scroll-mt-24">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold uppercase tracking-wide mb-3">
            <Briefcase className="size-3.5" /> Open Roles
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">
            Roles companies are actively hiring for
          </h2>
          <p className="text-gray-600 mt-2 text-pretty max-w-xl">
            Apply directly to live requests from vetted DeepTalent companies. Click any role to start your application.
          </p>
        </div>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${
                filter === c
                  ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#3B5BDB] hover:text-[#3B5BDB]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
          <Briefcase className="size-7 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            No open roles right now. Submit a general application below and we&apos;ll match you to roles as they come in.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visible.map((r) => (
            <div
              key={r.id}
              className="group relative bg-white border border-gray-100 hover:border-[#3B5BDB]/30 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-[#3B5BDB]/5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 inline-flex items-center gap-1.5 mb-1">
                    <Building2 className="size-3.5" /> {r.company}
                  </p>
                  <h3 className="font-semibold text-gray-900 text-base leading-snug truncate">
                    {r.title}
                  </h3>
                </div>
                {r.urgency && (
                  <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${urgencyTone(r.urgency)}`}>
                    {r.urgency}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {r.category && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#3B5BDB] border border-blue-100">
                    {r.category}
                  </span>
                )}
                {r.team_size && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-100 inline-flex items-center gap-1">
                    <Users className="size-3" /> {r.team_size}
                  </span>
                )}
              </div>

              {r.summary && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {r.summary}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {new Date(r.posted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <button
                  onClick={() => handleApply(r)}
                  disabled={checking === r.id}
                  className="text-xs font-semibold text-[#3B5BDB] hover:text-[#2f49b2] inline-flex items-center gap-1 disabled:opacity-60"
                >
                  {checking === r.id ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  Apply for this role →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auth prompt modal */}
      {authPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setAuthPrompt(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-7">
            <button
              onClick={() => setAuthPrompt(null)}
              className="absolute top-3 right-3 size-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <div className="size-12 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center mb-4">
              <Lock className="size-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1.5">Sign in to apply</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-1">
              You&apos;re applying to{" "}
              <span className="font-medium text-gray-900">{authPrompt.title}</span> at{" "}
              <span className="font-medium text-gray-900">{authPrompt.company}</span>.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Create a DeepTalent account or sign in to submit your application. It takes under a minute.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/auth/sign-up?role=talent&next=${encodeURIComponent(
                  `/talents/apply/form?role_id=${authPrompt.id}&role_title=${encodeURIComponent(authPrompt.title)}&role_category=${encodeURIComponent(authPrompt.category || "")}&company=${encodeURIComponent(authPrompt.company)}`
                )}`}
                className="h-11 rounded-full bg-[#3B5BDB] text-white font-semibold inline-flex items-center justify-center hover:bg-[#2f49b2] transition-colors"
              >
                Create account
              </Link>
              <Link
                href={`/auth/login?next=${encodeURIComponent(
                  `/talents/apply/form?role_id=${authPrompt.id}&role_title=${encodeURIComponent(authPrompt.title)}&role_category=${encodeURIComponent(authPrompt.category || "")}&company=${encodeURIComponent(authPrompt.company)}`
                )}`}
                className="h-11 rounded-full bg-white border border-gray-200 text-gray-800 font-semibold inline-flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
