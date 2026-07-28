import type { Metadata } from "next";
import { TalentsPageClient } from "@/components/talents/talents-page-client";

export const metadata: Metadata = {
  title: "For Talents — Finance, Compliance & Technology Roles",
  description:
    "Join DeepTalent's selective network of credentialled finance, compliance, and technology professionals. <8% acceptance. Published salary ranges. Global remote roles. Apply now.",
  openGraph: {
    title: "For Talents — DeepTalent",
    description:
      "Credentialled professionals placed into demanding global roles in 14–21 days. Published salary scale. No negotiating blind.",
  },
};

export default function TalentsPage() {
  return <TalentsPageClient />;
}
