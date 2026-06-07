"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  CheckCircle2,
  FileText,
  Lightbulb,
  Mic,
  TrendingUp,
  User,
} from "lucide-react";
import { SALARY_SCALE } from "@/lib/salary/scale";

const BRAND = "#3B5BDB";

type Props = {
  email: string;
  profile: any;
  applications: any[];
  resumes: any[];
  certifications: any[];
  interview: any | null;
  onNavigate: (tab: "profile" | "resumes" | "certifications" | "applications" | "openRoles") => void;
};

const PROFILE_FIELDS = [
  "full_name",
  "headline",
  "phone",
  "country",
  "city",
  "bio",
  "linkedin_url",
  "role_category",
  "specialization",
  "years_experience",
];

function profileCompletion(p: any): number {
  const filled = PROFILE_FIELDS.filter((f) => {
    const v = p?.[f];
    return v != null && String(v).trim() !== "";
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function TalentOverview({
  email,
  profile,
  applications,
  resumes,
  certifications,
  interview,
  onNavigate,
}: Props) {
  const completion = profileCompletion(profile);

  // Real application activity over the last 6 months.
  const activity = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString(undefined, { month: "short" }),
        count: 0,
      });
    }
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    for (const a of applications) {
      if (!a.created_at) continue;
      const d = new Date(a.created_at);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const i = idx.get(k);
      if (i != null) buckets[i].count += 1;
    }
    return buckets;
  }, [applications]);

  // Real status breakdown.
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of applications) {
      const s = (a.status || "pending").toLowerCase();
      map[s] = (map[s] || 0) + 1;
    }
    return map;
  }, [applications]);

  const approved = (statusCounts["approved"] || 0) + (statusCounts["qualified"] || 0);
  const inReview = (statusCounts["reviewing"] || 0) + (statusCounts["contacted"] || 0);
  const pending = statusCounts["pending"] || statusCounts["new"] || 0;

  // Recommended open roles, real rates from the salary scale, matched to the
  // candidate's seniority where we can infer it.
  const seniority = useMemo<"junior" | "mid" | "senior">(() => {
    const yrs = Number(profile?.years_experience ?? 0);
    if (yrs >= 6) return "senior";
    if (yrs >= 3) return "mid";
    return "junior";
  }, [profile?.years_experience]);

  const openRoles = useMemo(() => {
    const preferred = String(profile?.role_category || profile?.specialization || "").toLowerCase();
    const ranked = [...SALARY_SCALE].sort((a, b) => {
      const aMatch = preferred && (a.label.toLowerCase().includes(preferred) || a.aliases.some((x) => preferred.includes(x))) ? 1 : 0;
      const bMatch = preferred && (b.label.toLowerCase().includes(preferred) || b.aliases.some((x) => preferred.includes(x))) ? 1 : 0;
      return bMatch - aMatch;
    });
    return ranked.slice(0, 4).map((r) => ({
      id: r.id,
      label: r.shortLabel,
      rate: r.usd[seniority],
    }));
  }, [profile?.role_category, profile?.specialization, seniority]);

  const tips = useMemo(
    () => buildTips({ completion, resumes, certifications, applications, profile, approved, inReview }),
    [completion, resumes, certifications, applications, profile, approved, inReview],
  );

  const recentApps = applications.slice(0, 5);
  const firstName = (profile?.full_name || email).split(/[\s@]+/)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">
          Welcome back, {firstName}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s how your DeepTalent profile is performing.</p>
      </div>

      <InterviewBanner interview={interview} />

      {/* Top row: profile strength + activity + application chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile strength */}
        <Card>
          <CardHeader title="Profile Strength" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Completion</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{completion}%</p>
              <div className="h-1.5 rounded-full bg-gray-100 mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-[#3B5BDB]" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Verification</p>
              <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                {profile?.verification_status || "Unverified"}
              </p>
              <button
                onClick={() => onNavigate("profile")}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#3B5BDB] hover:underline"
              >
                Improve profile <ArrowUpRight className="size-3" />
              </button>
            </div>
          </div>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader title="Your Activity" />
          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon={Briefcase} label="Applications" value={applications.length} />
            <MiniStat icon={FileText} label="Resumes" value={resumes.length} />
            <MiniStat icon={Award} label="Certs" value={certifications.length} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="size-4" /> {approved} approved
            </span>
            <span className="text-blue-600">{inReview} in review</span>
            <span className="text-amber-600">{pending} pending</span>
          </div>
        </Card>

        {/* Application activity chart */}
        <Card>
          <CardHeader title="Application Activity" subtitle="Last 6 months" />
          <div className="h-[120px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="appFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  cursor={{ stroke: "#e5e7eb" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                  formatter={(v) => {
                    const n = Number(v);
                    return [`${n} application${n === 1 ? "" : "s"}`, ""] as [string, string];
                  }}
                />
                <Area type="monotone" dataKey="count" stroke={BRAND} strokeWidth={2.5} fill="url(#appFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Second row: applications list + chart, open roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Your Applications"
            action={
              <button onClick={() => onNavigate("applications")} className="text-xs font-medium text-[#3B5BDB] hover:underline">
                View all
              </button>
            }
          />
          {recentApps.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-5">
              <ul className="divide-y divide-gray-100">
                {recentApps.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-2.5">
                    <div className="size-9 rounded-lg bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
                      <Briefcase className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {a.role_category || a.specialization || "Application"}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                    <StatusDot status={a.status} />
                  </li>
                ))}
              </ul>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} width={28} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" stroke={BRAND} strokeWidth={2.5} dot={{ r: 3 }} name="Applications" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-3">You haven&apos;t applied to any roles yet.</p>
              <Link
                href="/talents/apply"
                className="inline-flex h-9 px-4 items-center justify-center rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2]"
              >
                Apply now
              </Link>
            </div>
          )}
        </Card>

        {/* Recommended open roles */}
        <Card>
          <CardHeader
            title="Open Roles For You"
            action={
              <button onClick={() => onNavigate("openRoles")} className="text-xs font-medium text-[#3B5BDB] hover:underline">
                See all
              </button>
            }
          />
          <ul className="space-y-2.5">
            {openRoles.map((r) => (
              <li key={r.id} className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.label}</p>
                  <p className="text-xs text-gray-400 capitalize">{seniority} level</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">${r.rate.toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></span>
              </li>
            ))}
          </ul>
          <Link
            href="/talents/apply"
            className="mt-4 block text-center bg-[#3B5BDB] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
          >
            Apply for a role
          </Link>
        </Card>
      </div>

      {/* Tips for getting interviews */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lightbulb className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tips for Getting Interviews</h3>
            <p className="text-xs text-gray-500">Personalized to your profile</p>
          </div>
        </div>
        <ul className="grid md:grid-cols-2 gap-3">
          {tips.map((t, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${t.done ? "text-emerald-500" : "text-gray-300"}`} />
              <div>
                <p className="text-sm font-medium text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function buildTips({
  completion,
  resumes,
  certifications,
  applications,
  profile,
  approved,
  inReview,
}: {
  completion: number;
  resumes: any[];
  certifications: any[];
  applications: any[];
  profile: any;
  approved: number;
  inReview: number;
}) {
  const tips: { title: string; body: string; done: boolean }[] = [];

  tips.push({
    title: completion >= 90 ? "Profile looks complete" : "Complete your profile",
    body:
      completion >= 90
        ? "A complete profile gets up to 3x more recruiter views — yours is in great shape."
        : `Your profile is ${completion}% complete. Add a headline, bio, and skills to rank higher in recruiter searches.`,
    done: completion >= 90,
  });

  tips.push({
    title: resumes.length ? "Resume uploaded" : "Upload a tailored resume",
    body: resumes.length
      ? "Keep your resume current and tailor it to each role you apply for."
      : "Candidates with a resume are far more likely to be shortlisted. Add yours in the Resumes tab.",
    done: resumes.length > 0,
  });

  tips.push({
    title: certifications.length ? "Certifications add credibility" : "Add a certification",
    body: certifications.length
      ? "Verified certifications help you stand out for specialized roles."
      : "Showcase relevant certifications to validate your expertise and unlock more matches.",
    done: certifications.length > 0,
  });

  if (!profile?.skills?.length) {
    tips.push({
      title: "List your top skills",
      body: "Recruiters filter by skills. Add 5–10 of your strongest to appear in more searches.",
      done: false,
    });
  } else {
    tips.push({
      title: "Skills listed",
      body: "Refresh your skills as you grow — keeping them sharp improves match quality.",
      done: true,
    });
  }

  tips.push({
    title: applications.length >= 3 ? "Stay consistent" : "Apply to more roles",
    body:
      applications.length >= 3
        ? `You've submitted ${applications.length} applications${approved ? `, with ${approved} approved` : ""}. Applying regularly keeps you top of mind.`
        : "Applying to 3���5 well-matched roles per week meaningfully increases interview odds.",
    done: applications.length >= 3,
  });

  tips.push({
    title: "Respond quickly",
    body: inReview
      ? `You have ${inReview} application${inReview === 1 ? "" : "s"} in review — reply to recruiter messages within 24 hours.`
      : "Fast replies to recruiter outreach are one of the biggest factors in landing interviews.",
    done: false,
  });

  return tips.slice(0, 6);
}

function InterviewBanner({ interview }: { interview: any | null }) {
  const completed = interview?.status === "completed";

  if (completed) {
    const score = interview.overall_score ?? null;
    const band = interview.score_band ?? null;
    const roles = Array.isArray(interview.qualified_roles) ? interview.qualified_roles.length : 0;
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="size-11 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">AI interview completed</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            {score != null ? (
              <>
                You scored <span className="font-semibold text-gray-900">{score}/100</span>
                {band ? <span className="capitalize"> ({band})</span> : null}
                {roles > 0 ? ` · qualified for ${roles} role${roles === 1 ? "" : "s"}` : ""}.
              </>
            ) : (
              "Your interview has been recorded and is being reviewed."
            )}
          </p>
        </div>
        <Link
          href="/interview"
          className="inline-flex h-10 px-5 items-center justify-center rounded-full border border-emerald-300 bg-white text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors shrink-0"
        >
          Retake interview
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#3B5BDB] p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-white">
      <div className="size-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
        <Mic className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">Complete your AI interview</h3>
        <p className="text-sm text-white/80 mt-0.5">
          A short voice interview helps us match you to the right roles and seniority. Takes about 5 minutes.
        </p>
      </div>
      <Link
        href="/interview"
        className="inline-flex h-10 px-5 items-center justify-center rounded-full bg-white text-[#3B5BDB] text-sm font-semibold hover:bg-white/90 transition-colors shrink-0"
      >
        Start interview
      </Link>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-100 rounded-2xl p-5 ${className}`}>{children}</div>;
}

function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <Icon className="size-4 text-[#3B5BDB]" />
      <p className="text-xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const s = (status || "pending").toLowerCase();
  const color =
    s === "approved" || s === "qualified"
      ? "bg-emerald-500"
      : s === "reviewing" || s === "contacted"
        ? "bg-blue-500"
        : s === "rejected"
          ? "bg-red-500"
          : "bg-amber-500";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 capitalize">
      <span className={`size-2 rounded-full ${color}`} />
      {s}
    </span>
  );
}
