"use client";

import { useState } from "react";
import useSWR from "swr";
import { Award, Download, Loader2, ShieldCheck } from "lucide-react";

interface CertificateStatus {
  completed: boolean;
  completedAt: string | null;
  completedSource: "self_reported" | "admin_issued" | null;
  certificateNumber: string | null;
  sentAt: string | null;
  enrolled: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function CertificateCard() {
  const { data, isLoading, mutate } = useSWR<CertificateStatus>("/api/nysc/certificate", fetcher);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkComplete() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/nysc/certificate", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong");
      await mutate();
      setConfirming(false);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <Loader2 className="size-5 animate-spin text-gray-300" />
      </div>
    );
  }

  const completed = data?.completed;
  const enrolled = data?.enrolled;

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full ${
              completed ? "bg-[#0F7A3D]/10 text-[#0F7A3D]" : "bg-gray-100 text-gray-400"
            }`}
          >
            <Award className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-gray-900">
              {completed ? "Certificate of completion" : "Finished the programme?"}
            </p>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-500">
              {completed
                ? `Issued to you as certificate no. ${data?.certificateNumber}. A signed PDF was emailed to your inbox${
                    data?.sentAt ? "" : " and is on its way"
                  }.`
                : enrolled
                  ? "Once you've completed the live practical and all modules, confirm below to receive your DeepTalent certificate by email."
                  : "Enrol in the post-NYSC course (NGN 2,000) above to unlock the certificate once you finish."}
            </p>
            {completed && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#0F7A3D]">
                <ShieldCheck className="size-3.5" /> Verified completion
              </p>
            )}
            {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {completed ? (
            <a
              href="/api/nysc/certificate/download"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F7A3D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6633]"
            >
              <Download className="size-4" /> Download certificate
            </a>
          ) : confirming ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkComplete}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F7A3D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6633] disabled:opacity-60"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Yes, I&apos;m done
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              disabled={!enrolled}
              title={enrolled ? undefined : "Enrol in the course first"}
              className="inline-flex items-center gap-2 rounded-xl border border-[#0F7A3D] px-5 py-2.5 text-sm font-semibold text-[#0F7A3D] transition-colors hover:bg-[#0F7A3D]/5 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              <Award className="size-4" /> Mark course complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
