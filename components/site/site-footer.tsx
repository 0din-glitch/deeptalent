import Link from "next/link";
import { Instagram, Linkedin, Mail } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0F1733] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo-wordmark.png" alt="Deep Talent" className="h-12 w-auto" />
            </div>
            <p className="text-white/70 max-w-md text-pretty">
              Elite talent. Accredited and vetted professionals in finance, compliance, and technology — deployed globally.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://x.com/deeptalentp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DeepTalent on X"
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <XIcon className="size-4" />
              </a>
              <a
                href="https://www.instagram.com/deeptalentplatform/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DeepTalent on Instagram"
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/deeptalentplatform/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DeepTalent on LinkedIn"
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href="https://www.tiktok.com/@deeptalent.platfo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DeepTalent on TikTok"
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <TikTokIcon className="size-4" />
              </a>
              <a
                href="mailto:Mail@deeptalentplatform.com"
                aria-label="Email DeepTalent"
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <ul className="flex flex-col gap-2 text-white/70 text-sm">
              <li><Link href="/talents" className="hover:text-white transition-colors">For Talents</Link></li>
              <li><Link href="/companies" className="hover:text-white transition-colors">For Companies</Link></li>
              <li><Link href="/companies/hire" className="hover:text-white transition-colors">Hire Talent</Link></li>
              <li><Link href="/talents/apply" className="hover:text-white transition-colors">Apply as Talent</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="flex flex-col gap-2 text-white/70 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li>
                <a href="mailto:Mail@deeptalentplatform.com" className="hover:text-white transition-colors">
                  Mail@deeptalentplatform.com
                </a>
              </li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} DeepTalent. All rights reserved.</p>
          <p>Built for the future of work.</p>
        </div>
      </div>
    </footer>
  );
}
