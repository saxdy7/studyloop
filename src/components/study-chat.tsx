"use client";

import React, { useState, useEffect, useRef } from "react";
import { BrainCircuit, ArrowLeft, BookOpen, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatSessionItem = {
  id: string;
  title: string;
  roundCount: number;
};

export function StudyChat({
  session: activeSession,
  sessions = [],
  onSelectSession,
  onUpdateChat,
  onGenerate,
  onBack,
}: {
  session: any | null;
  sessions: ChatSessionItem[];
  onSelectSession: (session: ChatSessionItem) => void;
  onUpdateChat: (sessionId: string, messages: Message[]) => void;
  onGenerate: (text: string, numQuestions: number) => Promise<void>;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when active session changes
  useEffect(() => {
    if (activeSession) {
      if (activeSession.chatHistory && activeSession.chatHistory.length > 0) {
        setMessages(activeSession.chatHistory);
      } else {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: `Hi! I'm LoopBot, your StudyLoop assistant. I've loaded your notes for "${activeSession.title}". Ask me anything about them, or highlight key concepts you want to review!`,
          },
        ]);
      }
    } else {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Select a study session from the left sidebar to start chatting about your notes!",
        },
      ]);
    }
  }, [activeSession]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeSession) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    onUpdateChat(activeSession.id, nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          sourceText: activeSession.sourceText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");

      const assistantMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.reply,
      };

      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);
      onUpdateChat(activeSession.id, finalMessages);
    } catch (err) {
      const errorMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: "Sorry, I ran into an error generating that response. Please try again.",
      };
      const errorMessages = [...nextMessages, errorMsg];
      setMessages(errorMessages);
      onUpdateChat(activeSession.id, errorMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-black text-white rounded-3xl border border-white/5">
      {/* Background Hero Video Masked */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-3xl">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[2px]"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
      </div>

      <div className="relative z-10 flex w-full h-full">
        {/* Left Column — Sessions List */}
        <section className="hidden w-80 flex-col border-r border-white/5 bg-black/60 backdrop-blur-md p-6 lg:flex">
          <div className="mb-6 flex items-center gap-2">
            <BrainCircuit className="size-5" style={{ color: "#E1E0CC" }} />
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#E1E0CC" }}>
              Study Sessions
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSession(s)}
                className={cn(
                  "w-full text-left rounded-xl border p-3.5 transition-all text-xs flex items-start gap-3 group relative overflow-hidden cursor-pointer",
                  activeSession?.id === s.id
                    ? "bg-[#101010] border-white/10 text-white"
                    : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                {/* Active side indicator */}
                {activeSession?.id === s.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: "#E1E0CC" }} />
                )}
                <BookOpen className="size-4 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-white" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{s.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {s.roundCount || 0} rounds completed
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Right Column — Chat Area */}
        <section className="flex flex-1 flex-col h-full bg-black/40 backdrop-blur-md">
          {/* Header */}
          <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-white lg:hidden cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              <div className="hidden lg:block">
                <h1 className="text-sm font-semibold tracking-tight">LoopBot AI Tutor</h1>
                <p className="text-[11px] text-muted-foreground">
                  {activeSession
                    ? `Conversing on: "${activeSession.title}"`
                    : "Select a session to start"}
                </p>
              </div>
            </div>

            {activeSession && (
              <div className="flex items-center gap-3">
                {messages.length > 1 && (
                  <button
                    onClick={async () => {
                      setGenerating(true);
                      try {
                        const chatText = messages
                          .filter(m => m.id !== "welcome")
                          .map((m) => `${m.role === "user" ? "Student Query" : "Tutor Explanation"}: ${m.content}`)
                          .join("\n\n");
                        await onGenerate(chatText, 8);
                      } catch {
                        setGenerating(false);
                      }
                    }}
                    disabled={generating}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    {generating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Sparkles className="size-3 text-amber-400" />
                    )}
                    <span>Turn Chat into Quiz</span>
                  </button>
                )}
                <div className="flex items-center gap-2 rounded-full border border-white/5 bg-[#101010]/60 px-3 py-1 text-[11px]" style={{ color: "#E1E0CC" }}>
                  <Sparkles className="size-3 text-purple-400 animate-pulse" />
                  <span>Context Loaded</span>
                </div>
              </div>
            )}
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex w-full items-start gap-4 max-w-3xl",
                  m.role === "user" ? "ml-auto justify-end" : "justify-start"
                )}
              >
                {m.role === "assistant" && (
                  <div className="flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-primary">
                    <BrainCircuit className="size-4" style={{ color: "#E1E0CC" }} />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl p-4 text-sm leading-relaxed border shadow-md",
                    m.role === "user"
                      ? "bg-[#101010] border-white/10 text-white rounded-tr-none"
                      : "bg-[#161616] border-white/5 text-gray-200 rounded-tl-none"
                  )}
                >
                  <div className="prose prose-invert prose-xs whitespace-pre-wrap font-sans">
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex w-full items-start gap-4 justify-start max-w-3xl">
                <div className="flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-primary">
                  <BrainCircuit className="size-4 animate-pulse" style={{ color: "#E1E0CC" }} />
                </div>
                <div className="rounded-2xl p-4 text-sm leading-relaxed border border-white/5 bg-[#161616] text-gray-400 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Prompt Box Input wrapper */}
          <footer className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
            <div className="mx-auto max-w-3xl">
              <PromptInputBox
                placeholder={
                  activeSession
                    ? `Ask LoopBot about "${activeSession.title}"...`
                    : "Select a study session from the list to start chatting..."
                }
                isLoading={loading}
                onSend={handleSend}
                className={cn(!activeSession && "opacity-50 pointer-events-none")}
              />
              <p className="text-[10px] text-center text-muted-foreground mt-3">
                LoopBot can make mistakes. Verify important concepts directly from your notes.
              </p>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
