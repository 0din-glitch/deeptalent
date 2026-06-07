"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mic,
  MicOff,
  Video,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  X,
  Briefcase,
  Trophy,
} from "lucide-react";
import {
  SENIORITY_LEVELS,
  inferSeniority,
} from "@/lib/salary/scale";
import {
  useTextToSpeech,
  useSpeechRecognition,
  speechSupported,
} from "@/lib/interview/use-speech";
import { startInterview } from "@/lib/interview/actions";
import type { QualifiedRole, ScoreBand } from "@/lib/interview/matching";

const ROLE_CATEGORIES = [
  "Finance, Accounting & Compliance",
  "Engineering & Cloud",
  "Data & AI",
  "Cybersecurity & Risk",
  "Executive & Business Operations",
  "Customer Experience & Support",
  "Other",
];

type Phase = "profile" | "consent" | "interview" | "processing" | "results";

type Question = { id: string; question: string; focus?: string };
type AnswerDraft = { questionId: string; question: string; focus?: string; transcript: string };

type ScoreResult = {
  overallScore: number;
  band: ScoreBand;
  summary: string;
  strengths: string[];
  improvements: string[];
  perAnswer: { questionId: string; score: number; feedback: string; classification: string }[];
  qualifiedRoles: QualifiedRole[];
};

type InitialProfile = {
  full_name?: string | null;
  specialization?: string | null;
  role_category?: string | null;
  skills?: string[] | null;
  years_experience?: number | null;
  bio?: string | null;
};

const bandColor: Record<ScoreBand, string> = {
  excellent: "#16A34A",
  strong: "#3B5BDB",
  promising: "#D97706",
  developing: "#6B7280",
};

export function InterviewFlow({
  email,
  initialProfile,
}: {
  email: string;
  initialProfile: InitialProfile;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("profile");

  // ---- profile state ----
  const [fullName, setFullName] = useState(initialProfile.full_name ?? "");
  const [roleCategory, setRoleCategory] = useState(initialProfile.role_category ?? "");
  const [specialization, setSpecialization] = useState(initialProfile.specialization ?? "");
  const [years, setYears] = useState(
    initialProfile.years_experience != null ? String(initialProfile.years_experience) : "",
  );
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(initialProfile.skills ?? []);
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [error, setError] = useState<string | null>(null);

  const support = useMemo(() => speechSupported(), []);
  const seniority = useMemo(
    () => inferSeniority(years ? Number(years) : null, specialization),
    [years, specialization],
  );

  // ---- interview state ----
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerDraft[]>([]);
  const [stage, setStage] = useState<"idle" | "asking" | "answering">("idle");

  const { speak, cancel: cancelSpeak, speaking } = useTextToSpeech();
  const { start: startListening, stop: stopListening, listening, transcript, interim } =
    useSpeechRecognition();

  // ---- media (camera + recording) ----
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const [cameraReady, setCameraReady] = useState(false);

  // ---- results ----
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [processingMsg, setProcessingMsg] = useState("Analyzing your answers…");

  /* --------------------------- skills --------------------------- */
  const addSkill = useCallback(() => {
    const v = skillInput.trim();
    if (!v) return;
    setSkills((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setSkillInput("");
  }, [skillInput]);

  /* ----------------------- start: profile → consent ----------------------- */
  function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!specialization.trim() && !roleCategory) return setError("Tell us your role or specialization.");
    if (skills.length === 0) return setError("Add at least one relevant skill.");
    setPhase("consent");
  }

  /* ----------------------- camera setup ----------------------- */
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
      return stream;
    } catch {
      setError("Camera and microphone access is required for the interview. Please allow access and retry.");
      setCameraReady(false);
      return null;
    }
  }, []);

  function pickMimeType(): string {
    const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
    }
    return "video/webm";
  }

  const beginInterview = useCallback(async () => {
    setError(null);
    const stream = await initCamera();
    if (!stream) return;

    setLoadingQuestions(true);
    setPhase("interview");

    // Create interview row + generate questions in parallel.
    const yearsNum = years ? Number(years) : null;
    const [startRes, qRes] = await Promise.all([
      startInterview({
        candidateName: fullName.trim(),
        email,
        roleCategory,
        specialization: specialization.trim(),
        seniority,
        skills,
        yearsExperience: yearsNum,
        questions: [],
      }),
      fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          specialization: specialization.trim(),
          roleCategory,
          skills,
          yearsExperience: yearsNum,
          bio,
        }),
      }).then((r) => r.json()),
    ]);

    if ("id" in startRes && startRes.id) setInterviewId(startRes.id);
    const qs: Question[] = qRes?.questions ?? [];
    setQuestions(qs);
    setLoadingQuestions(false);

    // Start recording.
    try {
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.start(1000);
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
    } catch {
      /* recording optional; interview can still proceed */
    }

    // Ask the first question.
    if (qs.length > 0) askQuestion(qs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initCamera, years, fullName, email, roleCategory, specialization, seniority, skills, bio]);

  /* ----------------------- question/answer loop ----------------------- */
  const askQuestion = useCallback(
    async (q: Question) => {
      setStage("asking");
      await speak(q.question);
      setStage("idle");
    },
    [speak],
  );

  function handleStartAnswer() {
    cancelSpeak();
    setStage("answering");
    startListening();
  }

  function handleNext() {
    const finalTranscript = stopListening();
    const q = questions[current];
    const draft: AnswerDraft = {
      questionId: q.id,
      question: q.question,
      focus: q.focus,
      transcript: finalTranscript,
    };
    const nextAnswers = [...answers, draft];
    setAnswers(nextAnswers);
    setStage("idle");

    if (current + 1 < questions.length) {
      const next = current + 1;
      setCurrent(next);
      askQuestion(questions[next]);
    } else {
      finishInterview(nextAnswers);
    }
  }

  /* ----------------------- finish: stop recording, upload, score ----------------------- */
  const finishInterview = useCallback(
    async (allAnswers: AnswerDraft[]) => {
      cancelSpeak();
      setPhase("processing");
      setProcessingMsg("Saving your interview recording…");

      // Stop + assemble recording.
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const recorder = recorderRef.current;
      let videoBlob: Blob | null = null;
      if (recorder && recorder.state !== "inactive") {
        videoBlob = await new Promise<Blob>((resolve) => {
          recorder.onstop = () => resolve(new Blob(chunksRef.current, { type: recorder.mimeType }));
          recorder.stop();
        });
      }
      // Release camera.
      streamRef.current?.getTracks().forEach((t) => t.stop());

      // Upload video (best-effort).
      if (videoBlob && interviewId) {
        try {
          const fd = new FormData();
          const ext = recorder?.mimeType.includes("mp4") ? "mp4" : "webm";
          fd.append("video", videoBlob, `interview.${ext}`);
          fd.append("interviewId", interviewId);
          fd.append("duration", String(durationSeconds));
          await fetch("/api/interview/video", { method: "POST", body: fd });
        } catch {
          /* non-fatal */
        }
      }

      // Score answers.
      setProcessingMsg("Scoring your answers with AI…");
      try {
        const res = await fetch("/api/interview/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewId,
            fullName: fullName.trim(),
            specialization: specialization.trim(),
            roleCategory,
            skills,
            yearsExperience: years ? Number(years) : null,
            answers: allAnswers,
          }),
        });
        const data = (await res.json()) as ScoreResult;
        setResult(data);
        setPhase("results");
      } catch {
        setError("We couldn't score your interview. Please try again.");
        setPhase("results");
      }
    },
    [cancelSpeak, interviewId, fullName, specialization, roleCategory, skills, years],
  );

  // Attach the live camera stream to the <video> element once the interview
  // UI is actually mounted. initCamera() runs during the "consent" phase, before
  // the <video> exists, so we (re)bind the stream here whenever it's available.
  useEffect(() => {
    if (phase !== "interview") return;
    const el = videoRef.current;
    const stream = streamRef.current;
    if (el && stream && el.srcObject !== stream) {
      el.srcObject = stream;
      el.play().catch(() => {});
    }
  }, [phase, cameraReady]);

  // Cleanup media on unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* =========================== RENDER =========================== */
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <StepHeader phase={phase} />

        {phase === "profile" && (
          <ProfileStep
            fullName={fullName}
            setFullName={setFullName}
            roleCategory={roleCategory}
            setRoleCategory={setRoleCategory}
            specialization={specialization}
            setSpecialization={setSpecialization}
            years={years}
            setYears={setYears}
            skills={skills}
            setSkills={setSkills}
            skillInput={skillInput}
            setSkillInput={setSkillInput}
            addSkill={addSkill}
            bio={bio}
            setBio={setBio}
            seniority={seniority}
            error={error}
            onSubmit={submitProfile}
          />
        )}

        {phase === "consent" && (
          <ConsentStep
            support={support}
            error={error}
            onBack={() => {
              setError(null);
              setPhase("profile");
            }}
            onAgree={beginInterview}
          />
        )}

        {phase === "interview" && (
          <InterviewStep
            videoRef={videoRef}
            cameraReady={cameraReady}
            loadingQuestions={loadingQuestions}
            questions={questions}
            current={current}
            stage={stage}
            speaking={speaking}
            listening={listening}
            transcript={transcript}
            interim={interim}
            onReplay={() => askQuestion(questions[current])}
            onStartAnswer={handleStartAnswer}
            onNext={handleNext}
          />
        )}

        {phase === "processing" && <ProcessingStep message={processingMsg} />}

        {phase === "results" && result && (
          <ResultsStep result={result} onGoToDashboard={() => router.push("/dashboard")} />
        )}
        {phase === "results" && !result && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-foreground font-medium">{error ?? "Something went wrong."}</p>
            <button
              onClick={() => router.refresh()}
              className="mt-4 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ Sub-components ============================ */

function StepHeader({ phase }: { phase: Phase }) {
  const steps = [
    { key: "profile", label: "Profile" },
    { key: "consent", label: "Setup" },
    { key: "interview", label: "Interview" },
    { key: "results", label: "Results" },
  ];
  const order: Record<Phase, number> = {
    profile: 0,
    consent: 1,
    interview: 2,
    processing: 2,
    results: 3,
  };
  const activeIdx = order[phase];
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold text-primary">DeepTalent AI Screening</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance mb-5">
        Your AI Interview
      </h1>
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i < activeIdx
                    ? "bg-primary text-primary-foreground"
                    : i === activeIdx
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < activeIdx ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  i <= activeIdx ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${i < activeIdx ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileStep(props: {
  fullName: string;
  setFullName: (v: string) => void;
  roleCategory: string;
  setRoleCategory: (v: string) => void;
  specialization: string;
  setSpecialization: (v: string) => void;
  years: string;
  setYears: (v: string) => void;
  skills: string[];
  setSkills: (v: string[]) => void;
  skillInput: string;
  setSkillInput: (v: string) => void;
  addSkill: () => void;
  bio: string;
  setBio: (v: string) => void;
  seniority: string;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const {
    fullName, setFullName, roleCategory, setRoleCategory, specialization, setSpecialization,
    years, setYears, skills, setSkills, skillInput, setSkillInput, addSkill, bio, setBio,
    seniority, error, onSubmit,
  } = props;

  return (
    <form onSubmit={onSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Build your candidate profile</h2>
        <p className="text-sm text-muted-foreground">
          This tailors your interview questions and the roles you&apos;ll qualify for.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
        <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Role category</label>
          <select className="form-input" value={roleCategory} onChange={(e) => setRoleCategory(e.target.value)}>
            <option value="">Select a category</option>
            {ROLE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Specialization / title</label>
          <input
            className="form-input"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Full-Stack Developer"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Years of experience</label>
          <input
            type="number"
            min={0}
            max={50}
            className="form-input"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Detected seniority</label>
          <div className="form-input bg-muted/50 capitalize flex items-center">
            {SENIORITY_LEVELS.find((s) => s.value === seniority)?.label ?? seniority}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Relevant skills</label>
        <div className="flex gap-2">
          <input
            className="form-input flex-1"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Type a skill and press Enter (e.g. React)"
          />
          <button type="button" onClick={addSkill} className="px-4 rounded-lg bg-primary text-primary-foreground font-medium">
            Add
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                {s}
                <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Short bio (optional)</label>
        <textarea
          className="form-input min-h-24"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A sentence or two about your background."
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <button type="submit" className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
        Continue to interview setup <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

function ConsentStep({
  support,
  error,
  onBack,
  onAgree,
}: {
  support: { tts: boolean; stt: boolean };
  error: string | null;
  onBack: () => void;
  onAgree: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const sttMissing = !support.stt;
  return (
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Video className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Camera &amp; microphone consent</h2>
          <p className="text-sm text-muted-foreground">Here&apos;s how the AI interview works.</p>
        </div>
      </div>

      <ul className="space-y-3">
        {[
          { icon: Volume2, text: "Our AI interviewer will read each question aloud. There are about 5 questions." },
          { icon: Mic, text: "You answer out loud — your speech is transcribed in real time so the AI can score your responses." },
          { icon: Video, text: "Your webcam is recorded during the interview and stored securely for our hiring team to review." },
          { icon: ShieldCheck, text: "Your recording is private. Only DeepTalent's admissions team can access it." },
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-foreground">
            <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      {sttMissing && (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Your browser doesn&apos;t support live speech recognition. For the best experience use Chrome or Edge on desktop.
            You can still record the interview.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack} className="px-5 py-3 rounded-lg border border-border text-foreground font-medium">
          Back
        </button>
        <button
          onClick={() => {
            setBusy(true);
            onAgree();
          }}
          disabled={busy}
          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
          I agree — enable camera &amp; start
        </button>
      </div>
    </div>
  );
}

function InterviewStep(props: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
  loadingQuestions: boolean;
  questions: Question[];
  current: number;
  stage: "idle" | "asking" | "answering";
  speaking: boolean;
  listening: boolean;
  transcript: string;
  interim: string;
  onReplay: () => void;
  onStartAnswer: () => void;
  onNext: () => void;
}) {
  const {
    videoRef, cameraReady, loadingQuestions, questions, current, stage,
    speaking, listening, transcript, interim, onReplay, onStartAnswer, onNext,
  } = props;
  const q = questions[current];
  const isLast = current === questions.length - 1;

  return (
    <div className="space-y-5">
      {/* Camera preview */}
      <div className="relative bg-foreground/95 rounded-2xl overflow-hidden aspect-video">
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> REC
        </div>
        {questions.length > 0 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Question {current + 1} of {questions.length}
          </div>
        )}
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Starting camera…
          </div>
        )}
      </div>

      {/* Question + controls */}
      <div className="bg-card rounded-2xl border border-border p-6">
        {loadingQuestions || !q ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-6 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Preparing your personalized questions…
          </div>
        ) : (
          <>
            {q.focus && (
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
                {q.focus}
              </span>
            )}
            <p className="text-lg font-medium text-foreground text-pretty mb-1 flex items-start gap-2">
              {speaking && <Volume2 className="w-5 h-5 text-primary shrink-0 mt-1 animate-pulse" />}
              {q.question}
            </p>

            {/* live transcript */}
            {(stage === "answering" || transcript) && (
              <div className="mt-4 bg-muted/60 rounded-xl p-4 min-h-20">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  {listening ? (
                    <>
                      <Mic className="w-3.5 h-3.5 text-red-600 animate-pulse" /> Listening…
                    </>
                  ) : (
                    <>
                      <MicOff className="w-3.5 h-3.5" /> Your answer
                    </>
                  )}
                </div>
                <p className="text-sm text-foreground">
                  {transcript}
                  <span className="text-muted-foreground">{interim ? ` ${interim}` : ""}</span>
                  {!transcript && !interim && (
                    <span className="text-muted-foreground italic">Start speaking your answer…</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                onClick={onReplay}
                disabled={speaking || stage === "answering"}
                className="px-4 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Volume2 className="w-4 h-4" /> Replay
              </button>

              {stage !== "answering" ? (
                <button
                  onClick={onStartAnswer}
                  disabled={speaking}
                  className="flex-1 min-w-40 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Mic className="w-4 h-4" /> Start answering
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="flex-1 min-w-40 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {isLast ? (
                    <>Finish interview <CheckCircle2 className="w-4 h-4" /></>
                  ) : (
                    <>Next question <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProcessingStep({ message }: { message: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">{message}</h2>
      <p className="text-sm text-muted-foreground">This usually takes a few seconds. Please don&apos;t close this page.</p>
    </div>
  );
}

function ResultsStep({
  result,
  onGoToDashboard,
}: {
  result: ScoreResult;
  onGoToDashboard: () => void;
}) {
  const color = bandColor[result.band];
  const bandLabel = result.band.charAt(0).toUpperCase() + result.band.slice(1);
  const roles = result.qualifiedRoles ?? [];

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="w-5 h-5" style={{ color }} />
          <span className="text-sm font-semibold" style={{ color }}>
            {bandLabel} performance
          </span>
        </div>
        <ScoreRing score={result.overallScore} color={color} />
        <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto text-pretty">{result.summary}</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6 text-left">
          {result.strengths?.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Strengths</h3>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.improvements?.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">Areas to improve</h3>
              <ul className="space-y-1.5">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Qualifying roles */}
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {roles.length > 0 ? "Roles you qualify for" : "Keep building your profile"}
          </h2>
        </div>

        {roles.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your interview score and skills, you can apply for these roles now.
            </p>
            <div className="space-y-3">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 border border-border rounded-xl p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{r.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {r.seniority} level · ${r.monthlyUsd.toLocaleString("en-US")}/mo · {r.matchScore}% match
                    </p>
                  </div>
                  <Link
                    href={`/talents/apply/form?role_id=${r.id}&role_title=${encodeURIComponent(
                      r.label,
                    )}`}
                    className="shrink-0 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5"
                  >
                    Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your interview score didn&apos;t unlock roles yet. Strengthen your profile and retake the interview to
            qualify for open positions.
          </p>
        )}

        <button
          onClick={onGoToDashboard}
          className="w-full mt-6 py-3 rounded-lg border border-border text-foreground font-medium"
        >
          Go to my dashboard
        </button>
      </div>
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c;
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
