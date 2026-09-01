"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, Loader2 } from "lucide-react";

interface EnrolmentStatus {
  enrolled: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Kicks off a Flutterwave checkout for the NGN 2,000 post-NYSC course fee.
 * Shared between the catalogue header and the end-of-lesson-1 CTA so both
 * read the same enrolment status.
 */
export function EnrolButton({ variant = "primary" }: { variant?: "primary" | "outline" }) {
  const { data, isLoading } = useSWR<EnrolmentStatus>("/api/nysc/certificate", fetcher);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnrol() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/nysc/payment/initiate", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to start payment");
      window.location.href = body.link;
    } catch (e: any) {
      setError(e.message || "Failed to start payment");
      setStarting(false);
    }
  }

  if (isLoading) {
    return <Loader2 className="size-4 animate-spin text-gray-300" />;
  }

  if (data?.enrolled) {
    return (
      <span
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${
          variant === "primary" ? "bg-white/15 text-white" : "bg-[#0F7A3D]/10 text-[#0F7A3D]"
        }`}
      >
        <CheckCircle2 className="size-4" /> Enrolled
      </span>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <button
        onClick={handleEnrol}
        disabled={starting}
        className={
          variant === "primary"
            ? "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0F7A3D] transition-colors hover:bg-white/90 disabled:opacity-60"
            : "inline-flex items-center justify-center gap-1 rounded-full bg-[#0F7A3D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c6633] disabled:opacity-60"
        }
      >
        {starting && <Loader2 className="size-4 animate-spin" />}
        Enrol — NGN 2,000
      </button>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
