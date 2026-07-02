"use client";

import { useQuery } from "convex/react";
import {
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileUp,
  Monitor,
  PanelLeft,
  Plus,
  Repeat2,
  RotateCw,
  Share,
  Sparkles,
  Target,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";

const inboxRows = [
  { q: "Where do light-dependent reactions occur?", topic: "Light reactions", mastery: "4/4", status: "Mastered", color: "text-[#28c840]/80" },
  { q: "What does the Calvin cycle consume?", topic: "Calvin cycle", mastery: "2/5", status: "Re-testing", color: "text-[#febc2e]/80" },
  { q: "Which pigment absorbs light energy?", topic: "Chlorophyll", mastery: "3/4", status: "Mastered", color: "text-[#28c840]/80" },
  { q: "What limits the rate of photosynthesis?", topic: "Rate factors", mastery: "1/4", status: "Weak spot", color: "text-[#ff5f57]/80" },
  { q: "What is the overall balanced equation?", topic: "Equation", mastery: "2/3", status: "Re-testing", color: "text-[#febc2e]/80" },
];

export function AppMockup() {
  const stats = useQuery(api.study.stats, {});

  const statCells = [
    { label: "SESSIONS", value: stats?.sessions ?? "–", sub: "Study sessions" },
    { label: "ROUNDS", value: stats?.rounds ?? "–", sub: "Quiz rounds run" },
    { label: "ANSWERED", value: stats?.questionsAnswered ?? "–", sub: "Questions answered" },
    { label: "TARGET", value: "80%", sub: "Mastery threshold" },
  ];

  return (
    <div className="overflow-hidden rounded-t-2xl bg-[#1a1a1c] text-left shadow-[0_-20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#242427] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <PanelLeft className="size-3.5 text-white/40" />
        <ChevronLeft className="size-3.5 text-white/40" />
        <ChevronRight className="size-3.5 text-white/25" />
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-[#1a1a1c] px-6 py-1 text-[10px] text-white/60">
          <Monitor className="size-3" />
          studyloop.app
        </div>
        <RotateCw className="size-3.5 text-white/40" />
        <Share className="size-3.5 text-white/40" />
        <Plus className="size-3.5 text-white/40" />
        <Copy className="size-3.5 text-white/40" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-[22%] shrink-0 border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 sm:block">
          <div className="mb-4 flex items-center justify-between">
            <Repeat2 className="size-4 text-white/70" />
            <Plus className="size-3.5 text-white/30" />
          </div>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-4 items-center justify-center rounded bg-[#7c6cf6] text-[8px] font-bold text-white">
              B
            </span>
            <span className="text-[10px] text-white/80">Biology · Unit 4</span>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: FileUp, label: "Upload notes" },
              { icon: BrainCircuit, label: "Study plan" },
              { icon: Target, label: "Weak spots" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[10px] text-white/60">
                <item.icon className="size-3" />
                {item.label}
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-white/5 pt-3">
            <p className="mb-2 text-[8px] tracking-wider text-white/30">RECENT SESSIONS</p>
            {["Photosynthesis", "Cell respiration", "Genetics basics"].map((s) => (
              <div key={s} className="flex items-center gap-1.5 py-1 text-[10px] text-white/50">
                <span className="size-1 rounded-full bg-[#28c840]/70" />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#7c6cf6] text-sm font-bold text-white">
                B
              </span>
              <div>
                <p className="text-sm font-medium text-white">Photosynthesis</p>
                <p className="text-[10px] text-white/45">Round 2 · 3 weak spots remaining</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] text-white/80">
              <Sparkles className="size-3" /> Re-test weak spots
            </span>
          </div>

          {/* Stats grid — real numbers from the Convex DB */}
          <div className="mb-4 grid grid-cols-2 divide-x divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/5 sm:grid-cols-4">
            {statCells.map((s) => (
              <div key={s.label} className="px-3 py-3">
                <p className="text-[8px] tracking-wider text-white/35">{s.label}</p>
                <p className="text-xl font-medium tabular-nums text-white">
                  {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                </p>
                <p className="text-[9px] text-white/40">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Weak-spot inbox */}
          <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5">
            <p className="border-b border-white/5 px-3 py-2 text-[9px] tracking-wider text-white/35">
              QUESTION HISTORY
            </p>
            {inboxRows.map((row) => (
              <div
                key={row.q}
                className="flex items-center justify-between gap-3 border-b border-white/5 px-3 py-2 last:border-b-0"
              >
                <p className="truncate text-[10px] text-white/70">{row.q}</p>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="hidden text-[9px] text-white/40 md:inline">{row.topic}</span>
                  <span className="text-[9px] tabular-nums text-white/50">{row.mastery}</span>
                  <span className={`w-16 text-right text-[9px] ${row.color}`}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
