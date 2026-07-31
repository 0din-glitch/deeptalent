import { BarChart3, ShieldCheck, BrainCircuit, Clock } from "lucide-react";

/* Bento feature grid echoing the CoreShift "For HR professionals / managers /
   legal teams" section, with lightweight div-built dashboard mockups. */

const barData = [
  { a: 55, b: 30 },
  { a: 80, b: 45 },
  { a: 40, b: 65 },
  { a: 70, b: 35 },
  { a: 50, b: 60 },
];

const teamMembers = [
  { name: "Amara Okafor", role: "CFO-on-demand", img: "/images/consulting/pro-1.png" },
  { name: "Daniel Rossi", role: "Compliance Lead", img: "/images/consulting/pro-6.png" },
  { name: "Priya Nair", role: "Cloud Architect", img: "/images/consulting/pro-3.png" },
];

const avatarCluster = [
  "/images/consulting/pro-1.png",
  "/images/consulting/pro-2.png",
  "/images/consulting/pro-3.png",
  "/images/consulting/pro-4.png",
  "/images/consulting/pro-5.png",
  "/images/consulting/pro-6.png",
  "/images/consulting/pro-7.png",
  "/images/consulting/pro-8.png",
];

function TileIcon({ icon: Icon, className }: { icon: React.ElementType; className: string }) {
  return (
    <div className={`flex size-11 items-center justify-center rounded-xl shadow-[0_8px_20px_rgba(17,24,39,0.12)] ${className}`}>
      <Icon className="size-5 text-white" />
    </div>
  );
}

export function ConsultingFeatures() {
  return (
    <section className="px-3 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* For finance leaders — bar chart mockup */}
          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="mb-6 rounded-2xl bg-[#F3F5FA] p-4">
              <p className="mb-3 text-xs font-semibold text-gray-500">Spend vs. Budget</p>
              <div className="flex h-28 items-end justify-between gap-2">
                {barData.map((d, i) => (
                  <div key={i} className="flex flex-1 items-end justify-center gap-1">
                    <div className="w-2.5 rounded-full bg-[#3B5BDB]" style={{ height: `${d.a}%` }} />
                    <div className="w-2.5 rounded-full bg-[#8690FD]" style={{ height: `${d.b}%` }} />
                  </div>
                ))}
              </div>
            </div>
            <TileIcon icon={BarChart3} className="bg-[#3B5BDB]" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">For finance leaders</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Fractional CFOs, FP&amp;A analysts and treasury specialists vetted to
              international accounting standards.
            </p>
          </div>

          {/* For compliance teams — checklist mockup */}
          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="mb-6 space-y-2 rounded-2xl bg-[#F3F5FA] p-4">
              {["AML / KYC review", "Regulatory reporting", "GDPR audit"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#3B5BDB]">
                    <ShieldCheck className="size-2.5 text-white" />
                  </span>
                  <span className="text-xs font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <TileIcon icon={ShieldCheck} className="bg-[#1E2A5A]" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">For compliance teams</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              MLROs, AML specialists and KYC analysts who keep you compliant across
              every jurisdiction you operate in.
            </p>
          </div>

          {/* For technology orgs — icon focus */}
          <div className="relative overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="mb-6 flex h-[8.5rem] items-center justify-center rounded-2xl bg-[#F3F5FA]">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-[#38BDF8] shadow-[0_16px_36px_rgba(56,189,248,0.4)]">
                <BrainCircuit className="size-9 text-white" />
              </div>
            </div>
            <TileIcon icon={BrainCircuit} className="bg-[#38BDF8]" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">For technology orgs</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Engineers, data scientists and AI specialists placed into product teams
              in days, not months.
            </p>
          </div>
        </div>

        {/* Wide row */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* All talent data — wide */}
          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6 lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F3F5FA] p-4">
                <p className="mb-3 text-xs font-semibold text-gray-500">Shortlisted consultants</p>
                <div className="space-y-2">
                  {teamMembers.map((m) => (
                    <div key={m.name} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                      <img src={m.img || "/placeholder.svg"} alt="" className="size-8 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">{m.name}</p>
                        <p className="truncate text-[11px] text-gray-400">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-[#F3F5FA] p-4">
                <p className="mb-3 text-xs font-semibold text-gray-500">Match confidence</p>
                <div className="flex h-[7.5rem] items-end justify-between gap-2">
                  {[60, 82, 71, 94, 68].map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="w-full rounded-full bg-[#3B5BDB]/15" style={{ height: `${h}%` }}>
                        <div className="w-full rounded-full bg-[#3B5BDB]" style={{ height: "100%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-4">
              <TileIcon icon={Clock} className="bg-[#3B5BDB]" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">All talent data in one place</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Assessment scores, references, availability and match ratings — every
                  candidate arrives with a full vetting report.
                </p>
              </div>
            </div>
          </div>

          {/* For growing teams — avatar cluster */}
          <div className="flex flex-col rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="mb-6 flex flex-1 items-center justify-center rounded-2xl bg-[#F3F5FA] py-8">
              <div className="grid grid-cols-4 gap-2">
                {avatarCluster.map((src, i) => (
                  <img
                    key={i}
                    src={src || "/placeholder.svg"}
                    alt=""
                    className="size-10 rounded-xl border-2 border-white object-cover shadow-sm"
                  />
                ))}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">For growing teams</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Scale a whole function at once — we assemble and manage entire vetted teams
              on your behalf.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
