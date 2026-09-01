import Link from "next/link";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { FluidCTA } from "@/components/site/fluid-cta";
import { Search, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const QUICK_LINKS = [
  { label: "For Talents", href: "/talents", description: "Apply and get matched to global roles" },
  { label: "For Companies", href: "/companies", description: "Hire vetted specialists in days" },
  { label: "Consulting", href: "/consulting", description: "Workforce strategy for global teams" },
  { label: "Contact", href: "/contact", description: "Talk to the DeepTalent team" },
];

export default function NotFound() {
  return (
    <main className="bg-white min-h-screen">
      <SiteNavbar />

      <section className="relative dot-grid-bg pt-40 pb-24 px-6 md:px-12 overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest text-[#3B5BDB] uppercase mb-4">Error 404</p>
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 leading-none text-balance">
            404
          </h1>
          <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-900 text-balance">
            This page went off the org chart.
          </h2>
          <p className="mt-4 text-gray-500 max-w-md mx-auto leading-relaxed">
            {"The page you're looking for doesn't exist, has moved, or the link is out of date. Let's get you back on track."}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <FluidCTA href="/" size="md" showArrow={false}>
              <ArrowLeft className="size-4" />
              Back to home
            </FluidCTA>
            <FluidCTA href="/contact" size="md" variant="outline">
              Contact us
            </FluidCTA>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-20">
          <div className="flex items-center gap-2 justify-center mb-8">
            <Search className="size-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">Or try one of these</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-[#3B5BDB]/40 hover:bg-[#3B5BDB]/5"
              >
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-[#3B5BDB] transition-colors">
                    {link.label}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{link.description}</p>
                </div>
                <span className="shrink-0 size-8 rounded-full bg-gray-100 group-hover:bg-[#3B5BDB] flex items-center justify-center transition-colors">
                  <ArrowLeft className="size-3.5 rotate-[135deg] text-gray-400 group-hover:text-white transition-colors" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
