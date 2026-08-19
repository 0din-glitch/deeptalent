"use client";

import useSWR from "swr";
import { useState } from "react";
import { Globe, Building2, Clock, MapPin, ExternalLink, Wifi } from "lucide-react";

type ExternalJob = {
  id: string;
  company: string;
  title: string;
  category: string | null;
  location: string | null;
  remote: boolean;
  url: string;
  source: string;
  posted_at: string;
  tags: string[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ExternalRoles({ limit = 12 }: { limit?: number }) {
  const { data, isLoading } = useSWR<{ jobs: ExternalJob[] }>(
    "/api/public/external-jobs",
    fetcher,
    { revalidateOnFocus: false }
  );
  const [filter, setFilter] = useState<string>("All");

  const jobs = data?.jobs || [];
  const categories = [
    "All",
    ...Array.from(new Set(jobs.map((j) => j.category).filter(Boolean) as string[])),
  ].slice(0, 8);
  const visible = (filter === "All" ? jobs : jobs.filter((j) => j.category === filter)).slice(
    0,
    limit
  );

  return (
    <section id="external-roles" className="scroll-mt-24">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/5 text-gray-700 text-xs font-semibold uppercase tracking-wide mb-3">
            <Globe className="size-3.5" /> Outside DeepTalent
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">
            Fresh roles from across the web
          </h2>
          <p className="text-gray-600 mt-2 text-pretty max-w-xl">
            Live listings aggregated from public job boards. These are external opportunities —
            applying opens the original posting in a new tab.
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
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-900 hover:text-gray-900"
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
          <Globe className="size-7 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            No external roles available right now. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visible.map((j) => (
            <a
              key={j.id}
              href={j.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white border border-gray-100 hover:border-gray-900/30 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-gray-900/5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 inline-flex items-center gap-1.5 mb-1">
                    <Building2 className="size-3.5" /> {j.company}
                  </p>
                  <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
                    {j.title}
                  </h3>
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                  {j.source}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {j.category && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#3B5BDB] border border-blue-100">
                    {j.category}
                  </span>
                )}
                {j.remote && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 inline-flex items-center gap-1">
                    <Wifi className="size-3" /> Remote
                  </span>
                )}
                {j.location && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-100 inline-flex items-center gap-1">
                    <MapPin className="size-3" /> <span className="truncate max-w-[8rem]">{j.location}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {new Date(j.posted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <span className="text-xs font-semibold text-gray-900 group-hover:text-[#3B5BDB] inline-flex items-center gap-1 transition-colors">
                  View &amp; apply <ExternalLink className="size-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
