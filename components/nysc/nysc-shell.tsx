import Link from "next/link";
import { ReactNode } from "react";
import { LogOut } from "lucide-react";

interface NyscShellProps {
  active: "roles" | "training";
  name?: string | null;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const NAV = [
  { key: "roles", label: "Global roles", href: "/nysc/roles" },
  { key: "training", label: "Training", href: "/nysc/training" },
] as const;

/**
 * Shared green-themed frame for the two post-auth NYSC corps-member pages.
 * Mirrors the login screen's palette (deep-green gradient, NYSC logo) so the
 * whole corps-member journey reads as one continuous experience.
 */
export function NyscShell({ active, name, eyebrow, title, subtitle, children }: NyscShellProps) {
  return (
    <main className="min-h-screen bg-[#F4FBF6]">
      {/* Green gradient header, same palette as the NYSC auth screen */}
      <header
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #063d1f 0%, #0F7A3D 55%, #16a34a 100%)" }}
      >
        <div
          className="absolute -top-24 -right-16 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #4CAF63 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between py-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img
                src="/images/nysc-logo.png"
                alt="NYSC"
                className="size-10 rounded-full bg-white/90 object-contain p-0.5"
              />
              <span className="text-sm font-semibold text-white">
                DeepTalent <span className="text-white/60">for NYSC</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active === item.key
                      ? "bg-white text-[#0F7A3D]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <a
              href="/auth/logout"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/20"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </a>
          </div>

          {/* Hero */}
          <div className="max-w-2xl py-10 md:py-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/70">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white text-balance md:text-4xl">
              {name ? `${title}, ${name.split(" ")[0]}.` : title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/80 text-pretty">{subtitle}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">{children}</div>
    </main>
  );
}
