/**
 * DeepTalent — 50% Monthly Local-Market Salary Scale by Role, Market & Seniority
 * Source: internal salary scale (May 2026), USD monthly.
 *
 * "50% local-market" means our quoted figure represents roughly half of the equivalent
 * onshore monthly salary in the relevant developed market — the savings clients capture
 * by hiring the same caliber of talent through DeepTalent.
 */

export type Seniority = "junior" | "mid" | "senior";

export type SalaryRow = {
  /** Canonical role id (kebab-case) */
  id: string;
  /** Display label */
  label: string;
  /** Short label for tight UIs */
  shortLabel: string;
  /** Monthly USD ranges by seniority */
  usd: { junior: number; mid: number; senior: number };
  /** Free-text alias terms used by the matcher (lowercased) */
  aliases: string[];
};

export const SALARY_SCALE: SalaryRow[] = [
  {
    id: "fpa-analyst",
    label: "Elite Finance Analyst (FP&A / Strategic Finance)",
    shortLabel: "Finance Analyst (FP&A)",
    usd: { junior: 3500, mid: 4750, senior: 6750 },
    aliases: [
      "fp&a", "fpa", "fp and a", "financial planning", "strategic finance",
      "finance analyst", "financial analyst", "elite finance",
    ],
  },
  {
    id: "kyc-aml",
    label: "KYC / AML Analyst (Compliance Monitoring)",
    shortLabel: "KYC / AML Analyst",
    usd: { junior: 2250, mid: 3000, senior: 4000 },
    aliases: [
      "kyc", "aml", "anti money laundering", "anti-money laundering",
      "compliance monitoring", "compliance analyst", "kyc analyst", "aml analyst",
      "financial crime",
    ],
  },
  {
    id: "product-manager",
    label: "Product Manager",
    shortLabel: "Product Manager",
    usd: { junior: 4000, mid: 5750, senior: 8000 },
    aliases: ["product manager", "product owner", "pm", "product lead", "senior pm"],
  },
  {
    id: "project-manager",
    label: "Project Manager",
    shortLabel: "Project Manager",
    usd: { junior: 2900, mid: 3900, senior: 5250 },
    aliases: ["project manager", "program manager", "scrum master", "delivery manager"],
  },
  {
    id: "accountant",
    label: "Accountant / Bookkeeper",
    shortLabel: "Accountant / Bookkeeper",
    usd: { junior: 2100, mid: 2900, senior: 3750 },
    aliases: [
      "accountant", "bookkeeper", "bookkeeping", "general ledger", "accounting",
      "accounting and bookkeeping", "accounting & bookkeeping",
    ],
  },
  {
    id: "cybersecurity-analyst",
    label: "Cybersecurity Analyst",
    shortLabel: "Cybersecurity Analyst",
    usd: { junior: 3250, mid: 4400, senior: 6000 },
    aliases: [
      "cybersecurity", "cyber security", "security analyst", "soc analyst",
      "infosec", "information security", "security engineer",
    ],
  },
  {
    id: "bi-analyst",
    label: "Business Intelligence (BI) Analyst",
    shortLabel: "BI Analyst",
    usd: { junior: 2750, mid: 3750, senior: 5000 },
    aliases: ["bi analyst", "business intelligence", "tableau", "power bi", "looker"],
  },
  {
    id: "full-stack-developer",
    label: "Full-Stack Developer",
    shortLabel: "Full-Stack Developer",
    usd: { junior: 3400, mid: 4950, senior: 6750 },
    aliases: [
      "full stack", "full-stack", "fullstack", "frontend", "backend", "front end",
      "back end", "software engineer", "web developer", "react developer",
      "node developer", "next.js", "django developer",
    ],
  },
  {
    id: "credit-analyst",
    label: "Credit Analyst",
    shortLabel: "Credit Analyst",
    usd: { junior: 2400, mid: 3250, senior: 4400 },
    aliases: ["credit analyst", "credit risk", "underwriting", "loan analyst"],
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    shortLabel: "Data Analyst",
    usd: { junior: 2600, mid: 3600, senior: 4900 },
    aliases: ["data analyst", "analytics", "sql analyst", "reporting analyst"],
  },
  {
    id: "devops-cloud",
    label: "DevOps / Cloud Engineer",
    shortLabel: "DevOps / Cloud",
    usd: { junior: 3900, mid: 5400, senior: 7500 },
    aliases: [
      "devops", "cloud engineer", "site reliability", "sre", "platform engineer",
      "aws engineer", "kubernetes", "infrastructure", "terraform",
    ],
  },
  {
    id: "ux-ui-designer",
    label: "UX / UI Designer",
    shortLabel: "UX / UI Designer",
    usd: { junior: 3000, mid: 4100, senior: 5750 },
    aliases: [
      "ux designer", "ui designer", "ux/ui", "product designer",
      "interaction designer", "figma", "visual designer",
    ],
  },
  {
    id: "ai-prompt-engineer",
    label: "AI Prompt Engineer / Specialist",
    shortLabel: "AI Prompt Engineer",
    usd: { junior: 3750, mid: 5500, senior: 8250 },
    aliases: [
      "ai prompt", "prompt engineer", "llm engineer", "ai specialist",
      "ai automation", "ai automation specialist", "automation specialist",
      "machine learning engineer", "ml engineer", "ai engineer", "genai",
    ],
  },
  {
    id: "executive-assistant",
    label: "Executive / Operations Assistant",
    shortLabel: "Executive Assistant",
    usd: { junior: 1750, mid: 2400, senior: 3250 },
    aliases: [
      "executive assistant", "ea", "operations assistant", "ops assistant",
      "operational assistant", "executive operational assistant",
      "executive / operational assistant", "executive operations assistant",
      "chief of staff", "office manager", "virtual assistant", "admin assistant",
    ],
  },
  {
    id: "customer-service",
    label: "Customer Service Representative",
    shortLabel: "Customer Service Rep",
    usd: { junior: 1400, mid: 1850, senior: 2400 },
    aliases: [
      "customer service", "customer support", "cs rep", "customer success",
      "help desk", "support rep", "call centre", "call center",
    ],
  },
];

const NORMALIZE_RE = /[\s\-_/&,.]+/g;
function normalize(input: string): string {
  return input.toLowerCase().replace(NORMALIZE_RE, " ").trim();
}

/** Match a free-text role/specialization to a canonical SalaryRow, or null. */
export function matchSalaryRow(input?: string | null): SalaryRow | null {
  if (!input) return null;
  const q = normalize(input);
  if (!q) return null;

  // Exact alias hit — highest confidence
  for (const row of SALARY_SCALE) {
    for (const alias of row.aliases) {
      const a = normalize(alias);
      if (a === q) return row;
    }
  }
  // Substring contains (q contains alias OR alias contains q)
  let best: { row: SalaryRow; score: number } | null = null;
  for (const row of SALARY_SCALE) {
    for (const alias of row.aliases) {
      const a = normalize(alias);
      if (!a) continue;
      let score = 0;
      if (q.includes(a)) score = a.length;
      else if (a.includes(q) && q.length >= 4) score = q.length - 1;
      if (score > 0 && (!best || score > best.score)) best = { row, score };
    }
    // Also check the role label itself
    const labelTokens = normalize(row.label);
    if (q && labelTokens.includes(q) && q.length >= 4) {
      const score = q.length;
      if (!best || score > best.score) best = { row, score };
    }
  }
  if (best) return best.row;

  // Token-overlap fallback: count how many alias tokens (≥3 chars) appear in q.
  // This catches titles with extra words in between, like
  // "Executive / Operational Assistant" → ea row, or
  // "AI Automation Specialist" → ai-prompt-engineer row.
  const qTokens = new Set(q.split(" ").filter((t) => t.length >= 3));
  if (qTokens.size === 0) return null;
  const STOP = new Set(["and", "the", "for", "with"]);
  let tokenBest: { row: SalaryRow; hits: number } | null = null;
  for (const row of SALARY_SCALE) {
    for (const alias of row.aliases) {
      const aTokens = normalize(alias)
        .split(" ")
        .filter((t) => t.length >= 3 && !STOP.has(t));
      if (aTokens.length < 2) continue;
      let hits = 0;
      for (const t of aTokens) if (qTokens.has(t)) hits++;
      // Require at least 2 overlapping tokens to avoid false positives
      if (hits >= 2 && (!tokenBest || hits > tokenBest.hits)) {
        tokenBest = { row, hits };
      }
    }
  }
  return tokenBest?.row ?? null;
}

/** Infer seniority bucket from a free-text years-experience or title. */
export function inferSeniority(years?: number | null, title?: string | null): Seniority {
  const y = typeof years === "number" ? years : null;
  if (y !== null) {
    if (y <= 2) return "junior";
    if (y <= 5) return "mid";
    return "senior";
  }
  const t = (title || "").toLowerCase();
  if (/\b(lead|principal|staff|head|director|sr\.?|senior)\b/.test(t)) return "senior";
  if (/\b(jr\.?|junior|entry|graduate|intern)\b/.test(t)) return "junior";
  return "mid";
}

/** Format a USD monthly salary range as a compact string. */
export function formatRange(min: number, max: number): string {
  const f = (n: number) => `$${n.toLocaleString("en-US")}`;
  return `${f(min)} – ${f(max)}/mo`;
}

/** Get a single seniority figure formatted, e.g. "$4,950/mo (mid)". */
export function formatSeniority(row: SalaryRow, seniority: Seniority): string {
  const v = row.usd[seniority];
  return `$${v.toLocaleString("en-US")}/mo · ${seniority}`;
}

/** Convenience: full junior→senior range string for a row. */
export function rangeForRow(row: SalaryRow): string {
  return formatRange(row.usd.junior, row.usd.senior);
}

/** Selectable seniority levels for hire + application forms. */
export const SENIORITY_LEVELS: { value: Seniority; label: string; blurb: string }[] = [
  { value: "junior", label: "Junior", blurb: "0–2 yrs · execution-focused" },
  { value: "mid", label: "Mid", blurb: "3–5 yrs · owns work independently" },
  { value: "senior", label: "Senior", blurb: "6+ yrs · leads, mentors, sets direction" },
];

export function isSeniority(v: unknown): v is Seniority {
  return v === "junior" || v === "mid" || v === "senior";
}

/**
 * Resolve the monthly price (USD) a company pays for a role at a given level.
 * Derived server-side from the canonical salary scale so it can never be
 * tampered with from the client. Returns null if the role can't be matched.
 */
export function priceForRoleLevel(opts: {
  roleTitle?: string | null;
  roleCategory?: string | null;
  level: Seniority;
}): { row: SalaryRow; level: Seniority; amountUsd: number; amountCents: number } | null {
  const row = matchSalaryRow(opts.roleTitle) || matchSalaryRow(opts.roleCategory);
  if (!row) return null;
  const amountUsd = row.usd[opts.level];
  return { row, level: opts.level, amountUsd, amountCents: Math.round(amountUsd * 100) };
}
