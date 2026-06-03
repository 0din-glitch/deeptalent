import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";

export default function HirePaySuccessPage() {
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
          <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-balance">
            Payment confirmed
          </h1>
          <p className="text-gray-600 mt-3 text-pretty leading-relaxed">
            Your monthly placement subscription is now active. Our team will reach out
            shortly to kick off matching and onboarding for your role.
          </p>
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
