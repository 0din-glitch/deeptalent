import Link from "next/link";
import { ArrowLeft, Briefcase, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { getHireQuote } from "@/app/actions/hire-checkout";
import { PayButton } from "./pay-button";

export const dynamic = "force-dynamic";

export default async function HirePayPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const { inquiry } = await searchParams;
  const quote = inquiry ? await getHireQuote(inquiry) : null;

  return (
    <main className="bg-white min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/images/logo-wordmark.png" alt="DeepTalent" className="h-8 w-auto" />
          </Link>
          <Link
            href="/companies/hire"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#3B5BDB] transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to inquiry
          </Link>
        </div>
      </header>

      <div className="pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {!quote ? (
            <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-balance">
                We couldn&apos;t load this checkout
              </h1>
              <p className="text-gray-600 mb-8 text-pretty leading-relaxed">
                This payment link is missing role or level details, so we can&apos;t
                calculate the monthly rate. Please start a new hiring inquiry and
                we&apos;ll take you straight to checkout.
              </p>
              <Link
                href="/companies/hire"
                className="inline-flex h-11 px-6 items-center justify-center rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
              >
                Start a hiring inquiry
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">
                  Complete your placement
                </h1>
                <p className="text-gray-600 mt-3 text-pretty">
                  Your monthly rate is set by the role and the level of expertise you selected.
                </p>
              </div>

              <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
                {/* Order summary */}
                <div className="rounded-2xl border border-gray-100 shadow-lg p-6 md:p-7 bg-white lg:sticky lg:top-24">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="size-10 rounded-xl bg-[#3B5BDB]/10 text-[#3B5BDB] flex items-center justify-center shrink-0">
                      <Briefcase className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {quote.roleLabel}
                      </p>
                      <p className="text-xs text-gray-500">{quote.company}</p>
                    </div>
                  </div>

                  <dl className="text-sm divide-y divide-gray-100 border-y border-gray-100">
                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-gray-500">Level of expertise</dt>
                      <dd className="font-medium text-gray-900">{quote.levelLabel}</dd>
                    </div>
                    {quote.roleTitle && (
                      <div className="flex items-center justify-between py-2.5 gap-4">
                        <dt className="text-gray-500 shrink-0">Requested title</dt>
                        <dd className="font-medium text-gray-900 text-right break-words">
                          {quote.roleTitle}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-gray-500">Billing</dt>
                      <dd className="font-medium text-gray-900">Monthly</dd>
                    </div>
                  </dl>

                  <div className="flex items-baseline justify-between mt-5">
                    <span className="text-sm font-medium text-gray-700">Total per month</span>
                    <span className="text-3xl font-extrabold text-[#3B5BDB]">
                      ${quote.amountUsd.toLocaleString("en-US")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Billed every month in USD until cancelled. Cancel anytime by contacting your DeepTalent partner.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    Secured by Stripe
                  </div>
                </div>

                {/* Confirm & pay */}
                <div className="rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8 bg-white">
                  <h2 className="text-lg font-bold text-gray-900">Ready to confirm?</h2>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                    You&apos;ll be taken to Stripe&apos;s secure checkout to set up your
                    monthly subscription of{" "}
                    <span className="font-semibold text-gray-900">
                      ${quote.amountUsd.toLocaleString("en-US")}/mo
                    </span>
                    . You can review everything before paying.
                  </p>

                  <ul className="my-5 space-y-2.5 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                      256-bit encrypted payment handled entirely by Stripe.
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                      Cancel anytime — no long-term lock-in.
                    </li>
                  </ul>

                  <PayButton inquiryId={quote.inquiryId} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
