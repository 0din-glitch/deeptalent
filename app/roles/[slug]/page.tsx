import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SALARY_SCALE } from "@/lib/salary/scale";
import { ROLE_CONTENT } from "@/lib/roles/content";
import { RoleLandingClient } from "@/components/roles/role-landing-client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://deeptalent.app";

/* ------------------------------------------------------------------ */
/*  Static params — one page per SALARY_SCALE id                       */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return SALARY_SCALE.map((row) => ({ slug: row.id }));
}

/* ------------------------------------------------------------------ */
/*  Per-role metadata                                                   */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = SALARY_SCALE.find((r) => r.id === slug);
  const content = ROLE_CONTENT[slug];
  if (!row || !content) return {};

  return {
    title: `${content.headline} — DeepTalent`,
    description: `${content.subheadline}. Published salary range: $${row.usd.junior.toLocaleString("en-US")}–$${row.usd.senior.toLocaleString("en-US")}/mo (junior→senior). Apply to DeepTalent's selective network or express interest today.`,
    keywords: content.keywords.join(", "),
    alternates: {
      canonical: `${APP_URL}/roles/${slug}`,
    },
    openGraph: {
      title: `${content.headline} — DeepTalent`,
      description: content.subheadline,
      url: `${APP_URL}/roles/${slug}`,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  JobPosting JSON-LD                                                  */
/* ------------------------------------------------------------------ */

function buildJobPostingSchema(slug: string) {
  const row = SALARY_SCALE.find((r) => r.id === slug);
  const content = ROLE_CONTENT[slug];
  if (!row || !content) return null;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: content.headline,
    description: content.description,
    hiringOrganization: {
      "@type": "Organization",
      name: "DeepTalent",
      sameAs: APP_URL,
      logo: `${APP_URL}/images/logo-wordmark.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "REMOTE",
      },
    },
    jobLocationType: "TELECOMMUTE",
    employmentType: "CONTRACTOR",
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: row.usd.junior,
        maxValue: row.usd.senior,
        unitText: "MONTH",
      },
    },
    datePosted: new Date().toISOString().split("T")[0],
    validThrough: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().split("T")[0],
    occupationalCategory: content.discipline,
    url: `${APP_URL}/roles/${slug}`,
    industry: "Staffing and Recruiting",
    workHours: "Full-time",
    salaryCurrency: "USD",
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default async function RoleLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = SALARY_SCALE.find((r) => r.id === slug);
  const content = ROLE_CONTENT[slug];
  if (!row || !content) notFound();

  const schema = buildJobPostingSchema(slug);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <RoleLandingClient row={row} content={content} />
    </>
  );
}
