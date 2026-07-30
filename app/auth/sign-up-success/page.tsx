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
      subtitle="We've sent a 6-digit verification code to your inbox."
    >
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-white/15 text-white">
          <MailCheck className="size-8" />
        </div>
        <p className="text-pretty text-white/80">
          Enter the code from the email to verify your account, then return here to log in.
        </p>
        <Link
          href={loginHref}
          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 font-semibold text-[#3B5BDB] transition-colors hover:bg-white/90"
        >
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
