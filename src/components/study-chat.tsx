"use client";

import React, { useState, useEffect, useRef } from "react";
import { BrainCircuit, ArrowLeft, BookOpen, Loader2, Sparkles, Volume2, VolumeX, FileText, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
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
  const [activeCanvasContent, setActiveCanvasContent] = useState<{ type: 'doc' | 'pdf' | 'code' | 'mermaid' | 'table'; content: string; title: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper functions for parsing content modes
  function parseThinking(content: string): { thinking: string; answer: string } {
    const thinkStart = content.indexOf("<think>");
    const thinkEnd = content.indexOf("</think>");
    if (thinkStart !== -1 && thinkEnd !== -1 && thinkEnd > thinkStart) {
      return {
        thinking: content.substring(thinkStart + 7, thinkEnd).trim(),
        answer: content.substring(thinkEnd + 8).trim()
      };
    }
    return { thinking: "", answer: content };
  }

  function cleanContent(text: string): string {
    if (text.startsWith("[Search: ")) {
      return text.replace(/^\[Search:\s*(.*?)\]/i, "$1");
    }
    if (text.startsWith("[Think: ")) {
      return text.replace(/^\[Think:\s*(.*?)\]/i, "$1");
    }
    if (text.startsWith("[Canvas: ")) {
      return text.replace(/^\[Canvas:\s*(.*?)\]/i, "$1");
    }
    return text;
  }

  function extractCanvasContent(messageContent: string): { type: 'doc' | 'pdf' | 'code' | 'mermaid' | 'table'; content: string; title: string } | null {
    if (messageContent.includes("```mermaid")) {
      const start = messageContent.indexOf("```mermaid") + 10;
      const end = messageContent.indexOf("```", start);
      return {
        type: "mermaid",
        content: messageContent.substring(start, end).trim(),
        title: "Flowchart / Diagram"
      };
    }

    if (messageContent.includes("```python") || messageContent.includes("```javascript") || messageContent.includes("```typescript")) {
      const langMatch = messageContent.match(/```(python|javascript|typescript|html|css)/);
      const lang = langMatch ? langMatch[1] : "code";
      const start = messageContent.indexOf("```" + lang) + 3 + lang.length;
      const end = messageContent.indexOf("```", start);
      return {
        type: "code",
        content: messageContent.substring(start, end).trim(),
        title: `${lang.toUpperCase()} Script`
      };
    }

    if (messageContent.includes("Here is a PDF representation") || messageContent.includes("PDF representation of our conversation") || messageContent.includes("Here is the code to generate a pdf:")) {
      const mdBlockStart = messageContent.indexOf("```markdown");
      if (mdBlockStart !== -1) {
        const start = mdBlockStart + 11;
        const end = messageContent.indexOf("```", start);
        return {
          type: "pdf",
          content: messageContent.substring(start, end).trim(),
          title: "PDF Document Summary"
        };
      }
    }

    if (messageContent.includes("| Topic | Description |") || messageContent.includes("| --- | --- |")) {
      const lines = messageContent.split("\n");
      const tableLines = lines.filter(l => l.trim().startsWith("|"));
      if (tableLines.length > 2) {
        return {
          type: "table",
          content: tableLines.join("\n"),
          title: "Tabular Summary"
        };
      }
    }

    return null;
  }

  function renderMarkdownDoc(content: string) {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-bold text-gray-800 mt-4 mb-2">{trimmed.substring(3)}</h3>;
      }
      if (trimmed.startsWith("# ")) {
        return <h2 key={idx} className="text-xl font-extrabold text-gray-900 mt-6 mb-3 border-b pb-1.5 border-black/5">{trimmed.substring(2)}</h2>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <li key={idx} className="text-sm text-gray-700 ml-4 list-disc my-1">{trimmed.substring(2)}</li>;
      }
      if (trimmed) {
        return <p key={idx} className="text-sm text-gray-700 leading-relaxed my-2">{trimmed}</p>;
      }
      return <div key={idx} className="h-2" />;
    });
  }

  function renderTableDoc(content: string) {
    const lines = content.split("\n").map(l => l.trim()).filter(l => l.startsWith("|"));
    if (lines.length < 2) return null;
    const headers = lines[0].split("|").map(h => h.trim()).filter(Boolean);
    const rows = lines.slice(2).map(line => {
      return line.split("|").map(c => c.trim()).filter(Boolean);
    });
    return (
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="min-w-full divide-y divide-white/5 text-left text-xs">
          <thead className="bg-[#151515]">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-semibold text-[#E1E0CC]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-[#101010]/40">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-gray-300">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const downloadFile = (content: string, filename: string) => {
    if (typeof window === "undefined") return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename} successfully!`);
  };
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = (msgId: string, text: string) => {
    if (typeof window === "undefined") return;

    const cleanText = text.replace(/<think>[\s\S]*?<\/think>/i, "").replace(/[`*#_]/g, "").trim();

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };
  // Initialize welcome message when active session changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Downscale to max 800px width or height
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.7)); // 70% quality JPEG
          } else {
            resolve(event.target?.result as string); // fallback
          }
        };
      };
      reader.onerror = () => resolve("");
    });
  };

  const handleSend = async (text: string, files: File[] = []) => {
    if (!text.trim() || !activeSession) return;

    let base64Image: string | undefined;
    if (files && files.length > 0) {
      try {
        base64Image = await compressImage(files[0]);
      } catch (err) {
        console.error("Failed to read and compress image file:", err);
      }
    }

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      image: base64Image,
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
          image: base64Image,
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

      // Automatically open in canvas if user query is in Canvas mode
      if (text.startsWith("[Canvas: ")) {
        const hasCanvas = extractCanvasContent(data.reply);
        if (hasCanvas) {
          setActiveCanvasContent(hasCanvas);
        }
      }
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
              <div className="flex items-center gap-3 border-none">
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
                  {(() => {
                    const parsed = parseThinking(m.content);
                    return (
                      <div className="flex flex-col gap-1">
                        {m.role === "user" && m.content.startsWith("[Search:") && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1.5">
                            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Search Mode Active
                          </span>
                        )}
                        {m.role === "user" && m.content.startsWith("[Think:") && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Deep Reasoning Active
                          </span>
                        )}
                        {m.role === "user" && m.content.startsWith("[Canvas:") && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1.5 mb-1.5">
                            <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
                            Canvas Mode Active
                          </span>
                        )}
                        {m.image && (
                          <img src={m.image} alt="Attachment" className="max-w-[240px] max-h-[160px] object-cover rounded-lg mb-2 border border-white/10" />
                        )}
                        {parsed.thinking && (
                          <details className="mb-3 text-[12px] text-muted-foreground/80 bg-white/5 border border-white/5 rounded-xl p-3 cursor-pointer group">
                            <summary className="font-semibold select-none flex items-center gap-1.5 outline-none hover:text-white transition-colors" style={{ color: "#E1E0CC" }}>
                              <BrainCircuit className="size-3.5 text-amber-400" />
                              <span>Thinking Process</span>
                            </summary>
                            <div className="mt-2 pl-3 border-l border-white/10 whitespace-pre-wrap leading-relaxed text-gray-300">
                              {parsed.thinking}
                            </div>
                          </details>
                        )}
                        <div className="prose prose-invert prose-xs whitespace-pre-wrap font-sans">
                          {m.role === "user" ? cleanContent(m.content) : (parsed.answer || parsed.thinking || "Analyzing study notes...")}
                        </div>
                        {m.role === "assistant" && (
                          <div className="flex items-center gap-2 mt-2.5">
                            <button
                              type="button"
                              onClick={() => toggleSpeech(m.id, m.content)}
                              className="text-[10px] flex items-center gap-1 hover:text-white text-muted-foreground/60 transition-colors cursor-pointer"
                            >
                              {speakingMsgId === m.id ? (
                                <>
                                  <VolumeX className="size-3 text-red-400 animate-pulse" />
                                  <span>Stop Reading</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="size-3 text-cyan-400" />
                                  <span>Read Out Loud</span>
                                </>
                              )}
                            </button>
                            {(() => {
                              const hasCanvas = extractCanvasContent(m.content);
                              if (hasCanvas) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setActiveCanvasContent(hasCanvas)}
                                    className="text-[10px] flex items-center gap-1 hover:text-white text-muted-foreground/60 transition-colors cursor-pointer border border-white/5 bg-white/5 rounded-full px-2 py-0.5 ml-1.5"
                                  >
                                    <FileText className="size-3 text-purple-400 animate-pulse" />
                                    <span>View in Canvas</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}
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

        {activeCanvasContent && (
          <div className="w-1/2 border-l border-white/5 bg-[#0C0C0C] flex flex-col h-full relative z-10 transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]/60">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-purple-400" />
                <span className="text-sm font-semibold">{activeCanvasContent.title}</span>
              </div>
              <button
                onClick={() => setActiveCanvasContent(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#101010]/30 text-xs">
              <div className="text-muted-foreground">Interactive preview mode</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeCanvasContent.content);
                    toast.success("Copied to clipboard!");
                  }}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 font-medium transition-colors cursor-pointer"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    const extension = activeCanvasContent.type === "code" ? "py" : activeCanvasContent.type === "mermaid" ? "mermaid" : "txt";
                    downloadFile(activeCanvasContent.content, `canvas-artifact.${extension}`);
                  }}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 font-medium transition-colors cursor-pointer"
                >
                  Download File
                </button>
                {(activeCanvasContent.type === "pdf" || activeCanvasContent.type === "doc") && (
                  <button
                    onClick={() => {
                      const printWindow = window.open("", "_blank");
                      if (!printWindow) return;
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>${activeCanvasContent.title}</title>
                            <style>
                              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; }
                              h1, h2, h3 { color: #111111; }
                              p, li { line-height: 1.6; color: #333333; }
                            </style>
                          </head>
                          <body>
                            ${activeCanvasContent.content
                              .replace(/^# (.*)$/gm, "<h1>$1</h1>")
                              .replace(/^## (.*)$/gm, "<h2>$1</h2>")
                              .replace(/^### (.*)$/gm, "<h3>$1</h3>")
                              .replace(/^- (.*)$/gm, "<li>$1</li>")}
                            <script>window.onload = function() { window.print(); window.close(); }</script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 font-medium transition-colors cursor-pointer"
                  >
                    Print / Export PDF
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeCanvasContent.type === "pdf" || activeCanvasContent.type === "doc" ? (
                <div className="bg-white text-gray-900 shadow-xl rounded-xl p-8 border border-gray-200 min-h-[500px] font-sans">
                  {renderMarkdownDoc(activeCanvasContent.content)}
                </div>
              ) : activeCanvasContent.type === "table" ? (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                  {renderTableDoc(activeCanvasContent.content)}
                </div>
              ) : (
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 overflow-x-auto font-mono text-xs text-gray-300 leading-relaxed whitespace-pre">
                  {activeCanvasContent.content}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
