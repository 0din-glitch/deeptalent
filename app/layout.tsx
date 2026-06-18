import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepTalent — Elite talent, up to 50% less cost",
  description: "Connect with vetted experts and discover reliable work opportunities. Pre-vetted, role-ready specialists matched to your exact needs within 21 days.",
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
