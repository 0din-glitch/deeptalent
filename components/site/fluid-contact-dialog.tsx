"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, CheckCircle2, X } from "lucide-react";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

interface FluidContactDialogProps {
  /** Label for the resting button */
  label?: string;
  className?: string;
}

/**
 * A CTA button that fluidly morphs into a dialog containing the contact form,
 * using a shared layoutId so the pill expands into the card. Styled to the
 * DeepTalent blue-on-white palette.
 */
export function FluidContactDialog({ label = "Send us a message", className = "" }: FluidContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "", message: "" });

  // Lock body scroll + close on Escape while the dialog is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    // reset after the exit animation so it re-opens fresh
    setTimeout(() => {
      setSubmitted(false);
      setError(null);
    }, 300);
  }

  return (
    <>
      {/* Resting button — hidden while open so the morph reads as one element */}
      {!open && (
        <motion.button
          layoutId="fluid-contact-cta"
          onClick={() => setOpen(true)}
          className={`relative inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#3B5BDB] text-white font-semibold shadow-[0_8px_24px_rgba(59,91,219,0.25)] hover:bg-[#2F49B0] hover:shadow-[0_12px_32px_rgba(59,91,219,0.35)] transition-colors ${className}`}
          style={{ borderRadius: 9999 }}
        >
          <motion.span layoutId="fluid-contact-label">{label}</motion.span>
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            {/* Morphing card */}
            <motion.div
              layoutId="fluid-contact-cta"
              style={{ borderRadius: 24 }}
              transition={SPRING}
              className="relative z-10 w-full max-w-lg bg-white shadow-2xl overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.12 } }}
                exit={{ opacity: 0 }}
                className="p-6 md:p-8"
              >
                <button
                  onClick={close}
                  aria-label="Close"
                  className="absolute top-4 right-4 size-8 inline-flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="size-4" />
                </button>

                {submitted ? (
                  <div className="py-8 text-center flex flex-col items-center">
                    <div className="size-16 rounded-full bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] mb-4">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-balance">Message sent</h2>
                    <p className="text-gray-600 text-pretty max-w-sm">
                      Thanks for reaching out. A real human will get back to you within 1 business day.
                    </p>
                    <button
                      onClick={close}
                      className="mt-6 h-11 px-6 inline-flex items-center justify-center rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2F49B0] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <motion.h2 layoutId="fluid-contact-label" className="text-xl font-bold text-gray-900">
                      Send us a message
                    </motion.h2>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                      Tell us what you need and we&apos;ll be in touch within 1 business day.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Name" required>
                          <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="form-input"
                            placeholder="Jane Doe"
                          />
                        </Field>
                        <Field label="Email" required>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="form-input"
                            placeholder="jane@example.com"
                          />
                        </Field>
                      </div>
                      <Field label="Company">
                        <input
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className="form-input"
                          placeholder="Acme Inc."
                        />
                      </Field>
                      <Field label="Message" required>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="form-input"
                          placeholder="Tell us what you're looking for..."
                        />
                      </Field>

                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 px-8 inline-flex items-center justify-center rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2F49B0] transition-colors disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="size-5 animate-spin" /> : "Send message"}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
