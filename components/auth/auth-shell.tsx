import Link from "next/link";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Renders the Sign in / Sign up segmented toggle when set. */
  activeTab?: "signin" | "signup";
  /** Hrefs for the toggle, so callers can preserve `next`/`email` params. */
  signInHref?: string;
  signUpHref?: string;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  activeTab,
  signInHref = "/auth/login",
  signUpHref = "/auth/sign-up",
}: AuthShellProps) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        background:
          "linear-gradient(135deg, #24316e 0%, #3B5BDB 45%, #8690FD 100%)",
      }}
    >
      {/* Soft color blobs for depth */}
      <div
        className="absolute -top-24 -left-24 z-0 h-96 w-96 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, #8690FD 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-16 z-0 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #2a3a8f 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/4 z-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #5b73e6 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="relative rounded-3xl border border-white/20 bg-white/10 p-7 md:p-9 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
          {/* Top row: toggle + close */}
          <div className="mb-7 flex items-center justify-between">
            {activeTab ? (
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-1">
                <Link
                  href={signUpHref}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    activeTab === "signup"
                      ? "bg-white text-[#3B5BDB] shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Sign up
                </Link>
                <Link
                  href={signInHref}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    activeTab === "signin"
                      ? "bg-white text-[#3B5BDB] shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <Link href="/" className="inline-flex items-center">
                <img
                  src="/images/logo-wordmark.png"
                  alt="DeepTalent"
                  className="h-8 w-auto brightness-0 invert"
                />
              </Link>
            )}

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
