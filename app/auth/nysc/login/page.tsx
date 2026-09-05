"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NyscAuthShell } from "@/components/auth/nysc-auth-shell";
import { resolveNyscLogin, getNyscDestination } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";

const STATE_CODE_PATTERN = /^[A-Z]{2}\/\d{2}[A-Z]?\/\d{3,5}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginMode = "stateCode" | "email";

function NyscLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("stateCode");
  const [stateCode, setStateCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Shared sign-in with the legacy-password fallback (mirrors the standard login).
  async function signInWithFallback(loginEmail: string) {
    const supabase = createClient();
    let { error: signInError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

    if (signInError) {
      try {
        const res = await fetch("/api/auth/legacy-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password }),
        });
        const data = await res.json();
        if (data?.ok) {
          const retry = await supabase.auth.signInWithPassword({ email: loginEmail, password });
          signInError = retry.error;
        }
      } catch {
        // fall through to original error
      }
    }

    return signInError;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "email") {
      // No call-up number / state code on file — sign in with email directly,
      // then resolve the pathway destination from the session server-side.
      const normalizedEmail = email.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(normalizedEmail)) {
        setError("Enter a valid email address.");
        setLoading(false);
        return;
      }

      const signInError = await signInWithFallback(normalizedEmail);
      if (signInError) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      const destination = await getNyscDestination();
      router.push(destination);
      router.refresh();
      return;
    }

    const normalized = stateCode.trim().toUpperCase();
    if (!STATE_CODE_PATTERN.test(normalized)) {
      setError("Enter a valid post-NYSC state code, e.g. OG/24B/1234.");
      setLoading(false);
      return;
    }

    // Corps members authenticate by state code: resolve the linked email first,
    // then complete a normal Supabase password sign-in with that email.
    const resolved = await resolveNyscLogin(normalized);
    if ("error" in resolved) {
      setError(resolved.error);
      setLoading(false);
      return;
    }

    const { email: resolvedEmail, destination } = resolved;
    const signInError = await signInWithFallback(resolvedEmail);

    if (signInError) {
      // Genericize to avoid leaking which state codes exist.
      setError("Invalid state code or password.");
      setLoading(false);
      return;
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <NyscAuthShell
      title="Post Corps Member log in"
      subtitle={
        mode === "email"
          ? "No call-up number yet? Log in with your email instead."
          : "Log in with your post-NYSC state code to pick up where you left off."
      }
      footer={
        <>
          New post corps member?{" "}
          <Link
            href="/auth/nysc"
            className="font-semibold text-white underline underline-offset-2 hover:text-white/80"
          >
            Create an account
          </Link>
        </>
      }
    >
      <div className="mb-1 grid grid-cols-2 gap-1 rounded-xl bg-white/10 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("stateCode");
            setError(null);
          }}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === "stateCode" ? "bg-white text-[#0F7A3D]" : "text-white/70 hover:text-white"
          }`}
        >
          State code
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("email");
            setError(null);
          }}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === "email" ? "bg-white text-[#0F7A3D]" : "text-white/70 hover:text-white"
          }`}
        >
          Email
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {mode === "email" ? (
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
              autoComplete="username"
            />
            <p className="mt-1 text-xs text-white/60">For corps members who signed up without a call-up number.</p>
          </div>
        ) : (
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
            autoComplete="username"
          />
        </div>
        )}

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/90">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="frosted-input"
            placeholder="••••••••"
            autoComplete="current-password"
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
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white font-semibold text-[#0F7A3D] transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Log in"}
        </button>

        <p className="text-center text-sm text-white/70">
          Not a corps member?{" "}
          <Link href="/auth/login" className="font-semibold text-white underline underline-offset-2 hover:text-white/80">
            Standard log in
          </Link>
        </p>
      </form>
    </NyscAuthShell>
  );
}

export default function NyscLoginPage() {
  return (
    <Suspense fallback={null}>
      <NyscLoginForm />
    </Suspense>
  );
}
