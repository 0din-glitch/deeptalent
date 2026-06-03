"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

export function ChangePasswordModal({ mustChange }: { mustChange: boolean }) {
  const [open, setOpen] = useState(mustChange);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Update auth password
      const { error: pwErr } = await supabase.auth.updateUser({ password });
      if (pwErr) throw new Error(pwErr.message);

      // Clear the must_change_password flag via our API
      const res = await fetch("/api/auth/clear-must-change-password", { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to update flag");
      }

      setDone(true);
      setTimeout(() => setOpen(false), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Change your password</h2>
            <p className="text-sm text-gray-500">Your password has been reset. Please set a new one to continue.</p>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="size-6" />
            </div>
            <p className="font-semibold text-gray-900">Password updated successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repeat your new password"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#3B5BDB] text-white font-semibold text-sm hover:bg-[#3451c7] disabled:opacity-60 transition-colors"
            >
              {loading ? "Saving..." : "Set new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
