import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { FluidCTA } from "@/components/site/fluid-cta";
import { ConsultingHero } from "@/components/consulting/consulting-hero";
import { ConsultingSolutions } from "@/components/consulting/consulting-solutions";
import { ConsultingFeatures } from "@/components/consulting/consulting-features";
import { ConsultingArc } from "@/components/consulting/consulting-arc";
import { ConsultingTestimonials } from "@/components/consulting/consulting-testimonials";

export default function ConsultingPage() {
  return (
    <main className="min-h-screen bg-[#EDEEF2]">
      <SiteNavbar />

      <ConsultingHero />
      <ConsultingSolutions />
      <ConsultingFeatures />
      <ConsultingArc />
      <ConsultingTestimonials />

      {/* ── Closing CTA ─────────────────────────────────────────────── */}
      <section className="px-3 py-8 pb-16">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#3B5BDB] px-6 py-16 text-center shadow-[0_24px_70px_rgba(59,91,219,0.35)] md:py-24">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Ready to place your first vetted consultant?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/80">
            Tell us about the role, the domain and your timeline. We&apos;ll send you a
            curated shortlist within 14&ndash;21 days.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <FluidCTA href="/contact" size="lg" variant="primary" className="!bg-white !text-[#3B5BDB] !shadow-none">
              Book a consultation
            </FluidCTA>
            <FluidCTA
              href="/companies/hire"
              size="lg"
              variant="outline"
              showArrow={false}
              className="!border-white/40 !bg-transparent !text-white"
            >
              Browse talent instead
            </FluidCTA>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
