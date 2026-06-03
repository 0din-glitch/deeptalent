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
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="size-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
          <AlertTriangle className="size-8" />
        </div>
        <Link
          href="/auth/login"
          className="mt-2 inline-flex h-11 px-6 items-center justify-center rounded-lg bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors"
        >
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
