import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { MailCheck } from "lucide-react";

export default async function SignUpSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const loginHref = next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login";
  return (
    <AuthShell
      title="Check your email"
      subtitle="We've sent a confirmation link to your inbox."
    >
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="size-16 rounded-full bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB]">
          <MailCheck className="size-8" />
        </div>
        <p className="text-gray-600 text-pretty">
          Click the link in the email to verify your account, then return here to log in.
        </p>
        <Link
          href={loginHref}
          className="mt-2 inline-flex h-11 px-6 items-center justify-center rounded-lg bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
        >
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
