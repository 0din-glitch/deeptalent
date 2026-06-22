"use client";

import { useState } from "react";
import { Loader2, Mail, UserPlus, X, CheckCircle2 } from "lucide-react";

export function AdminInviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Email is required.");
    if (!fullName.trim()) return setError("Full name is required.");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), fullName: fullName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to send invite");
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b1120] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-[#3B5BDB]/20 flex items-center justify-center">
              <UserPlus className="size-5 text-[#7b9ef8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Invite Admin</h2>
              <p className="text-[11px] text-white/40">Send a secure setup link via email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="size-4 text-white/50" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="size-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-8 text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Invite sent</h3>
              <p className="text-sm text-gray-500 mb-1">
                A setup link was emailed to <strong className="text-gray-700">{email}</strong>.
              </p>
              <p className="text-xs text-gray-400">
                The link is valid for 24 hours. They can set their own password when they click it.
              </p>
              <button
                onClick={onClose}
                className="mt-5 h-10 px-6 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2d42a6] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                The recipient will receive a secure link to set up their admin account. Their
                profile will be created with the <strong>admin</strong> role automatically.
              </p>

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Full name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@deeptalentplatform.com"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 focus:border-[#3B5BDB]"
                  required
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 text-xs text-amber-800 leading-relaxed">
                A magic-link email will be sent. It expires in <strong>24 hours</strong>. The
                invitee will land on the admin panel after clicking it.
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 rounded-lg bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2d42a6] disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Mail className="size-4" /> Send invite
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
