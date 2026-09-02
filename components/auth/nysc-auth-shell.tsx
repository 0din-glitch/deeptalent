import Link from "next/link";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface NyscAuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Green-themed variant of AuthShell, used exclusively for the NYSC Corps
 * Member sign-up flow. Mirrors the structure of the standard auth shell so
 * the experience feels like the same app, just re-skinned in NYSC green.
 */
export function NyscAuthShell({ title, subtitle, children, footer }: NyscAuthShellProps) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        background: "linear-gradient(135deg, #063d1f 0%, #0F7A3D 45%, #4CAF63 100%)",
      }}
    >
      <div
        className="absolute -top-24 -left-24 z-0 h-96 w-96 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, #4CAF63 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-16 z-0 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #063d1f 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/4 z-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #16a34a 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="relative rounded-3xl border border-white/20 bg-white/10 p-7 md:p-9 shadow-[0_24px_80px_rgba(6,20,10,0.45)] backdrop-blur-2xl">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img
                src="/images/nysc-logo.png"
                alt="Post-NYSC"
                className="size-9 rounded-full bg-white/90 object-contain p-0.5"
              />
              <span className="text-sm font-semibold text-white/90">
                DeepTalent <span className="text-white/60">for post-NYSC</span>
              </span>
            </Link>

            <Link
              href="/"
              aria-label="Close and return home"
              className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="size-4" />
            </Link>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-bold tracking-tight text-white text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-white/70 text-pretty leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {footer && (
            <div className="mt-6 text-center text-sm text-white/70">{footer}</div>
          )}
        </div>
      </div>
    </main>
  );
}
