"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Shield } from "lucide-react";

export function DashboardHeader({
  email,
  fullName,
  role,
  isSuperAdmin = false,
}: {
  email: string;
  fullName: string;
  role: string;
  isSuperAdmin?: boolean;
}) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/logo-wordmark.png" alt="Deep Talent" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-gray-900">{fullName || email}</span>
            <span className="text-xs text-gray-500 capitalize flex items-center gap-1.5">
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#3B5BDB]/10 text-[#3B5BDB]">
                  <Shield className="size-3" /> Super admin
                </span>
              ) : (
                role
              )}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="size-4" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
