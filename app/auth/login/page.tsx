"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const prefilledEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    let { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If Supabase rejected the password, the account may be a legacy user
    // whose Supabase password is a one-time random value but whose original
    // Better-Auth scrypt hash is stored on profiles.legacy_password_hash.
    // Verify against that, rotate the password server-side, then retry.
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
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Check role and redirect
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else if (next) {
        // Honor explicit return target (e.g. /talents/apply#apply)
        router.push(next);
      } else if (profile?.role === "company") {
        router.push("/dashboard");
      } else {
        // Talent: send to the AI interview unless they've already completed one.
        const { data: interview } = await supabase
          .from("talent_interviews")
          .select("id")
          .eq("user_id", userData.user.id)
          .eq("status", "completed")
          .limit(1)
          .maybeSingle();
        router.push(interview ? "/dashboard" : "/interview");
      }
      router.refresh();
    }
  }

  const signUpHref = `/auth/sign-up${next ? `?next=${encodeURIComponent(next)}${email ? `&email=${encodeURIComponent(email)}` : ""}` : ""}`;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to access your DeepTalent dashboard."
      activeTab="signin"
      signUpHref={signUpHref}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={signUpHref}
            className="font-semibold text-white underline underline-offset-2 hover:text-white/80"
          >
            Sign up
          </Link>
          <SocialAuthButtons />
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-white/80">
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="frosted-input"
            placeholder="••••••••"
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
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
