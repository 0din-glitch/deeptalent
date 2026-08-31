"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  ShieldCheck,
  Code2,
  BarChart3,
  Headphones,
  CalendarClock,
  Globe2,
  BriefcaseBusiness,
  ArrowRight,
} from "lucide-react";
import { JUNIOR_ROLES, roleMonthlyUsd, type JuniorRole } from "@/lib/nysc/junior-roles";

const FN_META: Record<
  JuniorRole["fn"],
  { icon: typeof Calculator; tint: string }
> = {
  Finance: { icon: Calculator, tint: "#0F7A3D" },
  Compliance: { icon: ShieldCheck, tint: "#0E7490" },
  Technology: { icon: Code2, tint: "#4338CA" },
  Data: { icon: BarChart3, tint: "#B45309" },
  Customer: { icon: Headphones, tint: "#BE185D" },
  Operations: { icon: CalendarClock, tint: "#6D28D9" },
};

const FILTERS = ["All", "Finance", "Compliance", "Technology", "Data", "Customer", "Operations"] as const;

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export function NyscRolesView() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const roles = filter === "All" ? JUNIOR_ROLES : JUNIOR_ROLES.filter((r) => r.fn === filter);

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "border-[#0F7A3D] bg-[#0F7A3D] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#0F7A3D]/40 hover:text-[#0F7A3D]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {roles.map((role) => {
            const meta = FN_META[role.fn];
            const Icon = meta.icon;
            const pay = roleMonthlyUsd(role);
            return (
              <div
                key={role.id}
                className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className="grid size-11 place-items-center rounded-full"
                    style={{ backgroundColor: meta.tint + "14" }}
                  >
                    <Icon className="size-5" style={{ color: meta.tint }} />
                  </span>
                  <span className="rounded-full bg-[#0F7A3D]/10 px-3 py-1 text-xs font-semibold text-[#0F7A3D]">
                    Junior
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{role.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{role.blurb}</p>

                <div className="mt-5 flex items-center gap-4 text-xs font-medium text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="size-3.5" /> Remote
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 className="size-3.5" /> {role.region}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-lg font-extrabold text-gray-900">
                      {usd(pay)}
                      <span className="text-sm font-medium text-gray-400">/mo</span>
                    </p>
                    <p className="text-[11px] text-gray-400">{role.fn} · local-market rate</p>
                  </div>
                  <Link
                    href={`/talents/apply?audience=nysc&track=ready&role_title=${encodeURIComponent(role.title)}&role_category=${encodeURIComponent(role.fn)}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#0F7A3D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6633]"
                  >
                    Apply <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Footnote */}
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-gray-400 text-pretty">
        Every role is fully managed by DeepTalent — contracting, compliance and payroll are handled for
        you. Rates shown are indicative monthly local-market pay for the junior band and are confirmed
        against each live client brief.
      </p>
    </div>
  );
}
