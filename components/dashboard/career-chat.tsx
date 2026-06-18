"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRef, useEffect, useState } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

const QUICK_PROMPTS = [
  "How do I make my profile stand out to global companies?",
  "What salary should I negotiate for my role?",
  "How do I prepare for a remote job interview?",
  "What certifications would boost my career?",
  "How do I write a strong resume summary?",
  "What are the most in-demand tech skills right now?",
];

export function CareerChat({ profile }: { profile: any }) {
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  function handleQuickPrompt(prompt: string) {
    if (isStreaming) return;
    sendMessage({ text: prompt });
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[780px] min-h-[520px]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
        <div className="size-10 rounded-xl bg-gradient-to-br from-[#3B5BDB] to-[#5c7cfa] flex items-center justify-center shadow-sm">
          <Sparkles className="size-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight">Career Assistant</h2>
          <p className="text-xs text-gray-400">Powered by AI · Ask anything about your career</p>
        </div>
        {hasMessages && (
          <button
            onClick={() => window.location.reload()}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="size-3.5" /> New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-5 space-y-5 scrollbar-thin">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
            <div className="text-center">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-[#3B5BDB]/10 to-[#5c7cfa]/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="size-8 text-[#3B5BDB]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hi{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
              </h3>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                I&apos;m your personal career advisor. Ask me anything about growing your career, landing global roles, or navigating DeepTalent.
              </p>
            </div>

            <div className="w-full max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 text-center">
                Quick questions
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="flex items-center gap-2 text-left px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-[#3B5BDB]/30 hover:bg-[#3B5BDB]/[0.03] transition-all text-sm text-gray-700 group"
                  >
                    <ChevronRight className="size-3.5 text-gray-300 group-hover:text-[#3B5BDB] shrink-0 transition-colors" />
                    <span className="leading-tight">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-1">
            {messages.map((message: UIMessage) => {
              const text = message.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p: { type: "text"; text: string }) => p.text)
                .join("") ?? "";

              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser
                        ? "bg-[#3B5BDB] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isUser ? (
                      <User className="size-4" />
                    ) : (
                      <Bot className="size-4" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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

            {/* Typing indicator */}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Bot className="size-4 text-gray-600" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-100">
                  <div className="flex gap-1 items-center h-4">
                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#3B5BDB]/50 focus-within:ring-2 focus-within:ring-[#3B5BDB]/10 transition-all shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your career…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none leading-relaxed max-h-32 disabled:opacity-60"
            style={{ minHeight: "24px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="size-8 rounded-xl bg-[#3B5BDB] text-white flex items-center justify-center shrink-0 hover:bg-[#2f49b2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          AI can make mistakes. Always verify important career information.
        </p>
      </div>
    </div>
  );
}
