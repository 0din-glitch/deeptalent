import { SALARY_SCALE } from "@/lib/salary/scale";

/**
 * Curated set of entry-level ("junior") roles surfaced to NYSC corps members
 * who declare themselves Global Workforce Ready. Every monthly USD figure is
 * pulled from the canonical SALARY_SCALE junior band so the numbers stay in
 * sync with the rest of the product (no hardcoded pay).
 */
export type JuniorRole = {
  id: string;
  title: string;
  fn: "Finance" | "Compliance" | "Technology" | "Data" | "Customer" | "Operations";
  blurb: string;
  region: string;
  /** Canonical SALARY_SCALE id used to resolve the junior monthly band. */
  scaleId: string;
};

function juniorUsd(scaleId: string): number {
  return SALARY_SCALE.find((r) => r.id === scaleId)?.usd.junior ?? 0;
}

export const JUNIOR_ROLES: JuniorRole[] = [
  {
    id: "jr-bookkeeper",
    title: "Junior Bookkeeper",
    fn: "Finance",
    blurb: "Maintain ledgers, reconcile accounts, and prepare monthly books for a UK SME finance team.",
    region: "United Kingdom",
    scaleId: "accountant",
  },
  {
    id: "jr-ap-ar",
    title: "Accounts Payable / Receivable Assistant",
    fn: "Finance",
    blurb: "Process invoices, chase receivables, and keep supplier statements clean and current.",
    region: "United States",
    scaleId: "accountant",
  },
  {
    id: "jr-fpa",
    title: "Junior FP&A Analyst",
    fn: "Finance",
    blurb: "Build simple variance reports and support month-end commentary for a growing SaaS firm.",
    region: "United Kingdom",
    scaleId: "fpa-analyst",
  },
  {
    id: "jr-credit",
    title: "Credit Risk Associate",
    fn: "Finance",
    blurb: "Assess loan files, run affordability checks, and prepare underwriting summaries.",
    region: "Canada",
    scaleId: "credit-analyst",
  },
  {
    id: "jr-kyc",
    title: "Junior KYC / AML Analyst",
    fn: "Compliance",
    blurb: "Onboard customers, run screening checks, and document case notes for a fintech compliance team.",
    region: "United Kingdom",
    scaleId: "kyc-aml",
  },
  {
    id: "jr-fullstack",
    title: "Junior Full-Stack Developer",
    fn: "Technology",
    blurb: "Ship features across a React/Node stack with code review and mentoring from a senior team.",
    region: "United States",
    scaleId: "full-stack-developer",
  },
  {
    id: "jr-devops",
    title: "Cloud / DevOps Associate",
    fn: "Technology",
    blurb: "Support CI/CD pipelines, monitor cloud infrastructure, and automate routine deployments.",
    region: "Australia",
    scaleId: "devops-cloud",
  },
  {
    id: "jr-data",
    title: "Junior Data Analyst",
    fn: "Data",
    blurb: "Write SQL, clean datasets, and turn raw numbers into clear reporting for the leadership team.",
    region: "United Kingdom",
    scaleId: "data-analyst",
  },
  {
    id: "jr-bi",
    title: "Junior BI Analyst",
    fn: "Data",
    blurb: "Build and maintain dashboards in Power BI / Looker that the whole business relies on.",
    region: "Canada",
    scaleId: "bi-analyst",
  },
  {
    id: "jr-ai",
    title: "AI Automation Associate",
    fn: "Technology",
    blurb: "Prototype AI-assisted workflows that save global teams hours every week — safely.",
    region: "United States",
    scaleId: "ai-prompt-engineer",
  },
  {
    id: "jr-cx",
    title: "Customer Support Associate",
    fn: "Customer",
    blurb: "Handle multi-channel support with warmth and speed, keeping CSAT high for a UK product team.",
    region: "United Kingdom",
    scaleId: "customer-service",
  },
  {
    id: "jr-ea",
    title: "Executive Assistant",
    fn: "Operations",
    blurb: "Own calendars, coordinate across time zones, and keep a busy founder a step ahead.",
    region: "United States",
    scaleId: "executive-assistant",
  },
].map((r) => ({ ...r })) as JuniorRole[];

export function roleMonthlyUsd(role: JuniorRole): number {
  return juniorUsd(role.scaleId);
}
