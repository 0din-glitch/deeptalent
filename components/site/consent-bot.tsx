"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, FileText, X, Check } from "lucide-react";

const STORAGE_KEY = "dt-consent-v1";

type Tab = "cookies" | "terms";

/**
 * A friendly floating bot pinned to the bottom-left that, shortly after load,
 * slides up and "drags out" a clean consent panel containing the Cookie Policy
 * and User Agreement. Choices persist so it won't nag on return visits.
 */
export function ConsentBot() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false); // bot is on screen
  const [open, setOpen] = useState(false); // panel is dragged out
  const [tab, setTab] = useState<Tab>("cookies");

  useEffect(() => {
    setMounted(true);
    let decided = false;
    try {
      decided = Boolean(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      decided = false;
    }
    if (decided) return;

    const showTimer = window.setTimeout(() => setVisible(true), 900);
    const openTimer = window.setTimeout(() => setOpen(true), 1600);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(openTimer);
    };
  }, []);

  function decide(choice: "all" | "essential") {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, at: Date.now() }),
      );
    } catch {
      /* ignore */
    }
    setOpen(false);
    // let the panel retract, then send the bot away
    window.setTimeout(() => setVisible(false), 350);
  }

  if (!mounted || !visible) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 z-[60] flex flex-col-reverse items-start gap-3 md:bottom-6 md:left-6 md:right-auto md:flex-row md:items-end">
      {/* The bot */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        aria-label={open ? "Hide consent options" : "Show consent options"}
        aria-expanded={open}
        className="group relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B5BDB] focus-visible:ring-offset-2 rounded-3xl"
      >
        {/* idle bob */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <BotFace talking={open} />
        </motion.div>
        {/* little dashed "leash" linking bot to panel while open */}
        <AnimatePresence>
          {open && (
            <motion.span
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-4 origin-left -translate-y-1/2 border-t-2 border-dashed border-[#3B5BDB]/40 md:block"
              aria-hidden
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* The panel the bot drags out */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: -24, scale: 0.9, transformOrigin: "left bottom" }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            role="dialog"
            aria-label="Cookie policy and user agreement"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-[#3B5BDB]/10 md:w-[26rem]"
          >
            {/* header */}
            <div className="flex items-start gap-3 border-b border-gray-100 bg-[#F7F8FF] px-5 py-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">A quick word before you explore</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  We use cookies to run DeepTalent smoothly. Review the details or accept to continue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Collapse"
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* tabs */}
            <div className="flex gap-1 px-3 pt-3">
              <TabButton active={tab === "cookies"} onClick={() => setTab("cookies")} icon={Cookie}>
                Cookie Policy
              </TabButton>
              <TabButton active={tab === "terms"} onClick={() => setTab("terms")} icon={FileText}>
                User Agreement
              </TabButton>
            </div>

            {/* content */}
            <div className="max-h-48 overflow-y-auto px-5 py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 text-xs leading-relaxed text-gray-600"
                >
                  {tab === "cookies" ? <CookieCopy /> : <TermsCopy />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* actions */}
            <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row">
              <button
                type="button"
                onClick={() => decide("all")}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#3B5BDB] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                <Check className="size-4" /> Accept all
              </button>
              <button
                type="button"
                onClick={() => decide("essential")}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Essential only
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Cookie;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
        active ? "bg-[#3B5BDB]/10 text-[#3B5BDB]" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}

function CookieCopy() {
  return (
    <>
      <p>
        <span className="font-semibold text-gray-800">Essential cookies</span> keep you signed in and
        secure your session — these always stay on.
      </p>
      <p>
        <span className="font-semibold text-gray-800">Analytics cookies</span> help us understand how
        recruiters and talent use DeepTalent so we can improve matching and performance.
      </p>
      <p>
        You can change your choice anytime from the bot in the corner. We never sell your data.
      </p>
    </>
  );
}

function TermsCopy() {
  return (
    <>
      <p>
        By using DeepTalent you agree to source, engage, and pay vetted specialists through the
        platform in line with our fair-use and anti-circumvention terms.
      </p>
      <p>
        Talent profiles, AI vetting scores, and salary data are provided for hiring decisions only and
        may not be redistributed.
      </p>
      <p>
        Accounts must provide accurate information; misuse or fraudulent activity may result in
        suspension.
      </p>
    </>
  );
}

/** Simple, on-brand robot face built from elements (no emoji). */
function BotFace({ talking }: { talking: boolean }) {
  return (
    <span className="relative grid size-14 place-items-center rounded-3xl bg-gradient-to-br from-[#3B5BDB] to-[#8690FD] shadow-xl shadow-[#3B5BDB]/30 md:size-16">
      {/* antenna */}
      <span className="absolute -top-2 left-1/2 h-2 w-0.5 -translate-x-1/2 bg-[#3B5BDB]" aria-hidden />
      <span className="absolute -top-3 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-emerald-400" aria-hidden />
      {/* face plate */}
      <span className="grid h-8 w-10 place-items-center gap-1 rounded-xl bg-white/95 md:h-9 md:w-11">
        <span className="flex items-center gap-1.5">
          <motion.span
            animate={talking ? { scaleY: [1, 0.2, 1] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}
            className="block size-2 rounded-full bg-[#3B5BDB]"
          />
          <motion.span
            animate={talking ? { scaleY: [1, 0.2, 1] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}
            className="block size-2 rounded-full bg-[#3B5BDB]"
          />
        </span>
        <span className="block h-0.5 w-4 rounded-full bg-[#8690FD]" />
      </span>
    </span>
  );
}
