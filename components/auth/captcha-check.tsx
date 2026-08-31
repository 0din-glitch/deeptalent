"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid ambiguity

function randomCode(length = 6) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return out;
}

interface CaptchaCheckProps {
  /** Called whenever the entered text matches the generated code. */
  onVerified: (verified: boolean) => void;
  /** Tailwind classes for the accent color of the canvas strokes. */
  accent?: string;
}

/**
 * Lightweight, self-hosted CAPTCHA: draws a distorted random code onto a
 * <canvas> and asks the user to retype it. No external service or API key
 * required — good enough bot friction for a public sign-up form.
 */
export function CaptchaCheck({ onVerified, accent = "#0F7A3D" }: CaptchaCheckProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [verified, setVerified] = useState(false);

  const draw = useCallback((value: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#EAF6EE";
    ctx.fillRect(0, 0, width, height);

    // Noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(15, 122, 61, ${0.15 + Math.random() * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(15, 122, 61, ${0.1 + Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    // Characters, each rotated/offset slightly
    const charWidth = width / value.length;
    for (let i = 0; i < value.length; i++) {
      const x = charWidth * i + charWidth / 2;
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 24 - 12) * (Math.PI / 180);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = "bold 26px ui-monospace, monospace";
      ctx.fillStyle = accent;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(value[i], 0, 0);
      ctx.restore();
    }
  }, [accent]);

  const regenerate = useCallback(() => {
    const next = randomCode();
    setCode(next);
    setInput("");
    setVerified(false);
    onVerified(false);
    draw(next);
  }, [draw, onVerified]);

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isMatch = input.length > 0 && input.trim().toUpperCase() === code;
    if (isMatch !== verified) {
      setVerified(isMatch);
      onVerified(isMatch);
    }
  }, [input, code, verified, onVerified]);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white/90">Security check</label>
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={180}
          height={52}
          className="rounded-lg border border-white/25"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={regenerate}
          aria-label="Generate a new code"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type the code above"
        autoComplete="off"
        spellCheck={false}
        className={`frosted-input mt-2 uppercase tracking-widest ${
          verified ? "border-white/60" : ""
        }`}
      />
      {input.length > 0 && !verified && (
        <p className="mt-1 text-xs text-red-100">That doesn&apos;t match — try again.</p>
      )}
    </div>
  );
}
