import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AlertTriangle } from "lucide-react";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Something went wrong"
      subtitle={params?.error || "An authentication error occurred. Please try again."}
    >
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-500/20 text-red-100">
          <AlertTriangle className="size-8" />
        </div>
        <Link
          href="/auth/login"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 font-semibold text-[#3B5BDB] transition-colors hover:bg-white/90"
        >
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
