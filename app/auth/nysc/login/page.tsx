"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NyscAuthShell } from "@/components/auth/nysc-auth-shell";
import { resolveNyscLogin } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";

const STATE_CODE_PATTERN = /^[A-Z]{2}\/\d{2}[A-Z]?\/\d{3,5}$/;

function NyscLoginForm() {
  const router = useRouter();
  const [stateCode, setStateCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = stateCode.trim().toUpperCase();
    if (!STATE_CODE_PATTERN.test(normalized)) {
      setError("Enter a valid NYSC state code, e.g. OG/24B/1234.");
      return;
    }

    setLoading(true);

    // Corps members authenticate by state code: resolve the linked email first,
    // then complete a normal Supabase password sign-in with that email.
    const resolved = await resolveNyscLogin(normalized);
    if ("error" in resolved) {
      setError(resolved.error);
      setLoading(false);
      return;
    }

    const { email, destination } = resolved;
    const supabase = createClient();
    let { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    // Legacy users may have their original hash on profiles.legacy_password_hash;
    // verify + rotate server-side, then retry (mirrors the standard login).
    if (signInError) {
      try {
        const res = await fetch("/api/auth/legacy-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data?.ok) {
          const retry = await supabase.auth.signInWithPassword({ email, password });
          signInError = retry.error;
        }
      } catch {
        // fall through to original error
      }
    }

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
      title="Corps Member log in"
      subtitle="Log in with your NYSC state code to pick up where you left off."
      footer={
        <>
          New corps member?{" "}
          <Link
            href="/auth/nysc"
            className="font-semibold text-white underline underline-offset-2 hover:text-white/80"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="stateCode" className="mb-1.5 block text-sm font-medium text-white/90">
            NYSC state code
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
