import Image from "next/image";
import Link from "next/link";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { Globe2, Linkedin, Quote, ShieldCheck, Sparkles, Target, Users, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Quality over quantity",
    description: "Only the top 3% of applicants make it through our rigorous vetting process.",
  },
  {
    icon: Globe2,
    title: "Global by design",
    description: "We source talent worldwide so companies get the best, not the closest.",
  },
  {
    icon: Zap,
    title: "Speed without compromise",
    description: "Shortlists in 48 hours. Hires that last for years.",
  },
  {
    icon: ShieldCheck,
    title: "Trust and transparency",
    description: "Clear pricing, no hidden fees, ethical hiring practices.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen">
      <SiteNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12 bg-gradient-to-br from-[#F8FAFF] via-white to-[#EEF2FF]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-sm font-medium mb-6">
            <Sparkles className="size-4" /> About DeepTalent
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 text-balance leading-tight">
            We connect the world&apos;s best talent with the world&apos;s best companies
          </h1>
          <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto text-pretty">
            DeepTalent is a global hiring platform built for ambitious teams. We combine human expertise with data-driven matching to deliver elite talent in days, not months.
          </p>
        </div>
      </section>

      {/* Founder's Note — moved above Our Story */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold uppercase tracking-wide mb-4">
              From the Founder
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">
              A message from our Founder
            </h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Image card */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/founder.jpg"
                    alt="Joshua Raymond Onifade, MD/CEO of DeepTalent"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-5">
                  <p className="font-bold text-gray-900 text-lg leading-tight">Joshua Raymond Onifade</p>
                  <p className="text-[#3B5BDB] text-sm font-medium mt-0.5">MD/CEO DeepTalent Platform</p>
                  <a
                    href="https://www.linkedin.com/company/deeptalentplatform/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-gray-500 hover:text-[#3B5BDB] transition-colors"
                  >
                    <Linkedin className="size-4" /> Connect on LinkedIn
                  </a>
                </div>
              </div>
            </aside>

            {/* Speech */}
            <div className="lg:col-span-8">
              <Quote className="size-10 text-[#3B5BDB]/20 mb-4" />
              <div className="space-y-5 text-gray-700 leading-relaxed text-pretty text-[17px]">
                <p>
                  I sit at the intersection of two worlds the global economy has never properly connected: Africa&apos;s deep pool of credentialled finance talent, and the Global North&apos;s growing demand for it.
                </p>
                <p>
                  That gap is not a problem. It is infrastructure waiting to be built. That is what I am building.
                </p>
                <p>
                  For close to 20 years, I operated in African structured finance — leading transactions across oil &amp; gas, real estate, corporate banking, and infrastructure worth over $2 billion collectively. I structured petroleum trading lines for several energy companies during Nigeria&apos;s most turbulent market conditions and was an active observer of the syndicate that financed the $2 billion acquisition of Shell&apos;s 40% stake in one of the OMLs — one of the most significant upstream energy transactions in Nigerian history.
                </p>

                {/* Chapter Two — DeepTalent Platform sub-section */}
                <div className="mt-8 mb-2 rounded-2xl border border-[#3B5BDB]/15 bg-[#3B5BDB]/[0.04] p-6 md:p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-[11px] font-semibold uppercase tracking-wide">
                      Chapter Two
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                      DeepTalent Platform
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-pretty">
                    The workforce infrastructure I am building to deploy Africa&apos;s finest finance, technology, and compliance professionals into demanding global financial services environments. Not a staffing agency or a job board. Infrastructure that changes how talent and opportunity flow between continents.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-pretty mt-3">
                    We launched recently. We already have a signed client in Florida, active partnership discussions across the UK, and a pipeline that confirms the demand for this model.
                  </p>
                </div>
                <p className="font-medium text-gray-900 border-l-4 border-[#3B5BDB] pl-4 py-1">
                  If you lead a boutique asset manager, private credit fund, fintech, family office, or financial services firm in the UK, US, Canada, or Australia — and need credentialled, pre-vetted finance or compliance professionals ready to perform — we should talk.
                </p>
                <p>
                  If you are a serious professional from the Global South seeking world-class opportunities without leaving the continent — we are building for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Leaders */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold uppercase tracking-wide mb-4">
              Leadership
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">Meet the Leaders</h2>
            <p className="text-gray-600 mt-4 text-pretty">
              Driving innovation and building Africa&apos;s most trusted global talent infrastructure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Joshua Raymond Onifade */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full max-w-xs mb-6">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                  <Image
                    src="/images/founder.jpg"
                    alt="Joshua Raymond Onifade"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Joshua Raymond Onifade</h3>
              <p className="text-[#3B5BDB] font-semibold mt-2">MD/CEO</p>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Leading the infrastructure revolution. Nearly 20 years in African structured finance, transforming how talent flows across continents.
              </p>
              <a
                href="https://www.linkedin.com/company/deeptalentplatform/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-gray-500 hover:text-[#3B5BDB] transition-colors"
              >
                <Linkedin className="size-4" /> LinkedIn
              </a>
            </div>

            {/* Adedayo Setro A. */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full max-w-xs mb-6">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                  <Image
                    src="/images/leader-setro.jpg"
                    alt="Adedayo Setro A., DMD of DeepTalent Platform"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Adedayo Setro A.</h3>
              <p className="text-[#3B5BDB] font-semibold mt-2">DMD, DeepTalent Platform</p>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Scaling excellence. Dedicated to building systems that connect Africa&apos;s finest professionals with global opportunities.
              </p>
              <a
                href="https://www.linkedin.com/company/deeptalentplatform/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-gray-500 hover:text-[#3B5BDB] transition-colors"
              >
                <Linkedin className="size-4" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold uppercase tracking-wide mb-4">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">How DeepTalent began</h2>
            <p className="text-gray-600 mt-4 text-pretty">
              World-class talent shouldn&apos;t be limited by geography, and high-growth companies shouldn&apos;t have to choose between speed, cost, and quality.
            </p>
          </div>
          <div className="prose prose-lg max-w-3xl mx-auto text-gray-700">
            <p className="text-pretty">
              We started by partnering with the most ambitious startups and scale-ups, helping them build remote-first teams in finance, engineering, data, and operations — deploying Africa&apos;s finest finance, technology, and compliance professionals into demanding global financial services environments.
            </p>
            <p className="mt-4 text-pretty">
              Our approach is different. We don&apos;t just match resumes to job descriptions. We invest deeply in understanding your team, culture, and goals to make placements that last.
            </p>
          </div>
        </div>
      </section>

      {/* What we stand for */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">What we stand for</h2>
            <p className="text-gray-600 mt-4 text-pretty">
              Four principles that guide every placement and every relationship.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="size-12 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] mb-4">
                  <v.icon className="size-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm text-pretty">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 md:px-12 bg-[#3B5BDB]">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="size-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
            Ready to build with the best?
          </h2>
          <p className="text-white/80 mt-4 text-lg text-pretty max-w-xl mx-auto">
            Join companies building world-class teams with DeepTalent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/companies/hire"
              className="h-12 px-8 inline-flex items-center justify-center rounded-full bg-white text-[#3B5BDB] font-semibold hover:bg-white/90 transition-colors"
            >
              Hire talent
            </Link>
            <Link
              href="/talents/apply"
              className="h-12 px-8 inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Apply as talent
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
