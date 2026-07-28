import type { Metadata } from "next";
import { ApplyLandingClient } from "@/components/talents/apply-landing-client";

export const metadata: Metadata = {
  title: "Apply to the Network — DeepTalent",
  description:
    "Browse open roles and apply to DeepTalent's selective network of finance, compliance, and technology professionals. Fewer than 8% of applicants are accepted.",
  openGraph: {
    title: "Apply to the DeepTalent Network",
    description:
      "Fewer than 8% acceptance. Published salary scale. Global remote roles in finance, compliance, and technology.",
  },
};

export default function TalentApplyLandingPage() {
  return <ApplyLandingClient />;
}
