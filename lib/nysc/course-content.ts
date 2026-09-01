/**
 * Content for the "Get Global Workforce Ready" 3-day course, transcribed from
 * the Deeptalent facilitator deck & learner guide. Used by the NYSC training
 * page to render the catalogue, curriculum and every lesson.
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

/** A block of content inside a lesson — either a bulleted list or a small card grid. */
export type LessonBlock =
  | { type: "points"; heading: string; points: string[] }
  | { type: "cards"; heading: string; cards: { n: string; title: string; body: string }[] };

export type Lesson = {
  day: 1 | 2 | 3;
  code: string;
  title: string;
  minutes: number;
  intro: string;
  blocks: LessonBlock[];
  closing: string;
};

/** Full content for every module across the three days, in curriculum order. */
export const LESSONS: Lesson[] = [
  {
    day: 1,
    code: "1.1",
    minutes: 30,
    title: "The global remote market: where a corps member fits",
    intro:
      "What global employers actually screen for, how to present a profile that passes, and how to communicate like someone who has already worked internationally.",
    blocks: [
      {
        type: "points",
        heading: "Who hires, and for what",
        points: [
          "SMEs in the UK, US, Canada and Australia — 10 to 200 staff, no offshore HR, one to three roles at a time.",
          "Finance & accounting: bookkeeping, AP/AR, FP&A, credit risk, audit support.",
          "Compliance: KYC/AML analysts, onboarding, transaction monitoring.",
          "Technology & data: full-stack, cloud/DevOps, BI dashboards, automation.",
          "Customer experience and executive operations: support, CRM, calendar and project coordination.",
        ],
      },
      {
        type: "cards",
        heading: "What the screen actually tests",
        cards: [
          { n: "01", title: "Credentials that can be verified", body: "ICAN, ACCA, ACAMS, CFA levels, cloud and data certifications — with membership numbers." },
          { n: "02", title: "Evidence, not adjectives", body: "Numbers: reconciled 1,200 transactions monthly; cut close time from 9 to 5 days." },
          { n: "03", title: "Written English under time pressure", body: "A 10-minute written task reveals more than an hour of talking." },
          { n: "04", title: "Reliability signals", body: "Do you reply within a working day? Do you show up on time to a 15-minute call?" },
          { n: "05", title: "Work readiness", body: "Power, internet, quiet space, a laptop that works — and a plan B for each." },
        ],
      },
    ],
    closing:
      "DeepTalent places professionals into fully managed roles — contracting, compliance and payroll are handled for you. Your job is to be the person the client would never want to replace.",
  },
  {
    day: 1,
    code: "1.2",
    minutes: 40,
    title: "Your global-ready profile",
    intro:
      "How to turn your NYSC service and local experience into a CV, LinkedIn and portfolio a UK, US, Canadian or Australian hiring manager will actually read.",
    blocks: [
      {
        type: "points",
        heading: "What goes in a two-page international CV",
        points: [
          "Impact-first bullet points with numbers, not job descriptions.",
          "Remove photos, age, marital status and other details that read as clutter in these markets.",
          "List NYSC service alongside your primary role — \"National service, [state] · [your function]\" reads as real work experience.",
          "One page maximum for the first five years of experience.",
        ],
      },
      {
        type: "cards",
        heading: "Your three profile checkpoints",
        cards: [
          { n: "01", title: "CV", body: "Two pages, reverse-chronological, quantified achievements." },
          { n: "02", title: "LinkedIn", body: "Headline states your function and market, not just your job title." },
          { n: "03", title: "Credentials", body: "ICAN, ACCA, ACAMS or cloud certs listed with membership numbers, verifiable on request." },
        ],
      },
    ],
    closing:
      "Your profile is often the only thing a client sees before a screening call — it has to do the convincing on its own.",
  },
  {
    day: 1,
    code: "1.3",
    minutes: 30,
    title: "Communicating with global teams",
    intro:
      "The written and spoken habits that separate a candidate who reads as ready from one who reads as untested, in Slack, email and on camera.",
    blocks: [
      {
        type: "points",
        heading: "Low-context English, in practice",
        points: [
          "Lead with the conclusion, then the supporting detail — not the other way round.",
          "State what you need and by when, in the first line of a message.",
          "Avoid hedging phrases (\"I think maybe\", \"sorry to bother you\") that read as uncertainty to a UK/US manager.",
          "Confirm understanding in writing after any verbal instruction.",
        ],
      },
      {
        type: "cards",
        heading: "Where this shows up",
        cards: [
          { n: "01", title: "Async updates", body: "A daily written status, sent without being asked." },
          { n: "02", title: "Email threads", body: "One clear ask per email, subject line that states the outcome." },
          { n: "03", title: "Video calls", body: "Camera on, notes visible, questions saved for the right moment." },
        ],
      },
    ],
    closing:
      "Clients don't expect a Nigerian accent to disappear — they expect clarity, and clarity is a skill you can build in a week.",
  },
  {
    day: 1,
    code: "1.4",
    minutes: 20,
    title: "Workshop: rewrite & send",
    intro:
      "A guided workshop: rewrite your CV summary and one LinkedIn section live, using the checkpoints from 1.2, then submit both for review before Day 2.",
    blocks: [
      {
        type: "points",
        heading: "What you'll submit",
        points: [
          "Your rewritten CV summary — three to four lines, impact-first.",
          "Your updated LinkedIn headline and About section.",
          "One quantified achievement you hadn't written down before today.",
        ],
      },
    ],
    closing:
      "This is the only module with a deliverable — it's what the facilitator reviews before Day 2 begins.",
  },
  {
    day: 2,
    code: "2.1",
    minutes: 30,
    title: "Global work culture decoded",
    intro:
      "The unwritten rules of UK, US, Canadian and Australian workplaces — ownership, documentation and how disagreement is actually handled.",
    blocks: [
      {
        type: "points",
        heading: "Four norms that catch new hires out",
        points: [
          "Ownership means flagging a problem before it's asked about, not waiting to be caught.",
          "Documentation is not bureaucracy — it's how a distributed team trusts your work without watching you do it.",
          "Disagreeing with a manager in writing, respectfully, is expected — silence reads as disengagement.",
          "\"I don't know yet, I'll find out by [time]\" is a stronger answer than a guess.",
        ],
      },
      {
        type: "cards",
        heading: "Culture by market, at a glance",
        cards: [
          { n: "UK", title: "Understated", body: "Politeness carries real information — read between the lines." },
          { n: "US", title: "Direct", body: "Say the ask plainly; enthusiasm is expected, not overclaiming." },
          { n: "CA/AU", title: "Consensus-seeking", body: "Decisions move slower; input is genuinely wanted before action." },
        ],
      },
    ],
    closing:
      "None of this is about losing who you are — it's about reading the room correctly before you speak.",
  },
  {
    day: 2,
    code: "2.2",
    minutes: 40,
    title: "Time zones & the remote day",
    intro:
      "Converting West Africa Time to any client zone instantly, and structuring a day that protects the hours that actually overlap.",
    blocks: [
      {
        type: "points",
        heading: "The conversions that matter",
        points: [
          "WAT to UK time: same clock in winter, one hour behind in British Summer Time.",
          "WAT to US Eastern: 5 hours ahead; US Pacific: 8 hours ahead.",
          "WAT to Australia Eastern: 7–9 hours behind, depending on season.",
          "Always confirm in the client's local time — never assume they'll convert it themselves.",
        ],
      },
      {
        type: "cards",
        heading: "Structuring your overlap",
        cards: [
          { n: "01", title: "Protect it", body: "No personal appointments during your one confirmed overlap window." },
          { n: "02", title: "Front-load it", body: "Send anything needing same-day input before the overlap starts." },
          { n: "03", title: "Log it", body: "A shared doc showing what happened while the client was offline." },
        ],
      },
    ],
    closing:
      "A remote worker who's fluent in the client's clock, not just their own, is the one who gets trusted with more.",
  },
  {
    day: 2,
    code: "2.3",
    minutes: 30,
    title: "Time management that survives NEPA",
    intro:
      "Building a work routine that holds up against power cuts, network drops and shared household demands — without your client ever noticing.",
    blocks: [
      {
        type: "points",
        heading: "The redundancy every remote Nigerian professional needs",
        points: [
          "A second connectivity option: a phone hotspot with data, not just home Wi-Fi.",
          "A charged power bank or inverter capacity for at least one full work session.",
          "A default response when you go offline unexpectedly: message the moment you're back, with a timestamp of what happened.",
          "Buffer time built into deadlines you control — never commit to the tightest possible turnaround.",
        ],
      },
    ],
    closing:
      "Clients don't need a perfect setup — they need to trust that when something goes wrong, you'll handle it and tell them.",
  },
  {
    day: 2,
    code: "2.4",
    minutes: 20,
    title: "Workshop: plan a two-zone week",
    intro:
      "Build your actual weekly schedule: fixed overlap hours, deep-work blocks, and a written contingency plan, ready to show a client in week one.",
    blocks: [
      {
        type: "points",
        heading: "What you'll leave with",
        points: [
          "A weekly calendar template with your confirmed overlap hours blocked.",
          "A one-paragraph contingency plan for power or connectivity loss.",
          "A daily status-update template you can reuse from day one on the job.",
        ],
      },
    ],
    closing:
      "This becomes the actual routine you run once you're placed — not a theoretical exercise.",
  },
  {
    day: 3,
    code: "3.1",
    minutes: 35,
    title: "Your AI toolkit",
    intro:
      "The AI tools global teams already expect you to know — for drafting, summarising and checking your own work faster.",
    blocks: [
      {
        type: "points",
        heading: "The toolkit, function by function",
        points: [
          "Drafting and rewriting: turning rough notes into client-ready emails and reports.",
          "Summarising: long threads, meeting transcripts and documents into a paragraph a manager can act on.",
          "Checking: catching errors in your own numbers, grammar and logic before you send.",
          "Research: getting a fast, sourced first pass on an unfamiliar topic.",
        ],
      },
    ],
    closing:
      "AI fluency is now a baseline expectation, not a differentiator — the differentiator is knowing when not to trust it.",
  },
  {
    day: 3,
    code: "3.2",
    minutes: 30,
    title: "AI in your function, responsibly",
    intro:
      "Using AI tools without exposing client data, and knowing exactly where human judgement still has to lead.",
    blocks: [
      {
        type: "points",
        heading: "The rules that protect you and the client",
        points: [
          "Never paste client names, financials or personal data into a public AI tool.",
          "Treat AI output as a first draft to verify, not a final answer to submit.",
          "Disclose AI use when a client asks — most don't mind; being asked and hiding it is the actual risk.",
          "Know your client's specific policy before you start — some functions restrict this by design.",
        ],
      },
    ],
    closing:
      "The professionals clients trust most are the ones who use AI to move faster without ever handing over judgement.",
  },
  {
    day: 3,
    code: "3.3",
    minutes: 35,
    title: "Vetting, interviews & offers",
    intro:
      "DeepTalent's assessment stages end-to-end, how to prepare STAR answers, run a professional video setup, and spot a job scam before it costs you.",
    blocks: [
      {
        type: "points",
        heading: "The assessment stages",
        points: [
          "Profile and credential screening — this is where 1.2's checkpoints get tested.",
          "A written task under time pressure.",
          "A structured interview using STAR (Situation, Task, Action, Result) answers.",
          "A final client-facing conversation for shortlisted candidates.",
        ],
      },
      {
        type: "cards",
        heading: "Before any call",
        cards: [
          { n: "01", title: "Setup", body: "Wired internet if possible, plain background, camera at eye level." },
          { n: "02", title: "Scam check", body: "DeepTalent never asks you to pay for a role. Any request to pay is a scam." },
          { n: "03", title: "STAR", body: "One prepared story per competency — ownership, conflict, a missed deadline recovered." },
        ],
      },
    ],
    closing:
      "Every stage exists to answer one question for the client: can this person be trusted with real client work, unsupervised.",
  },
  {
    day: 3,
    code: "3.4",
    minutes: 20,
    title: "Capstone & readiness check",
    intro:
      "A short, graded check across the three days' material, plus a final review of your profile before the live practical.",
    blocks: [
      {
        type: "points",
        heading: "What's assessed",
        points: [
          "A short written response applying 2.1's culture norms to a workplace scenario.",
          "Your finished CV and LinkedIn, checked against the 1.2 checkpoints.",
          "A time-zone conversion and overlap-planning exercise from Day 2.",
        ],
      },
    ],
    closing:
      "This is the readiness check DeepTalent uses to confirm you're prepared for the live practical and, beyond it, real client work.",
  },
  {
    day: 3,
    code: "3.5",
    minutes: 60,
    title: "Live practical · Google Meet",
    intro:
      "A one-hour live session on Google Meet — a facilitator-led mock client call, with direct feedback on your camera presence, answers and written follow-up.",
    blocks: [
      {
        type: "points",
        heading: "How the hour runs",
        points: [
          "A short briefing on the mock scenario.",
          "A 15-minute simulated client call, recorded for feedback only.",
          "Live, individual feedback on your STAR answers and camera setup.",
          "A written follow-up email you send within the session, reviewed on the spot.",
        ],
      },
    ],
    closing:
      "This is the closest simulation to your first real client interaction — and the last thing standing between you and your certificate.",
  },
];

/** The first lesson (Day 1 · Module 1.1) — always free to preview, paid or not. */
export const FIRST_LESSON = LESSONS[0];
