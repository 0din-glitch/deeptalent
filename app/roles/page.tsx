import type { Metadata } from "next";
import { RolesPageClient } from "@/components/roles/roles-page-client";

export const metadata: Metadata = {
  title: "Open Roles & Salary Ranges — DeepTalent",
  description:
    "Every discipline DeepTalent places — Finance Analyst, KYC/AML, Full-Stack Developer, DevOps, Product Manager, and more — with published monthly USD salary ranges. Express interest or apply now.",
  openGraph: {
    title: "Open Roles & Salary Ranges — DeepTalent",
    description:
      "15 disciplines, fully published salary ranges. Finance, compliance, and technology professionals placed globally in 14–21 days.",
  },
};

export default function RolesPage() {
  return <RolesPageClient />;
}
