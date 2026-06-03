"use client";

import { useState } from "react";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { Loader2, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

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

  return (
    <main className="bg-white min-h-screen">
      <SiteNavbar />
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-balance">
              Get in touch
            </h1>
            <p className="text-gray-600 mt-3 text-lg text-pretty max-w-2xl mx-auto">
              Whether you&apos;re hiring elite talent or looking for your next opportunity, we&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-4">
              <ContactCard icon={Mail} title="Email" value="Mail@deeptalentplatform.com" href="mailto:Mail@deeptalentplatform.com" />
              <ContactCard icon={Phone} title="Phone" value="+1 (555) 010-2030" href="tel:+15550102030" />
              <ContactCard icon={MapPin} title="Office" value="Global. Remote-first." />
            </div>

            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center h-full flex flex-col items-center justify-center">
                  <div className="size-16 rounded-full bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] mb-4">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-balance">
                    Message sent
                  </h2>
                  <p className="text-gray-600 text-pretty">
                    Thanks for reaching out. We&apos;ve sent a confirmation to your inbox and a real human will get back to you within 1 business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-10 flex flex-col gap-5">
                  <div className="grid md:grid-cols-2 gap-5">
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
                    <Field label="Company">
                      <input
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="form-input"
                        placeholder="Acme Inc."
                      />
                    </Field>
                    <Field label="Subject">
                      <input
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="form-input"
                        placeholder="How can we help?"
                      />
                    </Field>
                  </div>
                  <Field label="Message" required>
                    <textarea
                      required
                      rows={6}
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
                    className="w-full md:w-auto md:self-end h-12 px-8 inline-flex items-center justify-center rounded-full bg-[#3B5BDB] text-white font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function ContactCard({ icon: Icon, title, value, href }: { icon: any; title: string; value: string; href?: string }) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="size-12 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] shrink-0">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
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
