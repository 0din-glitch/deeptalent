import type { Metadata } from "next";
import "./globals.css";
import { Geist, Instrument_Serif } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://deeptalent.app";

export const metadata: Metadata = {
  title: {
    default: "DeepTalent — Finance, Compliance & Technology Talent Partner",
    template: "%s | DeepTalent",
  },
  description:
    "A fully managed talent partner — not a marketplace. Credentialled finance, compliance, and technology professionals from Africa placed into global roles in 14–21 days. <8% acceptance rate. 60-day free replacement guarantee.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    siteName: "DeepTalent",
    title: "DeepTalent — Finance, Compliance & Technology Talent Partner",
    description:
      "Credentialled professionals from Africa's deepest talent pools placed into demanding global roles in 14–21 days.",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepTalent — Finance, Compliance & Technology Talent Partner",
    description:
      "Credentialled professionals from Africa's deepest talent pools placed into demanding global roles in 14–21 days.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#FFFFFF",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DeepTalent",
  url: APP_URL,
  logo: `${APP_URL}/images/logo-wordmark.png`,
  description:
    "A fully managed talent partner connecting credentialled finance, compliance, and technology professionals from Africa with global employers.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "GB",
  },
  sameAs: [
    "https://www.linkedin.com/company/deeptalentplatform/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@deeptalent.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("relative", "bg-white", "font-sans", geist.variable, instrumentSerif.variable)}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
