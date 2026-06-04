"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { startHireCheckout } from "@/app/actions/hire-checkout";

export function PayButton({ inquiryId }: { inquiryId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const url = await startHireCheckout(inquiryId);
      // Stripe Checkout cannot render inside an iframe (e.g. the v0 preview),
      // so open it in a new tab when we're framed; otherwise navigate directly.
      if (typeof window !== "undefined" && window.self !== window.top) {
        window.open(url, "_blank", "noopener,noreferrer");
        setLoading(false);
      } else {
        window.location.href = url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <>
            <Lock className="size-4" /> Pay securely with Stripe
          </>
        )}
      </button>
      {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
    </div>
  );
}
