"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

const PROVIDERS = [
  {
    id: "google",
    label: "Google",
    icon: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/google/default.svg",
  },
  {
    id: "github",
    label: "GitHub",
    icon: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/github/default.svg",
  },
  {
    id: "linkedin_oidc",
    label: "LinkedIn",
    icon: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/linkedin/default.svg",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    icon: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/x/default.svg",
  },
] as const;

type ProviderId = (typeof PROVIDERS)[number]["id"];

export function SocialAuthButtons() {
  const [loading, setLoading] = useState<ProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSocial(provider: ProviderId) {
    setLoading(provider);
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(null);
    }
    // On success Supabase redirects the browser — no need to reset loading
  }

  return (
    <div className="mt-1">
      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-400 whitespace-nowrap">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Single pill row */}
      <div className="flex items-center justify-center gap-2">
        {PROVIDERS.map((p) => {
          const isLoading = loading === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSocial(p.id)}
              disabled={!!loading}
              title={`Continue with ${p.label}`}
              aria-label={`Continue with ${p.label}`}
              className="group relative flex items-center justify-center size-11 rounded-full border border-gray-200 bg-white hover:border-[#3B5BDB]/40 hover:bg-[#3B5BDB]/5 hover:shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin text-[#3B5BDB]" />
              ) : (
                <img
                  src={p.icon}
                  alt={p.label}
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                />
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 text-xs text-center text-red-600">{error}</p>
      )}
    </div>
  );
}
