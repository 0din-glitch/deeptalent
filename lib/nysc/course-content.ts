/**
 * Content for the "Get Global Workforce Ready" 3-day course, transcribed from
 * the Deeptalent facilitator deck & learner guide. Used by the NYSC training
 * page to render the catalogue, curriculum and the first (free) lesson.
 */

export type CourseModule = { code: string; title: string; minutes: number };
export type CourseDay = { day: number; title: string; total: string; modules: CourseModule[] };

export const COURSE = {
  id: "global-workforce-ready-3day",
  title: "Get Global Workforce Ready",
  tagline: "Work global. Stay in Nigeria.",
  summary:
    "A three-day course on landing — and keeping — a remote role with a UK, US, Canadian or Australian employer. Two hours a day, plus a one-hour live practical on Google Meet.",
  priceNgn: 2000,
  stats: [
    { value: "3", label: "days" },
    { value: "7 hrs", label: "in total" },
    { value: "13", label: "modules" },
    { value: "1 hr", label: "live on Google Meet" },
  ],
} as const;

export const COURSE_DAYS: CourseDay[] = [
  {
    day: 1,
    title: "Employability foundations",
    total: "2 hours · 4 modules",
    modules: [
      { code: "1.1", title: "The global remote market", minutes: 30 },
      { code: "1.2", title: "Your global-ready profile", minutes: 40 },
      { code: "1.3", title: "Communicating with global teams", minutes: 30 },
      { code: "1.4", title: "Workshop: rewrite & send", minutes: 20 },
    ],
  },
  {
    day: 2,
    title: "Culture, time zones & self-management",
    total: "2 hours · 4 modules",
    modules: [
      { code: "2.1", title: "Global work culture decoded", minutes: 30 },
      { code: "2.2", title: "Time zones & the remote day", minutes: 40 },
      { code: "2.3", title: "Time management that survives NEPA", minutes: 30 },
      { code: "2.4", title: "Workshop: plan a two-zone week", minutes: 20 },
    ],
  },
  {
    day: 3,
    title: "AI tools & landing the role",
    total: "2 hours taught · 1 hour live · 5 modules",
    modules: [
      { code: "3.1", title: "Your AI toolkit", minutes: 35 },
      { code: "3.2", title: "AI in your function, responsibly", minutes: 30 },
      { code: "3.3", title: "Vetting, interviews & offers", minutes: 35 },
      { code: "3.4", title: "Capstone & readiness check", minutes: 20 },
      { code: "3.5", title: "Live practical · Google Meet", minutes: 60 },
    ],
  },
];

export const LEARNING_OUTCOMES: { title: string; body: string }[] = [
  {
    title: "Present a verified profile",
    body: "A two-page international CV, an employer-facing LinkedIn, and proof of credentials (ICAN, ACCA, ACAMS) ready for vetting.",
  },
  {
    title: "Write and speak for global teams",
    body: "Clear, direct, low-context English — in email, Slack, and on camera — without the habits that mark a candidate as untested.",
  },
  {
    title: "Operate inside global work culture",
    body: "Ownership, documentation, honest status updates, and asking early — the behaviours UK and US managers actually reward.",
  },
  {
    title: "Master time zones and the remote day",
    body: "Convert WAT to any client zone instantly, protect overlap hours, and hand work across zones without dropping it.",
  },
  {
    title: "Use AI tools to deliver faster, safely",
    body: "Draft, summarise, analyse and check work with AI — while protecting client data and keeping human judgement central.",
  },
  {
    title: "Pass vetting and the interview",
    body: "Know DeepTalent's assessment stages, prepare STAR answers, run a professional video setup, and spot job scams.",
  },
];

/** Full content for the first, free lesson (Day 1 · Module 1.1). */
export const FIRST_LESSON = {
  day: 1,
  code: "1.1",
  minutes: 30,
  title: "The global remote market: where a corps member fits",
  intro:
    "What global employers actually screen for, how to present a profile that passes, and how to communicate like someone who has already worked internationally.",
  whoHires: {
    heading: "Who hires, and for what",
    points: [
      "SMEs in the UK, US, Canada and Australia — 10 to 200 staff, no offshore HR, one to three roles at a time.",
      "Finance & accounting: bookkeeping, AP/AR, FP&A, credit risk, audit support.",
      "Compliance: KYC/AML analysts, onboarding, transaction monitoring.",
      "Technology & data: full-stack, cloud/DevOps, BI dashboards, automation.",
      "Customer experience and executive operations: support, CRM, calendar and project coordination.",
    ],
  },
  screenTests: [
    {
      n: "01",
      title: "Credentials that can be verified",
      body: "ICAN, ACCA, ACAMS, CFA levels, cloud and data certifications — with membership numbers.",
    },
    {
      n: "02",
      title: "Evidence, not adjectives",
      body: "Numbers: reconciled 1,200 transactions monthly; cut close time from 9 to 5 days.",
    },
    {
      n: "03",
      title: "Written English under time pressure",
      body: "A 10-minute written task reveals more than an hour of talking.",
    },
    {
      n: "04",
      title: "Reliability signals",
      body: "Do you reply within a working day? Do you show up on time to a 15-minute call?",
    },
    {
      n: "05",
      title: "Work readiness",
      body: "Power, internet, quiet space, a laptop that works — and a plan B for each.",
    },
  ],
  closing:
    "DeepTalent places professionals into fully managed roles — contracting, compliance and payroll are handled for you. Your job is to be the person the client would never want to replace.",
} as const;
