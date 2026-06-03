"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";
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
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to access your DeepTalent dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={`/auth/sign-up${next ? `?next=${encodeURIComponent(next)}${email ? `&email=${encodeURIComponent(email)}` : ""}` : ""}`}
            className="text-[#3B5BDB] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B5BDB] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 transition"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B5BDB] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 transition"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 inline-flex items-center justify-center rounded-lg bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60"
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
