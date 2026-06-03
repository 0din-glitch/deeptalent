"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { signUpWithResendConfirmation } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "company" ? "company" : "talent";
  const prefilledName = searchParams.get("name") || "";
  const prefilledEmail = searchParams.get("email") || "";
  const next = searchParams.get("next");

  const [fullName, setFullName] = useState(prefilledName);
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"talent" | "company">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signUpWithResendConfirmation(email, password, fullName, role);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const successUrl = next
      ? `/auth/sign-up-success?next=${encodeURIComponent(next)}`
      : "/auth/sign-up-success";
    router.push(successUrl);
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join DeepTalent and get matched with elite opportunities."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/auth/login${next ? `?next=${encodeURIComponent(next)}${email ? `&email=${encodeURIComponent(email)}` : ""}` : ""}`}
            className="text-[#3B5BDB] font-semibold hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("talent")}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                role === "talent"
                  ? "border-[#3B5BDB] bg-[#3B5BDB]/5 text-[#3B5BDB]"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Talent
            </button>
            <button
              type="button"
              onClick={() => setRole("company")}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                role === "company"
                  ? "border-[#3B5BDB] bg-[#3B5BDB]/5 text-[#3B5BDB]"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Company
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name
          </label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B5BDB] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 transition"
            placeholder="Jane Doe"
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B5BDB] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 transition"
            placeholder="At least 6 characters"
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
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Create account"}
        </button>

        <p className="text-xs text-gray-500 text-center text-pretty">
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
