"use client";

import { useState, useRef, useCallback } from "react";
import useSWR, { mutate } from "swr";
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
  ArrowRight,
  ArrowLeft,
  Zap,
  AlertCircle,
  RotateCcw,
  Wand2,
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
/* Wizard step definitions                                             */
/* ------------------------------------------------------------------ */
interface WizardStep {
  id: string;
  question: string;
  hint?: string;
  field: string;
  type: "text" | "textarea" | "email";
  placeholder: string;
  required?: boolean;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "fullName",
    question: "What is your full name?",
    field: "fullName",
    type: "text",
    placeholder: "e.g. Amara Osei",
    required: true,
  },
  {
    id: "email",
    question: "What is your email address?",
    field: "email",
    type: "email",
    placeholder: "you@example.com",
    required: true,
  },
  {
    id: "phone",
    question: "What is your phone number?",
    hint: "Include country code for global roles",
    field: "phone",
    type: "text",
    placeholder: "+234 801 234 5678",
  },
  {
    id: "location",
    question: "Where are you based?",
    field: "location",
    type: "text",
    placeholder: "e.g. Lagos, Nigeria",
  },
  {
    id: "linkedin",
    question: "Your LinkedIn URL (optional)",
    field: "linkedin",
    type: "text",
    placeholder: "https://linkedin.com/in/yourname",
  },
  {
    id: "targetRole",
    question: "What role are you targeting?",
    hint: "Be specific — this shapes the entire resume",
    field: "targetRole",
    type: "text",
    placeholder: "e.g. Senior Software Engineer, FP&A Manager, KYC Analyst",
    required: true,
  },
  {
    id: "yearsExperience",
    question: "How many years of experience do you have?",
    field: "yearsExperience",
    type: "text",
    placeholder: "e.g. 5 years",
    required: true,
  },
  {
    id: "currentTitle",
    question: "What is your current or most recent job title?",
    field: "currentTitle",
    type: "text",
    placeholder: "e.g. Software Engineer at Paystack",
  },
  {
    id: "topSkills",
    question: "List your top skills",
    hint: "Technologies, tools, frameworks, soft skills — the more specific the better",
    field: "topSkills",
    type: "textarea",
    placeholder: "e.g. Python, React, AWS, SQL, Financial Modelling, Excel, Team Leadership",
    required: true,
  },
  {
    id: "biggestAchievement",
    question: "Describe your single biggest professional achievement",
    hint: "Include numbers and impact — this becomes the centrepiece of your summary",
    field: "biggestAchievement",
    type: "textarea",
    placeholder: "e.g. Led migration of monolith to microservices, cutting deployment time from 2 hours to 8 minutes and reducing cloud costs by 40%.",
    required: true,
  },
  {
    id: "workHistory",
    question: "Describe your work history",
    hint: "One job per line — Company | Title | Period | What you did",
    field: "workHistory",
    type: "textarea",
    placeholder: "Paystack | Backend Engineer | 2021–2024 | Built payment APIs processing $2M daily\nFlutterwave | Junior Developer | 2019–2021 | Maintained checkout flow used by 50K merchants",
    required: true,
  },
  {
    id: "education",
    question: "List your education",
    hint: "One entry per line — Degree | School | Year",
    field: "education",
    type: "textarea",
    placeholder: "BSc Computer Science | University of Lagos | 2019\nACA | ICAN | 2021",
    required: true,
  },
  {
    id: "extraContext",
    question: "Anything else you want the AI to know?",
    hint: "Certifications, awards, publications, visa status, notable projects",
    field: "extraContext",
    type: "textarea",
    placeholder: "AWS Certified Solutions Architect. Open-source contributor to React Native. Remote work experience since 2020.",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
const fetcher = (url: string) => fetch(url).then((r) => r.json());
const WIZARD_CREDIT_COST = 5;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const EMPTY_WORK = (): WorkEntry => ({
  id: uid(),
  title: "",
  company: "",
  period: "",
  bullets: "",
});

const EMPTY_EDU = (): EduEntry => ({
  id: uid(),
  degree: "",
  school: "",
  year: "",
});

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */
export function ResumeBuilder({ profile }: { profile: any }) {
  const { data: creditsData } = useSWR<{ credits: number }>("/api/credits", fetcher, {
    refreshInterval: 30_000,
  });
  const credits = creditsData?.credits ?? 0;

  const [mode, setMode] = useState<"choose" | "wizard" | "manual">("choose");
  const [preview, setPreview] = useState(false);
  const [openSection, setOpenSection] = useState<string>("personal");
  const [generating, setGenerating] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const [resume, setResume] = useState<ResumeData>({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.country || "",
    linkedin: "",
    website: "",
    summary: "",
    experience: [EMPTY_WORK()],
    education: [EMPTY_EDU()],
    skills: profile?.skills || "",
  });

  /* ---- wizard state ---- */
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>({
    fullName: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.country || "",
    topSkills: profile?.skills || "",
  });
  const [wizardBuilding, setWizardBuilding] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);

  /* ---- resume setters ---- */
  function set<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setResume((r) => ({ ...r, [key]: value }));
  }

  function updateWork(id: string, field: keyof WorkEntry, value: string) {
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  function updateEdu(id: string, field: keyof EduEntry, value: string) {
    setResume((r) => ({
      ...r,
      education: r.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  /* ---- AI section generate ---- */
  async function aiGenerate(section: string, context?: string) {
    setGenerating(section);
    try {
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, currentData: context, profile, prompt: "" }),
      });
      const { text } = await res.json();
      if (section === "summary") set("summary", text);
      if (section === "skills") set("skills", text);
      if (section === "experience" && context) {
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

  /* ---- PDF export ---- */
  const handleExportPdf = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: previewRef.current.scrollWidth,
        windowHeight: previewRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let imgWidth = pdfWidth;
      let imgHeight = pdfWidth / ratio;

      // If taller than one page, split across pages
      let yOffset = 0;
      while (yOffset < imgHeight) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -yOffset, imgWidth, imgHeight);
        yOffset += pdfHeight;
      }

      const fileName = resume.fullName
        ? `${resume.fullName.replace(/\s+/g, "_")}_Resume.pdf`
        : "Resume.pdf";
      pdf.save(fileName);
    } catch (err) {
      console.error("[v0] PDF export error:", err);
    }
  }, [resume.fullName]);

  /* ---- wizard submit ---- */
  async function handleWizardBuild() {
    setWizardBuilding(true);
    setWizardError(null);
    try {
      const res = await fetch("/api/resume/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wizardAnswers),
      });
      const data = await res.json();
      if (!res.ok) {
        setWizardError(data.error || "Build failed. Please try again.");
        return;
      }

      const { resumeData } = data;

      // Merge wizard personal fields + AI-generated sections
      setResume({
        fullName: wizardAnswers.fullName || "",
        email: wizardAnswers.email || "",
        phone: wizardAnswers.phone || "",
        location: wizardAnswers.location || "",
        linkedin: wizardAnswers.linkedin || "",
        website: "",
        summary: resumeData.summary || "",
        experience: (resumeData.experience || []).map((e: any) => ({
          id: uid(),
          title: e.title || "",
          company: e.company || "",
          period: e.period || "",
          bullets: e.bullets || "",
        })),
        education: (resumeData.education || []).map((e: any) => ({
          id: uid(),
          degree: e.degree || "",
          school: e.school || "",
          year: e.year || "",
        })),
        skills: resumeData.skills || "",
      });

      mutate("/api/credits");
      setMode("manual"); // drop into edit mode so they can tweak
      setPreview(true);   // show preview straight away
    } catch {
      setWizardError("Something went wrong. Please try again.");
    } finally {
      setWizardBuilding(false);
    }
  }

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "summary", label: "Professional Summary", icon: FileText },
    { id: "experience", label: "Work Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Code2 },
  ];

  /* ============================================================ */
  /* MODE: choose                                                  */
  /* ============================================================ */
  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Builder</h2>
          <p className="text-sm text-gray-500 mt-0.5">Choose how you want to create your resume.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Build with AI */}
          <button
            onClick={() => setMode("wizard")}
            className="group relative flex flex-col items-start gap-4 rounded-2xl border-2 border-[#3B5BDB]/30 bg-[#3B5BDB]/4 hover:border-[#3B5BDB] hover:bg-[#3B5BDB]/8 p-6 text-left transition-all"
          >
            <div className="size-12 rounded-xl bg-[#3B5BDB] flex items-center justify-center">
              <Wand2 className="size-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Build with AI</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Answer a series of questions and let the AI write your full resume for you — summary,
                bullets, skills, and all.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3B5BDB]">
              <Zap className="size-3.5" /> {WIZARD_CREDIT_COST} credits
            </div>
          </button>

          {/* Build manually */}
          <button
            onClick={() => setMode("manual")}
            className="group flex flex-col items-start gap-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 p-6 text-left transition-all"
          >
            <div className="size-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <FileText className="size-6 text-gray-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Build manually</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Fill in each section yourself. AI generate buttons are available on every section to
                help you write stronger content.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <Sparkles className="size-3.5" /> AI assist included
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================ */
  /* MODE: wizard                                                  */
  /* ============================================================ */
  if (mode === "wizard") {
    const step = WIZARD_STEPS[wizardStep];
    const isLast = wizardStep === WIZARD_STEPS.length - 1;
    const currentValue = wizardAnswers[step.field] || "";
    const canNext = !step.required || currentValue.trim().length > 0;
    const progress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100;

    if (wizardBuilding) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-6 max-w-3xl">
          <div className="size-16 rounded-2xl bg-[#3B5BDB]/10 flex items-center justify-center">
            <Sparkles className="size-8 text-[#3B5BDB] animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">Building your resume...</p>
            <p className="text-sm text-gray-500 mt-1">
              The AI is crafting your summary, bullets, and skills. This takes about 15 seconds.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Build with AI</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Step {wizardStep + 1} of {WIZARD_STEPS.length}
            </p>
          </div>
          <button
            onClick={() => setMode("choose")}
            className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-[#3B5BDB] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-lg font-bold text-gray-900 leading-snug">{step.question}</p>
            {step.hint && <p className="text-sm text-gray-400 mt-1">{step.hint}</p>}
          </div>

          {step.type === "textarea" ? (
            <textarea
              autoFocus
              rows={5}
              value={currentValue}
              onChange={(e) =>
                setWizardAnswers((prev) => ({ ...prev, [step.field]: e.target.value }))
              }
              placeholder={step.placeholder}
              className="w-full form-input text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey && canNext) {
                  e.preventDefault();
                  isLast ? handleWizardBuild() : setWizardStep((s) => s + 1);
                }
              }}
            />
          ) : (
            <input
              autoFocus
              type={step.type}
              value={currentValue}
              onChange={(e) =>
                setWizardAnswers((prev) => ({ ...prev, [step.field]: e.target.value }))
              }
              placeholder={step.placeholder}
              className="w-full form-input text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && canNext) {
                  e.preventDefault();
                  isLast ? handleWizardBuild() : setWizardStep((s) => s + 1);
                }
              }}
            />
          )}

          {step.required && !currentValue.trim() && (
            <p className="text-xs text-amber-600">This field is required to continue.</p>
          )}
        </div>

        {wizardError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            {wizardError}
          </div>
        )}

        {/* Credits notice on last step */}
        {isLast && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#3B5BDB]/6 border border-[#3B5BDB]/20 text-sm text-[#3B5BDB]">
            <Zap className="size-4 shrink-0" />
            <span>
              Building costs <strong>{WIZARD_CREDIT_COST} credits</strong>. You have {credits}.
            </span>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => (wizardStep === 0 ? setMode("choose") : setWizardStep((s) => s - 1))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            {wizardStep === 0 ? "Back" : "Previous"}
          </button>

          {isLast ? (
            <button
              onClick={handleWizardBuild}
              disabled={!canNext || credits < WIZARD_CREDIT_COST}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="size-4" />
              Build my resume
            </button>
          ) : (
            <button
              onClick={() => setWizardStep((s) => s + 1)}
              disabled={!canNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ============================================================ */
  /* MODE: manual editor                                           */
  /* ============================================================ */
  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("choose")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw className="size-3.5" /> Start over
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Resume Builder</h2>
            <p className="text-xs text-gray-400">AI-powered — edit any section and regenerate anytime</p>
          </div>
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
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors"
          >
            <Download className="size-4" /> Export PDF
          </button>
        </div>
      </div>

      {preview ? (
        /* Full preview with ref for PDF export */
        <div ref={previewRef}>
          <ResumePreview resume={resume} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Editor */}
          <div className="space-y-3">
            {sections.map(({ id, label, icon: Icon }) => {
              const isOpen = openSection === id;
              return (
                <div key={id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(isOpen ? "" : id)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/80 transition-colors"
                  >
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isOpen ? "bg-[#3B5BDB] text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
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
                      {id === "personal" && <PersonalSection resume={resume} set={set} />}
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
                            setResume((r) => ({ ...r, experience: [...r.experience, EMPTY_WORK()] }))
                          }
                          onRemove={(removeId) =>
                            setResume((r) => ({
                              ...r,
                              experience: r.experience.filter((e) => e.id !== removeId),
                            }))
                          }
                          onGenerate={(entryId, ctx) => aiGenerate("experience", ctx)}
                          generating={generating === "experience"}
                          saved={saved === "experience"}
                        />
                      )}
                      {id === "education" && (
                        <EducationSection
                          entries={resume.education}
                          onChange={updateEdu}
                          onAdd={() =>
                            setResume((r) => ({ ...r, education: [...r.education, EMPTY_EDU()] }))
                          }
                          onRemove={(removeId) =>
                            setResume((r) => ({
                              ...r,
                              education: r.education.filter((e) => e.id !== removeId),
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

          {/* Mini preview sidebar — not captured for PDF */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 px-1">
                Live preview
              </p>
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
/* Section sub-components                                              */
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
      {saved ? "Generated" : generating ? "Generating..." : "AI Generate"}
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
        placeholder="A compelling 3–4 sentence overview of your experience, skills, and career goals..."
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
        <div
          key={entry.id}
          className="space-y-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
        >
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
              <input
                value={entry.title}
                onChange={(e) => onChange(entry.id, "title", e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full form-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Company</label>
              <input
                value={entry.company}
                onChange={(e) => onChange(entry.id, "company", e.target.value)}
                placeholder="e.g. Paystack"
                className="w-full form-input text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Period</label>
              <input
                value={entry.period}
                onChange={(e) => onChange(entry.id, "period", e.target.value)}
                placeholder="e.g. Jan 2022 – Present"
                className="w-full form-input text-sm"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400">Key achievements &amp; responsibilities</label>
              <AiButton
                onClick={() => onGenerate(entry.id, `${entry.title} at ${entry.company}`)}
                generating={generating}
                saved={saved}
              />
            </div>
            <textarea
              value={entry.bullets}
              onChange={(e) => onChange(entry.id, "bullets", e.target.value)}
              placeholder={"• Led development of...\n• Reduced load times by...\n• Managed a team of..."}
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
        <div
          key={entry.id}
          className="space-y-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Entry {idx + 1}</p>
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
              <label className="block text-xs text-gray-400 mb-1">Degree / Qualification</label>
              <input
                value={entry.degree}
                onChange={(e) => onChange(entry.id, "degree", e.target.value)}
                placeholder="e.g. BSc Computer Science"
                className="w-full form-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Institution</label>
              <input
                value={entry.school}
                onChange={(e) => onChange(entry.id, "school", e.target.value)}
                placeholder="e.g. University of Lagos"
                className="w-full form-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Year</label>
              <input
                value={entry.year}
                onChange={(e) => onChange(entry.id, "year", e.target.value)}
                placeholder="e.g. 2019"
                className="w-full form-input text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-sm font-medium text-[#3B5BDB] hover:underline"
      >
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
        placeholder={"Languages: TypeScript, Python, Go\nFrameworks: React, Next.js, Node.js\nTools: Docker, Git, AWS\nSoft Skills: Leadership, Communication"}
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
    <div
      className={`bg-white ${p} font-sans text-gray-900 ${
        compact ? "text-[11px]" : "text-sm"
      } leading-relaxed`}
    >
      {/* Header */}
      <div className="border-b-2 border-[#3B5BDB] pb-4 mb-5">
        <h1
          className={`font-extrabold text-gray-900 ${
            compact ? "text-xl" : "text-3xl"
          } leading-tight`}
        >
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
          <h2
            className={`font-bold text-[#3B5BDB] uppercase tracking-wider mb-2 ${
              compact ? "text-[9px]" : "text-xs"
            }`}
          >
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.some((e) => e.title || e.company) && (
        <section className="mb-5">
          <h2
            className={`font-bold text-[#3B5BDB] uppercase tracking-wider mb-3 ${
              compact ? "text-[9px]" : "text-xs"
            }`}
          >
            Work Experience
          </h2>
          <div className="space-y-4">
            {resume.experience
              .filter((e) => e.title || e.company)
              .map((entry) => (
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
          <h2
            className={`font-bold text-[#3B5BDB] uppercase tracking-wider mb-3 ${
              compact ? "text-[9px]" : "text-xs"
            }`}
          >
            Education
          </h2>
          <div className="space-y-2">
            {resume.education
              .filter((e) => e.degree || e.school)
              .map((entry) => (
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
          <h2
            className={`font-bold text-[#3B5BDB] uppercase tracking-wider mb-2 ${
              compact ? "text-[9px]" : "text-xs"
            }`}
          >
            Skills
          </h2>
          <p className="text-gray-700 whitespace-pre-line">{resume.skills}</p>
        </section>
      )}
    </div>
  );
}
