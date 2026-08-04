"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "motion/react";
import { X, Play } from "lucide-react";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  published: string;
  isShort: boolean;
  url: string;
};

type FeedResponse = {
  channelTitle: string;
  channelUrl: string;
  videos: Video[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Official YouTube "play button" logo mark. */
function YouTubeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" className={className} aria-hidden="true">
      <path
        d="M27.4 3.1a3.5 3.5 0 0 0-2.47-2.48C22.76 0 14 0 14 0S5.24 0 3.07.62A3.5 3.5 0 0 0 .6 3.1 36.6 36.6 0 0 0 0 10a36.6 36.6 0 0 0 .6 6.9 3.5 3.5 0 0 0 2.47 2.48C5.24 20 14 20 14 20s8.76 0 10.93-.62a3.5 3.5 0 0 0 2.47-2.48A36.6 36.6 0 0 0 28 10a36.6 36.6 0 0 0-.6-6.9Z"
        fill="#FF0000"
      />
      <path d="M11.2 14.29 18.5 10l-7.3-4.29v8.58Z" fill="#fff" />
    </svg>
  );
}

/**
 * Slides in from the bottom-right when the user scrolls the Strategic Intelligence
 * ("#insights") section into view, surfacing the latest videos from the channel.
 */
export function YouTubePopup({ targetId = "insights" }: { targetId?: string }) {
  const [inView, setInView] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const hasOpenedRef = useRef(false);

  const { data } = useSWR<FeedResponse>("/api/youtube/latest", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600_000,
  });

  // Observe the target section. The section is rendered after a client-side
  // fetch, so poll until it exists before attaching the observer.
  useEffect(() => {
    let obs: IntersectionObserver | null = null;
    let raf = 0;
    let tries = 0;

    const attach = () => {
      const el = document.getElementById(targetId);
      if (!el) {
        if (tries++ < 200) {
          raf = window.setTimeout(attach, 150);
        }
        return;
      }
      obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            hasOpenedRef.current = true;
          } else {
            setInView(false);
          }
        },
        { threshold: 0.15 },
      );
      obs.observe(el);
    };

    attach();
    return () => {
      obs?.disconnect();
      window.clearTimeout(raf);
    };
  }, [targetId]);

  const videos = data?.videos ?? [];
  const channelUrl = data?.channelUrl ?? "https://www.youtube.com/channel/UChLDSerUzrbEXHSp0VFpTqw";
  const open = inView && !dismissed && videos.length > 0;

  return (
    <>
      {/* Bottom-right slide-in panel */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.aside
            key="yt-panel"
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed bottom-5 right-5 z-[70] w-[min(92vw,22rem)] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-black/20"
            aria-label="Latest videos from DeepTalent on YouTube"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
              <YouTubeLogo className="h-6 w-auto" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{data?.channelTitle ?? "DeepTalent Platform"}</p>
                <p className="text-xs text-gray-400">Latest on YouTube</p>
              </div>
              <button
                onClick={() => setMinimized(true)}
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Minimize"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Video list */}
            <ul className="max-h-[19rem] overflow-y-auto p-2">
              {videos.map((v) => (
                <li key={v.id}>
                  <button
                    onClick={() => setActiveVideo(v)}
                    className="group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="size-5 fill-white text-white" />
                      </span>
                      {v.isShort && (
                        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[9px] font-bold uppercase text-white">
                          Short
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-xs font-semibold leading-snug text-gray-800">{v.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#FF0000] hover:underline"
              >
                Visit channel
              </a>
              <button onClick={() => setDismissed(true)} className="text-xs font-medium text-gray-400 hover:text-gray-600">
                Dismiss
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Minimized floating YouTube button */}
      <AnimatePresence>
        {open && minimized && (
          <motion.button
            key="yt-fab"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => setMinimized(false)}
            className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-2xl shadow-black/20 ring-1 ring-gray-200 transition-transform hover:scale-105"
            aria-label="Show latest YouTube videos"
          >
            <YouTubeLogo className="h-6 w-auto" />
            <span className="text-sm font-bold text-gray-900">Watch</span>
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#FF0000] text-[10px] font-bold text-white">
              {videos.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Video player modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            key="yt-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl ${
                activeVideo.isShort ? "max-w-sm" : "max-w-3xl"
              }`}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute -top-11 right-0 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Close video"
              >
                <X className="size-5" />
              </button>
              <div className={activeVideo.isShort ? "aspect-[9/16]" : "aspect-video"}>
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="line-clamp-2 px-4 py-3 text-sm font-semibold text-white">{activeVideo.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
