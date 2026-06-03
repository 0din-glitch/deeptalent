"use client";

import { useState, useTransition } from "react";

type Profile = Record<string, any>;

export function ProfileForm({
  profile,
  action,
}: {
  profile: Profile;
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await action(fd);
      setMessage(res.ok ? { type: "ok", text: "Profile saved." } : { type: "error", text: res.error || "Could not save." });
    });
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 space-y-6">
      <Section title="Identity">
        <Grid>
          <Field label="Full name" name="full_name" defaultValue={profile.full_name ?? ""} />
          <Field label="Headline" name="headline" placeholder="e.g. Senior Backend Engineer" defaultValue={profile.headline ?? ""} />
          <Field label="Phone" name="phone" defaultValue={profile.phone ?? ""} />
          <Field label="Country" name="country" defaultValue={profile.country ?? ""} />
          <Field label="City" name="city" defaultValue={profile.city ?? ""} />
        </Grid>
      </Section>

      <Section title="Professional">
        <Grid>
          <Field label="Role category" name="role_category" placeholder="Engineering, Design, ..." defaultValue={profile.role_category ?? ""} />
          <Field label="Specialization" name="specialization" placeholder="Backend, ML, ..." defaultValue={profile.specialization ?? ""} />
          <Field label="Years of experience" name="years_experience" type="number" min={0} step={1} defaultValue={profile.years_experience ?? ""} />
          <Field label="Availability" name="availability" placeholder="Full-time, Contract, ..." defaultValue={profile.availability ?? ""} />
          <Field label="Hourly rate" name="hourly_rate" type="number" min={0} step={1} defaultValue={profile.hourly_rate ?? ""} />
          <Field label="Currency" name="currency" defaultValue={profile.currency ?? "USD"} />
        </Grid>
      </Section>

      <Section title="Links">
        <Grid>
          <Field label="LinkedIn URL" name="linkedin_url" type="url" defaultValue={profile.linkedin_url ?? ""} />
          <Field label="Portfolio URL" name="portfolio_url" type="url" defaultValue={profile.portfolio_url ?? ""} />
          <Field label="GitHub URL" name="github_url" type="url" defaultValue={profile.github_url ?? ""} />
          <Field label="Personal website" name="website_url" type="url" defaultValue={profile.website_url ?? ""} />
        </Grid>
      </Section>

      <Section title="Skills & languages">
        <Grid>
          <Field
            label="Skills (comma-separated)"
            name="skills"
            placeholder="React, Postgres, AWS"
            defaultValue={(profile.skills ?? []).join(", ")}
          />
          <Field
            label="Languages (comma-separated)"
            name="languages"
            placeholder="English, French"
            defaultValue={(profile.languages ?? []).join(", ")}
          />
        </Grid>
      </Section>

      <Section title="Bio">
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          rows={5}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] outline-none"
          placeholder="Short professional bio."
        />
      </Section>

      <div className="flex items-center justify-between">
        {message ? (
          <p className={`text-sm ${message.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={isPending}
          className="h-10 px-5 rounded-full bg-[#3B5BDB] text-white text-sm font-semibold hover:bg-[#2f49b2] transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  min,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  min?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        step={step}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="h-10 rounded-xl border border-gray-200 px-3.5 text-sm focus:border-[#3B5BDB] focus:ring-1 focus:ring-[#3B5BDB] outline-none"
      />
    </label>
  );
}
