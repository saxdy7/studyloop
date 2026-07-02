"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  Code2,
  Database,
  FileUp,
  Repeat2 as RepeatIcon,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { AppMockup } from "@/components/landing/app-mockup";
import { ScrollRevealText } from "@/components/landing/scroll-reveal-text";
import {
  WordsPullUp,
  WordsPullUpMultiStyle,
} from "@/components/landing/words-pull-up";

const CREAM = "#E1E0CC";
const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const CARD_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="h-screen p-4 md:p-6">
      <div className="relative h-full overflow-hidden rounded-2xl bg-[#101010] md:rounded-[2rem]">
        {/* Background video */}
        <video
          src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* Hanging navbar pill */}
        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
            {[
              { label: "The loop", href: "#loop" },
              { label: "Features", href: "#features" },
              { label: "Live app", href: "/study" },
              { label: "GitHub", href: "https://github.com/saxdy7/studyloop" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-display text-[10px] transition-colors sm:text-xs md:text-sm"
                style={{ color: "rgba(225, 224, 204, 0.8)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Bottom-aligned hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-6 sm:px-8 md:px-10 md:pb-10">
          <div className="grid grid-cols-12 items-end gap-4">
            <h1
              className="font-display col-span-12 select-none font-medium leading-[0.85] tracking-[-0.07em] lg:col-span-8"
              style={{ color: CREAM }}
            >
              <span className="relative inline-block text-[17vw] sm:text-[16vw] lg:text-[13vw]">
                <WordsPullUp text="StudyLoop" />
                <span className="absolute -right-[0.35em] top-[0.12em] text-[0.28em]">
                  *
                </span>
              </span>
            </h1>

            <div className="col-span-12 flex flex-col gap-4 pb-2 lg:col-span-4">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-xs leading-[1.2] sm:text-sm md:text-base"
                style={{ color: "rgba(225, 224, 204, 0.7)" }}
              >
                An agentic study coach that turns your messy lecture notes into
                a quiz, remembers every topic you get wrong, and keeps
                re-testing your weak spots — harder each round — until the
                material actually sticks.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href="/study"
                  className="group inline-flex w-fit items-center gap-2 rounded-full py-1.5 pl-5 pr-1.5 font-display text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
                  style={{ backgroundColor: CREAM }}
                >
                  Start the loop
                  <span className="flex size-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:size-10">
                    <ArrowRight className="size-4" style={{ color: CREAM }} />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* App mockup section                                                  */
/* ------------------------------------------------------------------ */

function MockupSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="loop" className="bg-black px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-display text-[10px] tracking-widest sm:text-xs" style={{ color: CREAM }}>
          THE LOOP, LIVE
        </p>
        <h2 className="font-display mt-4 text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "Every answer you get wrong", className: "text-[#E1E0CC]" },
              { text: "becomes your next quiz.", className: "text-gray-500" },
            ]}
          />
        </h2>
        <p className="font-display mx-auto mt-4 max-w-md text-xs text-gray-500 sm:text-sm">
          The numbers below are live from the database — every session, round,
          and answer, persisted in real time.
        </p>
      </div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 64, scale: 0.97 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-12 w-[95%] max-w-4xl sm:w-[88%]"
      >
        <AppMockup />
        {/* Smooth gradient fade overlay at the bottom to blend into the landing page */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Core Features                                                       */
/* ------------------------------------------------------------------ */

function CoreFeatures() {
  return (
    <section className="bg-black px-5 py-20 sm:px-8 md:py-28 text-center flex justify-center border-t border-white/5">
      <div className="w-full max-w-[1100px] mx-auto">
        {/* Header Block */}
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-[2px] bg-gradient-to-r from-[#E1E0CC] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent mb-4">
            Core Features
          </span>
          <h2 className="font-display mt-2 text-2xl font-normal sm:text-3xl md:text-4xl text-[#E1E0CC] tracking-tight">
            Built for Speed & Mastery
          </h2>
          <p className="font-display mx-auto mt-4 max-w-md text-xs leading-relaxed text-gray-500 sm:text-sm">
            Everything you need to turn raw study notes <br />
            into active recall loops.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 — Smart Note Processing */}
          <div className="relative h-[340px] flex flex-col justify-end overflow-hidden rounded-[20px] border border-white/5 bg-[#101010] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] text-left group">
            {/* Top Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(225,224,204,0.12)_0%,rgba(225,224,204,0.03)_40%,transparent_70%)] pointer-events-none" />

            {/* Prompt Box */}
            <div className="absolute top-[30px] left-6 right-6 p-4 rounded-xl bg-[#161616] border border-white/5 shadow-lg text-[11px] leading-relaxed text-gray-400">
              Photosynthesis: light-dependent reactions convert{" "}
              <span className="font-semibold bg-gradient-to-r from-[#E1E0CC] to-[#A78BFA] bg-clip-text text-transparent">light energy</span> into{" "}
              <span className="font-semibold bg-gradient-to-r from-[#E1E0CC] to-[#A78BFA] bg-clip-text text-transparent">chemical energy</span> inside the{" "}
              <span className="font-semibold bg-gradient-to-r from-[#E1E0CC] to-[#A78BFA] bg-clip-text text-transparent">thylakoid membranes</span>.
            </div>

            {/* Identify weak spots pill button */}
            <div className="absolute top-[180px] left-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1C1C1C] px-3.5 py-1.5 text-[10px] font-semibold text-[#E1E0CC] shadow-md">
              <span className="text-purple-400 text-xs">✦</span>
              Identify weak spots
            </div>

            {/* Cursor SVG */}
            <svg
              className="absolute top-[205px] left-[110px] size-6 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] z-10"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 2L20 11L11 13L9 22L4 2Z"
                fill="#E1E0CC"
                stroke="#101010"
                strokeWidth="1.5"
              />
            </svg>

            {/* Heading */}
            <h3 className="relative z-10 p-6 text-sm font-semibold text-[#E1E0CC] tracking-wide">
              Smart Note Processing
            </h3>
          </div>

          {/* Card 2 — API Access */}
          <div className="relative h-[340px] flex flex-col justify-end overflow-hidden rounded-[20px] border border-white/5 bg-[#101010] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] text-left group">
            {/* Top Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(167,139,250,0.12)_0%,rgba(167,139,250,0.03)_40%,transparent_70%)] pointer-events-none" />

            {/* API Visual */}
            <div className="absolute inset-x-0 top-0 bottom-[70px] flex items-center justify-center px-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/network.svg"
                alt="Network Sync"
                className="h-[180px] w-full object-contain mt-5 opacity-80 filter brightness-110"
              />
            </div>

            {/* Heading */}
            <h3 className="relative z-10 p-6 text-sm font-semibold text-[#E1E0CC] tracking-wide">
              Lemma Pod API Sync
            </h3>
          </div>

          {/* Card 3 — Project Library */}
          <div className="relative h-[340px] flex flex-col justify-end overflow-hidden rounded-[20px] border border-white/5 bg-[#101010] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] text-left group">
            {/* Top Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,114,182,0.12)_0%,rgba(244,114,182,0.03)_40%,transparent_70%)] pointer-events-none" />

            {/* Mesh Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                WebkitMaskImage: "radial-gradient(circle at center top, black 0%, transparent 80%)",
                maskImage: "radial-gradient(circle at center top, black 0%, transparent 80%)",
              }}
            />

            {/* Folder Image */}
            <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-[170px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/library%20icon.svg"
                alt="Folder icon"
                className="w-full object-contain filter saturate-75 opacity-90"
              />
            </div>

            {/* Search Pill */}
            <div className="absolute top-[220px] left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-4.5 py-1.5 text-[10px] text-[#E1E0CC] shadow-md whitespace-nowrap">
              <svg
                className="size-3.5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search in loops</span>
            </div>

            {/* Heading */}
            <h3 className="relative z-10 p-6 text-sm font-semibold text-[#E1E0CC] tracking-wide">
              Persistent Loop Library
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

function About() {
  return (
    <section className="bg-black px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#101010] px-6 py-16 text-center sm:px-10 md:py-24">
        <p className="font-display text-[10px] tracking-widest sm:text-xs" style={{ color: CREAM }}>
          WHY IT EXISTS
        </p>
        <h2 className="font-display mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl">
          <WordsPullUpMultiStyle
            segments={[
              { text: "Re-reading feels", className: "text-[#E1E0CC]" },
              { text: "productive.", className: "font-serif-accent text-[#E1E0CC]" },
              { text: "It isn't.", className: "text-[#E1E0CC]" },
            ]}
          />
        </h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <ScrollRevealText
            className="font-display text-xs leading-relaxed text-[#DEDBC8] sm:text-sm md:text-base"
            text="Passive review is one of the weakest ways to learn — yet it's what almost every student defaults to the night before an exam. Active recall and spaced re-testing are proven to work, but building your own quizzes and tracking your own weak areas by hand is so tedious that nobody does it. StudyLoop makes the effective method the effortless one: an agent builds the quiz, a database remembers every mistake, and the loop keeps closing until mastery."
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

type FeatureCard = {
  number: string;
  title: string;
  items: string[];
};

const featureCards: FeatureCard[] = [
  {
    number: "01",
    title: "Instant Study Plan.",
    items: [
      "Drop a lecture PDF or paste raw notes",
      "Agent extracts 3–6 key topics",
      "One-line summary per topic",
      "Ready in under a minute",
    ],
  },
  {
    number: "02",
    title: "Adaptive Quizzing.",
    items: [
      "MCQs that test understanding, not recall",
      "Instant feedback with explanations",
      "Re-tests get harder each round",
    ],
  },
  {
    number: "03",
    title: "Weak-Spot Memory.",
    items: [
      "Per-topic mastery tracked across rounds",
      "Everything persisted to a real-time DB",
      "Loop continues until 80%+ mastery",
    ],
  },
];

function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative min-h-screen bg-black px-4 py-16 sm:px-6 md:py-24">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="font-display text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "A complete study loop for serious learners.", className: "text-[#E1E0CC]" },
              ]}
            />
          </h2>
          <h3 className="font-display mt-2 text-xl font-normal text-gray-500 sm:text-2xl md:text-3xl lg:text-4xl">
            <WordsPullUpMultiStyle
              segments={[{ text: "Built for mastery. Powered by agents.", className: "" }]}
            />
          </h3>
        </div>

        <div ref={ref} className="grid gap-3 sm:grid-cols-2 sm:gap-2 lg:h-[480px] lg:grid-cols-4 lg:gap-1">
          {/* Video card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-64 overflow-hidden rounded-xl"
          >
            <video
              src={CARD_VIDEO}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <p
              className="font-display absolute bottom-4 left-4 text-lg font-medium"
              style={{ color: CREAM }}
            >
              Your revision engine.
            </p>
          </motion.div>

          {/* Numbered cards */}
          {featureCards.map((card, i) => (
            <motion.div
              key={card.number}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.8,
                delay: (i + 1) * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col rounded-xl bg-[#212121] p-5"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-white/5 sm:size-12">
                <span className="font-display text-xs text-gray-500">{card.number}</span>
              </div>
              <h4 className="font-display mb-4 text-lg font-medium" style={{ color: CREAM }}>
                {card.title}{" "}
                <span className="text-gray-600">({card.number})</span>
              </h4>
              <ul className="flex-1 space-y-3">
                {card.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0" style={{ color: CREAM }} />
                    <span className="font-display text-xs text-gray-400 sm:text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/study"
                className="group mt-5 inline-flex items-center gap-1.5 font-display text-sm"
                style={{ color: CREAM }}
              >
                Try it now
                <ArrowRight className="size-4 -rotate-45 transition-transform group-hover:rotate-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA + Footer                                                        */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="bg-black px-5 pb-8 pt-4 sm:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#101010] px-6 py-14 text-center sm:px-10">
        <h2 className="font-display text-2xl font-normal sm:text-3xl md:text-4xl" style={{ color: CREAM }}>
          <WordsPullUp text="Your next exam won't study for itself." />
        </h2>
        <div className="mt-8 flex justify-center">
          <Link
            href="/study"
            className="group inline-flex items-center gap-2 rounded-full py-1.5 pl-5 pr-1.5 font-display text-sm font-medium text-black transition-all hover:gap-3 sm:text-base"
            style={{ backgroundColor: CREAM }}
          >
            Start the loop
            <span className="flex size-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:size-10">
              <ArrowRight className="size-4" style={{ color: CREAM }} />
            </span>
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-6xl items-center justify-between px-2 text-[11px] text-gray-500">
        <span className="font-display">
          StudyLoop<span style={{ color: CREAM }}>*</span> — Gappy AI &ldquo;Ship to Get
          Hired&rdquo; 2026
        </span>
        <Link
          href="https://github.com/saxdy7/studyloop"
          className="flex items-center gap-1.5 transition-colors hover:text-gray-300"
        >
          <Code2 className="size-3.5" /> Source
        </Link>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* How it works (numbered timeline)                                    */
/* ------------------------------------------------------------------ */

const howSteps = [
  {
    icon: FileUp,
    title: "Drop your notes",
    text: "Upload a lecture PDF or paste raw text. No cleanup, no formatting — the agent reads the mess.",
  },
  {
    icon: BrainCircuit,
    title: "Get a plan + quiz",
    text: "It extracts the key topics and writes multiple-choice questions that test whether you actually understand them.",
  },
  {
    icon: Target,
    title: "Find your weak spots",
    text: "Every answer is scored per topic. Anything under 80% mastery is flagged — and remembered.",
  },
  {
    icon: RepeatIcon,
    title: "Re-test until it sticks",
    text: "One tap builds a fresh round focused only on your weak topics, a little harder each time.",
  },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-black px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="font-display text-[10px] tracking-widest sm:text-xs" style={{ color: CREAM }}>
            HOW IT WORKS
          </p>
          <h2 className="font-display mt-4 text-2xl font-normal sm:text-3xl md:text-4xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Four steps.", className: "text-[#E1E0CC]" },
                { text: "One closing loop.", className: "text-gray-500" },
              ]}
            />
          </h2>
        </div>

        <div ref={ref} className="grid gap-3 md:grid-cols-4">
          {howSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl bg-[#101010] p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-white/5">
                  <step.icon className="size-5" style={{ color: CREAM }} />
                </div>
                <span className="font-display text-3xl font-medium text-white/10">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-display mb-2 text-lg" style={{ color: CREAM }}>
                {step.title}
              </h3>
              <p className="font-display text-xs leading-relaxed text-gray-400 sm:text-sm">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Comparison                                                          */
/* ------------------------------------------------------------------ */

const oldWay = [
  "Re-read the same notes and highlight",
  "Feels productive, forgotten in days",
  "No idea which topics are actually weak",
  "Study everything equally, every time",
  "Nothing carries over to next session",
];

const loopWay = [
  "Active recall through targeted quizzing",
  "Spaced re-testing locks knowledge in",
  "Per-topic mastery tracked automatically",
  "Time spent only where you're weak",
  "Progress saved to your account, always",
];

function Comparison() {
  return (
    <section className="bg-black px-4 py-20 sm:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="font-display text-[10px] tracking-widest sm:text-xs" style={{ color: CREAM }}>
            THE DIFFERENCE
          </p>
          <h2 className="font-display mt-4 text-2xl font-normal sm:text-3xl md:text-4xl">
            <WordsPullUpMultiStyle
              segments={[
                { text: "Same hour of studying.", className: "text-[#E1E0CC]" },
                { text: "Very different result.", className: "text-gray-500" },
              ]}
            />
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#101010] p-6 sm:p-8">
            <p className="font-display mb-5 text-sm text-gray-500">The old way</p>
            <ul className="space-y-3.5">
              {oldWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/5">
                    <X className="size-3 text-gray-500" />
                  </span>
                  <span className="font-display text-xs text-gray-500 sm:text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{ borderColor: "rgba(225,224,204,0.25)", backgroundColor: "#141310" }}
          >
            <p className="font-display mb-5 flex items-center gap-2 text-sm" style={{ color: CREAM }}>
              <RepeatIcon className="size-4" /> The StudyLoop way
            </p>
            <ul className="space-y-3.5">
              {loopWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(225,224,204,0.15)" }}
                  >
                    <Check className="size-3" style={{ color: CREAM }} />
                  </span>
                  <span className="font-display text-xs sm:text-sm" style={{ color: "#DEDBC8" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tech stack strip                                                    */
/* ------------------------------------------------------------------ */

const techStack = [
  { icon: Zap, label: "Groq · Llama 3.3 70B", role: "Agent reasoning" },
  { icon: Database, label: "Convex", role: "Real-time database" },
  { icon: RepeatIcon, label: "Lemma", role: "Pod data layer" },
  { icon: Sparkles, label: "Next.js 16", role: "App runtime" },
];

function TechStack() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-black px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 text-center font-display text-[10px] uppercase tracking-widest text-gray-500">
          Built on
        </p>
        <div ref={ref} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {techStack.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#101010] px-4 py-3.5"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <s.icon className="size-4" style={{ color: CREAM }} />
              </div>
              <div className="min-w-0">
                <div className="font-display truncate text-xs font-medium text-white sm:text-sm">
                  {s.label}
                </div>
                <div className="font-display text-[10px] text-gray-500">{s.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    q: "Do I need an account?",
    a: "Yes — sign in with Google or an email in seconds. Your sessions, quiz history, and weak spots are saved to your account so you can pick the loop back up on any device.",
  },
  {
    q: "What can I feed it?",
    a: "Any text-based lecture PDF, or just paste raw notes. Slides, textbook chapters, your own scribbles — the agent pulls out the topics regardless of how messy they are.",
  },
  {
    q: "How does it find my weak spots?",
    a: "It scores every question by topic and tracks your mastery across rounds. Any topic under 80% is flagged as weak, and each re-test focuses only on those — a little harder every time.",
  },
  {
    q: "Is my progress really saved?",
    a: "Yes. Every session and round is stored in a real-time database keyed to your account, so nothing is lost when you close the tab.",
  },
  {
    q: "How much does it cost?",
    a: "It's free. Bring your notes and start looping.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-black px-4 py-20 sm:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="font-display text-[10px] tracking-widest sm:text-xs" style={{ color: CREAM }}>
            QUESTIONS
          </p>
          <h2
            className="font-display mt-4 whitespace-nowrap text-2xl font-normal sm:text-3xl md:text-4xl"
            style={{ color: CREAM }}
          >
            Good to know
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-white/5 bg-[#101010]"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span
                    className="font-display text-sm font-medium sm:text-base"
                    style={{ color: CREAM }}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-gray-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="font-display px-5 pb-5 text-xs leading-relaxed text-gray-400 sm:px-6 sm:pb-6 sm:text-sm">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Landing() {
  return (
    <main className="flex-1 bg-black">
      <Hero />
      <HowItWorks />
      <MockupSection />
      <CoreFeatures />
      <About />
      <Comparison />
      <Features />
      <TechStack />
      <FAQ />
      <Footer />
    </main>
  );
}
