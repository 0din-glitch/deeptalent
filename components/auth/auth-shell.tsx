import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFF] via-white to-[#EEF2FF]">
      <header className="px-6 md:px-12 py-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <img
            src="/images/logo-wordmark.png"
            alt="Deep Talent"
            className="h-10 w-auto"
          />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 mt-2 text-pretty">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
          {footer && (
            <div className="text-center mt-6 text-sm text-gray-600">
              {footer}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
