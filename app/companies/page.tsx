import type { Metadata } from "next";
import { CompaniesPageClient } from "@/components/companies/companies-page-client";

export const metadata: Metadata = {
  title: "For Companies — Hire Finance, Compliance & Technology Talent",
  description:
    "DeepTalent is a fully managed talent partner. We source, vet, and deploy credentialled finance, compliance, and technology specialists from Africa into your team in 14–21 days. <8% acceptance. 60-day free replacement.",
  openGraph: {
    title: "For Companies — DeepTalent",
    description:
      "Hire credentialled finance, compliance & technology talent in 14–21 days. Fully managed — payroll, compliance, and replacement guarantee included.",
  },
};

export default function CompaniesPage() {
  return <CompaniesPageClient />;
}
