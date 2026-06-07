import { SALARY_SCALE, inferSeniority, type Seniority, type SalaryRow } from "@/lib/salary/scale";

export type QualifiedRole = {
  id: string;
  label: string;
  shortLabel: string;
  seniority: Seniority;
  monthlyUsd: number;
  matchScore: number; // 0-100 how well the candidate fits this role
};

export type ScoreBand = "excellent" | "strong" | "promising" | "developing";

export function scoreBand(score: number): ScoreBand {
  if (score >= 85) return "excellent";
  if (score >= 70) return "strong";
  if (score >= 55) return "promising";
  return "developing";
}

export function scoreBandLabel(band: ScoreBand): string {
  switch (band) {
    case "excellent":
      return "Excellent";
    case "strong":
      return "Strong";
    case "promising":
      return "Promising";
    default:
      return "Developing";
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(Boolean);
}

/**
 * Match a candidate to qualifying roles based on their declared skills,
 * specialization/category and their interview score. Roles are only offered
 * when the candidate cleared a minimum interview bar, and the seniority is
 * derived from years of experience (capped by performance).
 */
export function matchQualifyingRoles(opts: {
  score: number;
  skills: string[];
  specialization?: string | null;
  roleCategory?: string | null;
  yearsExperience?: number | null;
}): QualifiedRole[] {
  const { score, skills, specialization, roleCategory, yearsExperience } = opts;

  // Below this bar, no roles are unlocked.
  if (score < 50) return [];

  const skillTokens = new Set(skills.flatMap((s) => tokenize(s)));
  const focusText = `${specialization ?? ""} ${roleCategory ?? ""}`.toLowerCase();
  const focusTokens = new Set(tokenize(focusText));

  // Performance caps seniority: a weak interview can't unlock senior roles
  // even with many years of experience.
  let seniority = inferSeniority(yearsExperience ?? null, specialization ?? null);
  if (score < 70 && seniority === "senior") seniority = "mid";
  if (score < 60 && seniority === "mid") seniority = "junior";

  const scored: QualifiedRole[] = SALARY_SCALE.map((row: SalaryRow) => {
    let overlap = 0;
    const aliasTokens = new Set(row.aliases.flatMap((a) => tokenize(a)));
    // Skill ↔ alias overlap
    for (const t of skillTokens) {
      if (aliasTokens.has(t) || row.id.includes(t)) overlap += 2;
    }
    // Focus (specialization/category) ↔ alias overlap
    for (const t of focusTokens) {
      if (aliasTokens.has(t) || row.id.includes(t)) overlap += 3;
    }
    // Direct alias phrase match against focus text
    for (const alias of row.aliases) {
      if (focusText.includes(alias)) overlap += 4;
    }

    const fit = Math.min(100, Math.round((overlap / 6) * 100));
    // Blend role fit with interview performance.
    const matchScore = Math.round(fit * 0.6 + score * 0.4);
    return {
      id: row.id,
      label: row.label,
      shortLabel: row.shortLabel,
      seniority,
      monthlyUsd: row.usd[seniority],
      matchScore,
    };
  });

  return scored
    .filter((r) => r.matchScore >= 45)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}
