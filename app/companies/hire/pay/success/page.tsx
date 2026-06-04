import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { confirmHirePayment } from "@/app/actions/hire-checkout";

export const dynamic = "force-dynamic";

export default async function HirePaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string; session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let result: { paid: boolean; amountUsd?: number } = { paid: false };
  if (session_id) {
    try {
      result = await confirmHirePayment(session_id);
    } catch {
      result = { paid: false };
    }
  }

  return (
    <main className="bg-white min-h-screen flex flex-col">
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center">
          <Link href="/">
            <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center">
          {result.paid ? (
            <>
              <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="size-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 text-balance">
                Payment confirmed
              </h1>
              <p className="text-gray-600 mt-3 text-pretty leading-relaxed">
                {result.amountUsd
                  ? `Your monthly placement subscription of $${result.amountUsd.toLocaleString(
                      "en-US"
                    )}/mo is now active. `
                  : "Your monthly placement subscription is now active. "}
                Our team has been notified and will reach out shortly to kick off
                matching and onboarding for your role.
              </p>
            </>
          ) : (
            <>
              <div className="size-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="size-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 text-balance">
                We&apos;re confirming your payment
              </h1>
              <p className="text-gray-600 mt-3 text-pretty leading-relaxed">
                If you just completed checkout, your payment may take a moment to
                process. Our team will follow up to confirm your placement — no need
                to pay again.
              </p>
            </>
          )}
          <Link
            href="/companies/hire"
            className="mt-7 inline-flex h-11 px-6 items-center justify-center rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
          >
            Back to hiring
          </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
