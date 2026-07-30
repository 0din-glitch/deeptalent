"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { OtpInput } from "@/components/auth/otp-input";
import {
  signUpWithResendConfirmation,
  verifyEmailCode,
  resendEmailCode,
} from "@/app/auth/actions";
import { Loader2, MailCheck } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "company" ? "company" : "talent";
  const prefilledName = searchParams.get("name") || "";
  const prefilledEmail = searchParams.get("email") || "";
  const next = searchParams.get("next");

  const [step, setStep] = useState<"form" | "verify">("form");
  const [fullName, setFullName] = useState(prefilledName);
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"talent" | "company">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // verification step
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const signInHref = `/auth/login${next ? `?next=${encodeURIComponent(next)}${email ? `&email=${encodeURIComponent(email)}` : ""}` : ""}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarning(null);

    const result = await signUpWithResendConfirmation(email, password, fullName, role);

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

    const result = await verifyEmailCode(email, finalCode, next);
    if (result.error) {
      setError(result.error);
      setVerifying(false);
      return;
    }

    router.push(result.redirect || "/dashboard");
    router.refresh();
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    setResent(false);
    const result = await resendEmailCode(email);
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
      <AuthShell
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
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white font-semibold text-[#3B5BDB] transition-colors hover:bg-white/90 disabled:opacity-60"
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
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Join DeepTalent and get matched with elite opportunities."
      activeTab="signup"
      signInHref={signInHref}
      footer={
        <>
          Already have an account?{" "}
          <Link href={signInHref} className="font-semibold text-white underline underline-offset-2 hover:text-white/80">
            Log in
          </Link>
          <SocialAuthButtons />
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("talent")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                role === "talent"
                  ? "border-white bg-white text-[#3B5BDB]"
                  : "border-white/25 text-white/80 hover:border-white/50"
              }`}
            >
              Talent
            </button>
            <button
              type="button"
              onClick={() => setRole("company")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                role === "company"
                  ? "border-white bg-white text-[#3B5BDB]"
                  : "border-white/25 text-white/80 hover:border-white/50"
              }`}
            >
              Company
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-white/80">
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
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="frosted-input"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
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

        {error && (
          <div className="rounded-xl border border-red-300/30 bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white font-semibold text-[#3B5BDB] transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Create an account"}
        </button>

        <p className="text-pretty text-center text-xs text-white/60">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
