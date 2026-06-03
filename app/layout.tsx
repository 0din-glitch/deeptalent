import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepTalent — Elite talent, 50% less cost",
  description: "Connect with vetted experts and discover reliable work opportunities. Pre-vetted, role-ready specialists matched to your exact needs in under 72 hours.",
};

export const viewport = {
  themeColor: "#3B5BDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <body>{children}</body>
    </html>
  );
}
