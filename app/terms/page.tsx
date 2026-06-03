import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";

export default function TermsPage() {
  return (
    <main className="bg-white min-h-screen">
      <SiteNavbar />
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 text-balance">Terms of Service</h1>
          <p className="text-gray-500 mb-10">Last updated: May 2026</p>

          <div className="flex flex-col gap-8 text-gray-700 leading-relaxed">
            <Section title="1. Acceptance of terms">
              By accessing or using DeepTalent, you agree to be bound by these terms. If you do not agree, do not use the service.
            </Section>
            <Section title="2. Eligibility">
              You must be at least 18 years old and able to enter into a binding contract under the laws of your jurisdiction to use DeepTalent.
            </Section>
            <Section title="3. Accounts">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </Section>
            <Section title="4. Talent submissions">
              By submitting your profile, you represent that all information is accurate and that you have the right to share it. We may verify any information you provide.
            </Section>
            <Section title="5. Company engagements">
              Companies agree to evaluate candidates fairly, communicate decisions promptly, and pay agreed fees per the engagement letter.
            </Section>
            <Section title="6. Intellectual property">
              All site content, branding, and platform technology are owned by DeepTalent and protected by intellectual property laws.
            </Section>
            <Section title="7. Limitation of liability">
              To the maximum extent permitted by law, DeepTalent shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.
            </Section>
            <Section title="8. Changes">
              We may update these terms periodically. Continued use of the service constitutes acceptance of any changes.
            </Section>
            <Section title="9. Contact">
              For questions about these terms, email <a href="mailto:legal@deeptalent.com" className="text-[#3B5BDB] underline">legal@deeptalent.com</a>.
            </Section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-pretty">{children}</p>
    </div>
  );
}
