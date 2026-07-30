"use client";

import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { FluidContactDialog } from "@/components/site/fluid-contact-dialog";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen">
      <SiteNavbar />
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-balance">
              Get in touch
            </h1>
            <p className="text-gray-600 mt-3 text-lg text-pretty max-w-2xl mx-auto">
              Whether you&apos;re hiring elite talent or looking for your next opportunity, we&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-4">
              <ContactCard icon={Mail} title="Email" value="Mail@deeptalentplatform.com" href="mailto:Mail@deeptalentplatform.com" />
              <ContactCard icon={Phone} title="Phone" value="+44 7367 638151" href="tel:+447367638151" />
              <ContactCard icon={MapPin} title="Office" value="110 Ruscote Avenue, Banbury, OX16 2NN" href="https://maps.google.com/?q=110+Ruscote+Avenue+Banbury+Oxfordshire+OX16+2NN" />
            </div>

            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-lg bg-gradient-to-br from-[#3B5BDB] to-[#8690FD] p-8 md:p-12 h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-balance">
                  Ready to start a conversation?
                </h2>
                <p className="text-white/90 mt-3 mb-8 text-pretty max-w-md">
                  Send us a message and a real human will get back to you within 1 business day.
                </p>
                <FluidContactDialog label="Send us a message" className="!bg-white !text-[#3B5BDB] hover:!bg-white/90" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function ContactCard({ icon: Icon, title, value, href }: { icon: any; title: string; value: string; href?: string }) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="size-12 rounded-xl bg-[#3B5BDB]/10 flex items-center justify-center text-[#3B5BDB] shrink-0">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>{content}</a> : content;
}
