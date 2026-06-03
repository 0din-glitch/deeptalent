import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";

export default function PrivacyPage() {
  return (
    <main className="bg-white min-h-screen">
      <SiteNavbar />
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 text-balance">Privacy Policy</h1>
          <p className="text-gray-500 mb-10">Last updated: May 2026</p>

          <div className="flex flex-col gap-8 text-gray-700 leading-relaxed">
            <Section title="1. Introduction">
              DeepTalent respects your privacy. This policy explains what information we collect, how we use it, and the rights you have over your data.
            </Section>
            <Section title="2. Information we collect">
              We collect information you provide directly, such as your name, email, professional details, and any applications or inquiries you submit. We also collect basic usage data to improve the platform.
            </Section>
            <Section title="3. How we use information">
              We use your information to match talent with opportunities, communicate with you, improve our services, and comply with legal obligations. We never sell your personal data.
            </Section>
            <Section title="4. Data sharing">
              We may share your information with vetted partner companies when matching for a role, with service providers who help us operate, or when required by law.
            </Section>
            <Section title="5. Your rights">
              You may request access, correction, or deletion of your data at any time. Contact <a href="mailto:privacy@deeptalent.com" className="text-[#3B5BDB] underline">privacy@deeptalent.com</a>.
            </Section>
            <Section title="6. Security">
              We use industry-standard security measures including encrypted storage, role-based access control, and Row Level Security on our databases.
            </Section>
            <Section title="7. Contact">
              For any privacy-related questions, email <a href="mailto:privacy@deeptalent.com" className="text-[#3B5BDB] underline">privacy@deeptalent.com</a>.
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
