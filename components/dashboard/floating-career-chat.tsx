"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRef, useEffect, useState } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  X,
  ChevronRight,
  Minimize2,
  MessageSquare,
} from "lucide-react";

const QUICK_PROMPTS = [
  "How do I stand out to global companies?",
  "What salary should I negotiate?",
  "How do I prep for a remote interview?",
  "What certifications boost my career?",
  "How do I write a strong resume summary?",
  "What tech skills are most in-demand?",
];

export function FloatingCareerChat({ profile }: { profile?: any }) {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat/career",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: { id, messages, profile },
      }),
    }),
  });

  const isStreaming = status === "streaming" || status === "submitted";
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (open && !minimised) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimised]);

  useEffect(() => {
    if (open && !minimised) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimised]);

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating panel */}
      {open && (
        <div
          className={`fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 flex flex-col transition-all duration-200 ${
            minimised ? "h-14" : "h-[520px]"
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="size-8 rounded-xl bg-gradient-to-br from-[#3B5BDB] to-[#5c7cfa] flex items-center justify-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">Career Assistant</p>
              <p className="text-[11px] text-gray-400">AI-powered · Always here to help</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimised((m) => !m)}
                className="size-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={minimised ? "Expand" : "Minimise"}
              >
                <Minimize2 className="size-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="size-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!hasMessages ? (
                  <div className="flex flex-col items-center justify-center h-full gap-5 py-2">
                    <div className="text-center">
                      <div className="size-12 rounded-2xl bg-[#3B5BDB]/8 flex items-center justify-center mx-auto mb-3">
                        <Bot className="size-6 text-[#3B5BDB]" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        Hi{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[240px]">
                        Ask me anything about your career, salary, or DeepTalent.
                      </p>
                    </div>
                    <div className="w-full space-y-1.5">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => sendMessage({ text: prompt })}
                          disabled={isStreaming}
                          className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl border border-gray-100 hover:border-[#3B5BDB]/25 hover:bg-[#3B5BDB]/[0.03] transition-all text-xs text-gray-700 group"
                        >
                          <ChevronRight className="size-3 text-gray-300 group-hover:text-[#3B5BDB] shrink-0 transition-colors" />
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message: UIMessage) => {
                      const text =
                        message.parts
                          ?.filter(
                            (p): p is { type: "text"; text: string } =>
                              p.type === "text"
                          )
                          .map((p) => p.text)
                          .join("") ?? "";
                      const isUser = message.role === "user";
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isUser
                                ? "bg-[#3B5BDB] text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isUser ? (
                              <User className="size-3" />
                            ) : (
                              <Bot className="size-3" />
                            )}
                          </div>
                          <div
                            className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                              isUser
                                ? "bg-[#3B5BDB] text-white rounded-tr-sm"
                                : "bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100"
                            }`}
                          >
                            {text}
                          </div>
                        </div>
                      );
                    })}
                    {isStreaming && (
                      <div className="flex gap-2">
                        <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="size-3 text-gray-600" />
                        </div>
                        <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-100">
                          <div className="flex gap-1 items-center h-3">
                            <span className="size-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                            <span className="size-1 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                            <span className="size-1 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 shrink-0">
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#3B5BDB]/50 focus-within:ring-2 focus-within:ring-[#3B5BDB]/10 focus-within:bg-white transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything…"
                    rows={1}
                    disabled={isStreaming}
                    className="flex-1 resize-none bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none leading-relaxed max-h-24 disabled:opacity-60"
                    style={{ minHeight: "20px" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming}
                    className="size-7 rounded-lg bg-[#3B5BDB] text-white flex items-center justify-center shrink-0 hover:bg-[#2f49b2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating pill trigger */}
      <button
        onClick={() => {
          setOpen((o) => !o);
          setMinimised(false);
        }}
        className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-5 h-12 rounded-full shadow-lg shadow-[#3B5BDB]/25 transition-all duration-200 font-semibold text-sm ${
          open
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-[#3B5BDB] text-white hover:bg-[#2f49b2] hover:shadow-xl hover:shadow-[#3B5BDB]/30"
        }`}
        aria-label="Toggle Career Assistant"
      >
        {open ? (
          <>
            <X className="size-4" />
            <span>Close</span>
          </>
        ) : (
          <>
            <MessageSquare className="size-4" />
            <span>Career Assistant</span>
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          </>
        )}
      </button>
    </>
  );
}
