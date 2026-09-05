"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { NyscAuthShell } from "@/components/auth/nysc-auth-shell";
import { OtpInput } from "@/components/auth/otp-input";
import { CaptchaCheck } from "@/components/auth/captcha-check";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { signUpNyscCorpsMember, verifyEmailCode, resendEmailCode } from "@/app/auth/actions";
import { Loader2, MailCheck } from "lucide-react";

const CALL_UP_PATTERN = /^NYSC\/[A-Z]{3,4}\/\d{4}\/\d{4,7}$/;
const STATE_CODE_PATTERN = /^[A-Z]{2}\/\d{2}[A-Z]?\/\d{3,5}$/;

function NyscForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const track = searchParams.get("track") === "training" ? "training" : "ready";
  const noCallUp = searchParams.get("noCallUp") === "1";

  const [step, setStep] = useState<"form" | "verify">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [callUpNumber, setCallUpNumber] = useState("");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [school, setSchool] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWarning(null);

    let normalizedCallUp: string | null = null;
    let normalizedStateCode: string | null = null;

    if (!noCallUp) {
      normalizedCallUp = callUpNumber.trim().toUpperCase();
      if (!CALL_UP_PATTERN.test(normalizedCallUp)) {
        setError("Enter a valid call-up number, e.g. NYSC/UNL/2024/1234567.");
        return;
      }
      normalizedStateCode = stateCode.trim().toUpperCase();
      if (!STATE_CODE_PATTERN.test(normalizedStateCode)) {
        setError("Enter a valid post-NYSC state code, e.g. OG/24B/1234.");
        return;
      }
      if (!stateOfOrigin) {
        setError("Select your state of origin.");
        return;
      }
    }
    if (!captchaVerified) {
      setError("Complete the security check before continuing.");
      return;
    }

    setLoading(true);
    const result = await signUpNyscCorpsMember(
      email,
      password,
      fullName,
      normalizedCallUp,
      noCallUp ? null : stateOfOrigin,
      normalizedStateCode,
      track,
      noCallUp ? { school: school.trim() || undefined, nyscStatus: "not_started" } : undefined
    );

    if (result.error && !("needsCode" in result && result.needsCode)) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if ("warning" in result && result.warning) setWarning(result.warning);
    setStep("verify");
    setLoading(false);
  }

  async function handleVerify(submitted?: string) {
    const finalCode = submitted ?? code;
    if (finalCode.length !== 6) return;
    setVerifying(true);
    setError(null);

    // Ready corps members go straight to open junior roles; those choosing the
    // training track land on the course catalogue with lesson one unlocked.
    const destination = track === "training" ? "/nysc/training" : "/nysc/roles";

    const result = await verifyEmailCode(email, finalCode, destination);
    if (result.error) {
      setError(result.error);
      setVerifying(false);
      return;
    }

    router.push(result.redirect || destination);
    router.refresh();
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    setResent(false);
    const result = await resendEmailCode(email, "nysc");
    if (result.error) {
      setError(result.error);
    } else {
      setResent(true);
      setWarning(null);
    }
    setResending(false);
  }

  if (step === "verify") {
    return (
      <NyscAuthShell
        title="Enter your code"
        subtitle={`We sent a 6-digit verification code to ${email}. Enter it below to activate your account.`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white">
              <MailCheck className="size-7" />
            </div>
          </div>

          <OtpInput value={code} onChange={setCode} onComplete={(c) => handleVerify(c)} disabled={verifying} />

          {error && (
            <div className="rounded-xl border border-red-300/30 bg-red-500/15 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
          {warning && !error && (
            <div className="rounded-xl border border-amber-300/30 bg-amber-400/15 p-3 text-sm text-amber-50">
              {warning}
            </div>
          )}
          {resent && !error && (
            <p className="text-center text-sm text-white/80">A fresh code is on its way.</p>
          )}

          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={verifying || code.length !== 6}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white font-semibold text-[#0F7A3D] transition-colors hover:bg-white/90 disabled:opacity-60"
          >
            {verifying ? <Loader2 className="size-5 animate-spin" /> : "Verify & continue"}
          </button>

          <p className="text-center text-sm text-white/70">
            Didn&apos;t get it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-white underline underline-offset-2 hover:text-white/80 disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </p>
        </div>
      </NyscAuthShell>
    );
  }

  return (
    <NyscAuthShell
      title={noCallUp ? "Join the Post-NYSC pathway" : "Post-NYSC Corps Member sign up"}
      subtitle={
        noCallUp
          ? "Not in NYSC yet? No call-up number or state code needed — sign up with your email and we'll get you Global Workforce Ready."
          : track === "training"
          ? "Get Global Workforce Ready — tell us where you're starting from and we'll route you into a post-NYSC pathway."
          : "I'm Global Workforce Ready — verify your credentials and apply to global roles."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/nysc/login" className="font-semibold text-white underline underline-offset-2 hover:text-white/80">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-white/90">
            Full name
          </label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="frosted-input"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/90">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="frosted-input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/90">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="frosted-input"
            placeholder="At least 6 characters"
          />
        </div>

        {noCallUp ? (
          <div>
            <label htmlFor="school" className="mb-1.5 block text-sm font-medium text-white/90">
              School / institution <span className="text-white/50">(optional)</span>
            </label>
            <input
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="frosted-input"
              placeholder="University of Lagos"
            />
            <p className="mt-1 text-xs text-white/60">
              No call-up number yet? No problem — you can log in and complete this later.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="callUpNumber" className="mb-1.5 block text-sm font-medium text-white/90">
                Post-NYSC call-up number
              </label>
              <input
                id="callUpNumber"
                required
                value={callUpNumber}
                onChange={(e) => setCallUpNumber(e.target.value)}
                className="frosted-input uppercase"
                placeholder="NYSC/UNL/2024/1234567"
              />
              <p className="mt-1 text-xs text-white/60">Format: NYSC/[SCHOOL]/[YEAR]/[NUMBER]</p>
            </div>

            <div>
              <label htmlFor="stateOfOrigin" className="mb-1.5 block text-sm font-medium text-white/90">
                State of origin
              </label>
              <select
                id="stateOfOrigin"
                required
                value={stateOfOrigin}
                onChange={(e) => setStateOfOrigin(e.target.value)}
                className="frosted-input [color-scheme:dark]"
              >
                <option value="" disabled className="text-gray-900">
                  Select your state
                </option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state} className="text-gray-900">
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="stateCode" className="mb-1.5 block text-sm font-medium text-white/90">
                Post-NYSC state code
              </label>
              <input
                id="stateCode"
                required
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="frosted-input uppercase"
                placeholder="OG/24B/1234"
              />
            </div>
          </>
        )}

        <CaptchaCheck onVerified={setCaptchaVerified} />

        {error && (
          <div className="rounded-xl border border-red-300/30 bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white font-semibold text-[#0F7A3D] transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Create an account"}
        </button>

        <p className="text-pretty text-center text-xs text-white/60">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>

        {noCallUp && (
          <p className="text-center text-xs text-white/60">
            You&apos;ll log in with this email — no state code required.
          </p>
        )}
      </form>
    </NyscAuthShell>
  );
}

export default function NyscSignUpPage() {
  return (
    <Suspense fallback={null}>
      <NyscForm />
    </Suspense>
  );
}
