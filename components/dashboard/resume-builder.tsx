"use client";

import { useState } from "react";
import {
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FileText,
  Download,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
interface WorkEntry {
  id: string;
  title: string;
  company: string;
  period: string;
  bullets: string;
}

interface EduEntry {
  id: string;
  degree: string;
  school: string;
  year: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: WorkEntry[];
  education: EduEntry[];
  skills: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const EMPTY_WORK: WorkEntry = {
  id: uid(),
  title: "",
  company: "",
  period: "",
  bullets: "",
};

const EMPTY_EDU: EduEntry = {
  id: uid(),
  degree: "",
  school: "",
  year: "",
};

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */
export function ResumeBuilder({ profile }: { profile: any }) {
  const [preview, setPreview] = useState(false);
  const [openSection, setOpenSection] = useState<string>("personal");
  const [generating, setGenerating] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [resume, setResume] = useState<ResumeData>({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.country || "",
    linkedin: "",
    website: "",
    summary: "",
    experience: [{ ...EMPTY_WORK, id: uid() }],
    education: [{ ...EMPTY_EDU, id: uid() }],
    skills: profile?.skills || "",
  });

  function set<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setResume((r) => ({ ...r, [key]: value }));
  }

  function updateWork(id: string, field: keyof WorkEntry, value: string) {
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  }

  function updateEdu(id: string, field: keyof EduEntry, value: string) {
    setResume((r) => ({
      ...r,
      education: r.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  }

  async function aiGenerate(section: string, context?: string) {
    setGenerating(section);
    try {
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          currentData: context,
          profile,
          prompt: "",
        }),
      });
      const { text } = await res.json();
      if (section === "summary") set("summary", text);
      if (section === "skills") set("skills", text);
      if (section === "experience" && context) {
        // find the entry with matching content
        setResume((r) => {
          const idx = r.experience.findIndex((e) => e.bullets === context || !e.bullets);
          if (idx === -1) return r;
          const updated = [...r.experience];
          updated[idx] = { ...updated[idx], bullets: text };
          return { ...r, experience: updated };
        });
      }
    } finally {
      setGenerating(null);
      setSaved(section);
      setTimeout(() => setSaved(null), 2000);
    }
  }

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "summary", label: "Professional Summary", icon: FileText },
    { id: "experience", label: "Work Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Code2 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Builder</h2>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered — build a world-class CV in minutes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
          >
            <Download className="size-4" /> Export PDF
          </button>
        </div>
      </div>

      {preview ? (
        <ResumePreview resume={resume} />
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Editor */}
          <div className="space-y-3">
            {sections.map(({ id, label, icon: Icon }) => {
              const isOpen = openSection === id;
              return (
                <div
                  key={id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenSection(isOpen ? "" : id)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/80 transition-colors"
                  >
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isOpen ? "bg-[#3B5BDB] text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="size-4" />
                    </div>
                    <span className="font-semibold text-gray-900 flex-1">{label}</span>
                    {isOpen ? (
                      <ChevronUp className="size-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="size-4 text-gray-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-50">
                      {id === "personal" && (
                        <PersonalSection resume={resume} set={set} />
                      )}
                      {id === "summary" && (
                        <SummarySection
                          value={resume.summary}
                          onChange={(v) => set("summary", v)}
                          onGenerate={() => aiGenerate("summary")}
                          generating={generating === "summary"}
                          saved={saved === "summary"}
                        />
                      )}
                      {id === "experience" && (
                        <ExperienceSection
                          entries={resume.experience}
                          onChange={updateWork}
                          onAdd={() =>
                            setResume((r) => ({
                              ...r,
                              experience: [...r.experience, { ...EMPTY_WORK, id: uid() }],
                            }))
                          }
                          onRemove={(id) =>
                            setResume((r) => ({
                              ...r,
                              experience: r.experience.filter((e) => e.id !== id),
                            }))
                          }
                          onGenerate={(id, ctx) => aiGenerate("experience", ctx)}
                          generating={generating === "experience"}
                          saved={saved === "experience"}
                        />
                      )}
                      {id === "education" && (
                        <EducationSection
                          entries={resume.education}
                          onChange={updateEdu}
                          onAdd={() =>
                            setResume((r) => ({
                              ...r,
                              education: [...r.education, { ...EMPTY_EDU, id: uid() }],
                            }))
                          }
                          onRemove={(id) =>
                            setResume((r) => ({
                              ...r,
                              education: r.education.filter((e) => e.id !== id),
                            }))
                          }
                        />
                      )}
                      {id === "skills" && (
                        <SkillsSection
                          value={resume.skills}
                          onChange={(v) => set("skills", v)}
                          onGenerate={() => aiGenerate("skills")}
                          generating={generating === "skills"}
                          saved={saved === "skills"}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mini preview sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 px-1">Live preview</p>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="scale-[0.55] origin-top-left w-[182%] pointer-events-none">
                  <ResumePreview resume={resume} compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section components                                                   */
/* ------------------------------------------------------------------ */
function PersonalSection({ resume, set }: { resume: ResumeData; set: any }) {
  return (
    <div className="pt-4 grid sm:grid-cols-2 gap-4">
      {[
        { key: "fullName", label: "Full name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "location", label: "Location / Country" },
        { key: "linkedin", label: "LinkedIn URL" },
        { key: "website", label: "Website / Portfolio" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
          <input
            value={(resume as any)[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder={label}
            className="w-full form-input text-sm"
          />
        </div>
      ))}
    </div>
  );
}

function AiButton({
  onClick,
  generating,
  saved,
}: {
  onClick: () => void;
  generating: boolean;
  saved: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={generating}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        saved
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : "bg-[#3B5BDB]/10 text-[#3B5BDB] hover:bg-[#3B5BDB]/20 border border-[#3B5BDB]/10"
      } disabled:opacity-60`}
    >
      {generating ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : saved ? (
        <Check className="size-3.5" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      {saved ? "Generated" : generating ? "Generating…" : "AI Generate"}
    </button>
  );
}

function SummarySection({
  value,
  onChange,
  onGenerate,
  generating,
  saved,
}: {
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  generating: boolean;
  saved: boolean;
}) {
  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-500">Professional summary</label>
        <AiButton onClick={onGenerate} generating={generating} saved={saved} />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A compelling 3–4 sentence overview of your experience, skills, and career goals…"
        className="w-full form-input text-sm min-h-28 resize-none"
      />
    </div>
  );
}

function ExperienceSection({
  entries,
  onChange,
  onAdd,
  onRemove,
  onGenerate,
  generating,
  saved,
}: {
  entries: WorkEntry[];
  onChange: (id: string, field: keyof WorkEntry, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onGenerate: (id: string, ctx: string) => void;
  generating: boolean;
  saved: boolean;
}) {
  return (
    <div className="pt-4 space-y-5">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="space-y-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Position {idx + 1}</p>
            {entries.length > 1 && (
              <button
                onClick={() => onRemove(entry.id)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Job title</label>
              <input value={entry.title} onChange={(e) => onChange(entry.id, "title", e.target.value)} placeholder="e.g. Senior Software Engineer" className="w-full form-input text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Company</label>
              <input value={entry.company} onChange={(e) => onChange(entry.id, "company", e.target.value)} placeholder="e.g. Acme Corp" className="w-full form-input text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Period</label>
              <input value={entry.period} onChange={(e) => onChange(entry.id, "period", e.target.value)} placeholder="e.g. Jan 2022 – Present" className="w-full form-input text-sm" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400">Key achievements &amp; responsibilities</label>
              <AiButton onClick={() => onGenerate(entry.id, `${entry.title} at ${entry.company}`)} generating={generating} saved={saved} />
            </div>
            <textarea
              value={entry.bullets}
              onChange={(e) => onChange(entry.id, "bullets", e.target.value)}
              placeholder="• Led development of…&#10;• Reduced load times by…&#10;• Managed a team of…"
              className="w-full form-input text-sm min-h-24 resize-none"
            />
          </div>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-sm font-medium text-[#3B5BDB] hover:underline"
      >
        <Plus className="size-4" /> Add position
      </button>
    </div>
  );
}

function EducationSection({
  entries,
  onChange,
  onAdd,
  onRemove,
}: {
  entries: EduEntry[];
  onChange: (id: string, field: keyof EduEntry, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="pt-4 space-y-5">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="space-y-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Entry {idx + 1}</p>
            {entries.length > 1 && (
              <button onClick={() => onRemove(entry.id)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Degree / Qualification</label>
              <input value={entry.degree} onChange={(e) => onChange(entry.id, "degree", e.target.value)} placeholder="e.g. BSc Computer Science" className="w-full form-input text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Institution</label>
              <input value={entry.school} onChange={(e) => onChange(entry.id, "school", e.target.value)} placeholder="e.g. University of Lagos" className="w-full form-input text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Year</label>
              <input value={entry.year} onChange={(e) => onChange(entry.id, "year", e.target.value)} placeholder="e.g. 2019" className="w-full form-input text-sm" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={onAdd} className="flex items-center gap-2 text-sm font-medium text-[#3B5BDB] hover:underline">
        <Plus className="size-4" /> Add education
      </button>
    </div>
  );
}

function SkillsSection({
  value,
  onChange,
  onGenerate,
  generating,
  saved,
}: {
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  generating: boolean;
  saved: boolean;
}) {
  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-500">Skills</label>
        <AiButton onClick={onGenerate} generating={generating} saved={saved} />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Languages: TypeScript, Python, Go&#10;Frameworks: React, Next.js, Node.js&#10;Tools: Docker, Git, AWS&#10;Soft Skills: Leadership, Communication"
        className="w-full form-input text-sm min-h-28 resize-none"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Resume Preview                                                       */
/* ------------------------------------------------------------------ */
function ResumePreview({ resume, compact }: { resume: ResumeData; compact?: boolean }) {
  const p = compact ? "p-6" : "p-10";
  return (
    <div className={`bg-white ${p} font-sans text-gray-900 ${compact ? "text-[11px]" : "text-sm"} leading-relaxed print:shadow-none`}>
      {/* Header */}
      <div className="border-b-2 border-[#3B5BDB] pb-4 mb-5">
        <h1 className={`font-extrabold text-gray-900 ${compact ? "text-xl" : "text-3xl"} leading-tight`}>
          {resume.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-500">
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.linkedin && <span>{resume.linkedin}</span>}
          {resume.website && <span>{resume.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-5">
          <h2 className={`font-bold text-[#3B5BDB] uppercase tracking-wider mb-2 ${compact ? "text-[9px]" : "text-xs"}`}>
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.some((e) => e.title || e.company) && (
        <section className="mb-5">
          <h2 className={`font-bold text-[#3B5BDB] uppercase tracking-wider mb-3 ${compact ? "text-[9px]" : "text-xs"}`}>
            Work Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.filter((e) => e.title || e.company).map((entry) => (
              <div key={entry.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{entry.title}</p>
                    <p className="text-gray-500">{entry.company}</p>
                  </div>
                  {entry.period && <p className="text-gray-400 shrink-0">{entry.period}</p>}
                </div>
                {entry.bullets && (
                  <div className="mt-2 text-gray-600 whitespace-pre-line pl-1">{entry.bullets}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education.some((e) => e.degree || e.school) && (
        <section className="mb-5">
          <h2 className={`font-bold text-[#3B5BDB] uppercase tracking-wider mb-3 ${compact ? "text-[9px]" : "text-xs"}`}>
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.filter((e) => e.degree || e.school).map((entry) => (
              <div key={entry.id} className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{entry.degree}</p>
                  <p className="text-gray-500">{entry.school}</p>
                </div>
                {entry.year && <p className="text-gray-400 shrink-0">{entry.year}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resume.skills && (
        <section>
          <h2 className={`font-bold text-[#3B5BDB] uppercase tracking-wider mb-2 ${compact ? "text-[9px]" : "text-xs"}`}>
            Skills
          </h2>
          <p className="text-gray-700 whitespace-pre-line">{resume.skills}</p>
        </section>
      )}
    </div>
  );
}
