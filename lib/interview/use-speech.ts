"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Minimal typings for the Web Speech API (not in lib.dom by default). */
/* ------------------------------------------------------------------ */
type SpeechRecognitionAlternative = { transcript: string; confidence: number };
type SpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  item(i: number): SpeechRecognitionAlternative;
  [i: number]: SpeechRecognitionAlternative;
};
type SpeechRecognitionResultList = {
  length: number;
  item(i: number): SpeechRecognitionResult;
  [i: number]: SpeechRecognitionResult;
};
type SpeechRecognitionEvent = { resultIndex: number; results: SpeechRecognitionResultList };
type SpeechRecognitionErrorEvent = { error: string };

interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): (new () => ISpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function speechSupported(): { tts: boolean; stt: boolean } {
  if (typeof window === "undefined") return { tts: false, stt: false };
  return {
    tts: "speechSynthesis" in window,
    stt: getRecognitionCtor() != null,
  };
}

/* ----------------------------- TTS ----------------------------- */
export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        if (!supported) {
          resolve();
          return;
        }
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        utter.pitch = 1;
        // Prefer a natural English voice when available.
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find((v) => /en-(US|GB)/i.test(v.lang) && /natural|google|samantha|daniel/i.test(v.name)) ||
          voices.find((v) => /en-(US|GB)/i.test(v.lang));
        if (preferred) utter.voice = preferred;
        utter.onstart = () => setSpeaking(true);
        utter.onend = () => {
          setSpeaking(false);
          resolve();
        };
        utter.onerror = () => {
          setSpeaking(false);
          resolve();
        };
        window.speechSynthesis.speak(utter);
      }),
    [supported],
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => () => cancel(), [cancel]);

  return { speak, cancel, speaking, supported };
}

/* --------------------------- STT (ASR) -------------------------- */
export function useSpeechRecognition() {
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalRef = useRef("");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const supported = getRecognitionCtor() != null;

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    // Reset for a fresh question.
    finalRef.current = "";
    setTranscript("");
    setInterim("");

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalRef.current += text + " ";
        } else {
          interimText += text;
        }
      }
      setTranscript(finalRef.current.trim());
      setInterim(interimText);
    };
    rec.onerror = () => {
      /* swallow no-speech / aborted errors; UI handles empty transcripts */
    };
    rec.onend = () => {
      setListening(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    }
    setListening(false);
    setInterim("");
    const finalText = finalRef.current.trim();
    setTranscript(finalText);
    return finalText;
  }, []);

  useEffect(
    () => () => {
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          /* noop */
        }
      }
    },
    [],
  );

  return { start, stop, listening, transcript, interim, supported };
}
