"use client";

import useSWR from "swr";
import { BookOpen, Download, Loader2, Lock } from "lucide-react";
import { EnrolButton } from "@/components/nysc/enrol-button";

interface CertificateStatus {
  enrolled: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function StudyGuideCard() {
  const { data, isLoading } = useSWR<CertificateStatus>("/api/nysc/certificate", fetcher);
  const enrolled = Boolean(data?.enrolled);

  if (isLoading) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <Loader2 className="size-5 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full ${
              enrolled ? "bg-[#0F7A3D]/10 text-[#0F7A3D]" : "bg-gray-100 text-gray-400"
            }`}
          >
            <BookOpen className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-gray-900">3-day study guide</p>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-500">
              {enrolled
                ? "The full PDF companion to the course — keep it for reference during the live practical and after you finish."
                : "Enrol in the post-NYSC course (NGN 2,000) to unlock the downloadable PDF study guide."}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {enrolled ? (
            <a
              href="/documents/nysc-post-nysc-study-guide.pdf"
              download
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F7A3D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6633]"
            >
              <Download className="size-4" /> Download study guide
            </a>
          ) : (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <Lock className="size-3.5" /> Locked
              </span>
              <EnrolButton variant="outline" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
