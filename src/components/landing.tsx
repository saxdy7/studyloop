"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Database,
  FileUp,
  ListChecks,
  Repeat2,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LiveStats } from "@/components/live-stats";
import { cn } from "@/lib/utils";

/* ---------- Floating gradient shapes (hero backdrop) ---------- */

function FloatingShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-primary/15",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -120, rotate: rotate - 12 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.2,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.1 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r to-transparent",
            gradient,
            "border border-white/10 backdrop-blur-[2px]",
            "shadow-[0_8px_32px_0_oklch(0.55_0.22_290_/_12%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

/* ---------- Scroll reveal wrapper ---------- */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Product preview card ---------- */

function ProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="float-slow">
        <Card className="border-primary/20 bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Photosynthesis</Badge>
              <span className="text-xs text-muted-foreground">
                Round 2 · Q3 of 6
              </span>
            </div>
            <p className="text-sm font-medium leading-snug">
              Where do the light-dependent reactions take place?
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-xs">
                <span>Thylakoid membranes</span>
                <Check className="size-3.5 text-green-500" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs opacity-80">
                <span>Stroma</span>
                <X className="size-3.5 text-red-500" />
              </div>
              <div className="rounded-lg border px-3 py-2 text-xs opacity-50">
                Mitochondrial matrix
              </div>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/40 p-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  Calvin cycle
                  <Badge
                    variant="destructive"
                    className="px-1.5 py-0 text-[9px]"
                  >
                    Needs work
                  </Badge>
                </span>
                <span className="text-muted-foreground">2/5</span>
              </div>
              <Progress value={40} />
              <div className="flex items-center justify-between text-[11px]">
                <span>Light reactions</span>
                <span className="text-muted-foreground">4/4</span>
              </div>
              <Progress value={100} />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

/* ---------- Subject marquee ---------- */

const subjects = [
  "Organic Chemistry",
  "Data Structures",
  "Microeconomics",
  "Human Anatomy",
  "Operating Systems",
  "Constitutional Law",
  "Thermodynamics",
  "Machine Learning",
  "Cell Biology",
  "Linear Algebra",
  "World History",
  "Pharmacology",
];

function SubjectMarquee() {
  const row = [...subjects, ...subjects];
  return (
    <div className="marquee-mask relative w-full overflow-hidden py-2">
      <div className="marquee-track flex w-max gap-3">
        {row.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="whitespace-nowrap rounded-full border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Page data ---------- */

const steps = [
  {
    icon: FileUp,
    title: "Drop your messy notes",
    text: "Upload a lecture PDF or paste raw notes — no formatting, no cleanup.",
  },
  {
    icon: BrainCircuit,
    title: "Get a plan + quiz",
    text: "The agent extracts key topics and writes questions that test understanding, not recall.",
  },
  {
    icon: Target,
    title: "It hunts your weak spots",
    text: "Every answer is tracked per topic. Below 80% mastery? Flagged and remembered.",
  },
  {
    icon: Repeat2,
    title: "Re-test until it sticks",
    text: "One click builds a harder round focused only on what you got wrong.",
  },
];

const features = [
  {
    icon: ListChecks,
    title: "Not another quiz generator",
    text: "Generic tools quiz you once and forget. StudyLoop remembers every mistake across rounds and closes the loop.",
  },
  {
    icon: TrendingUp,
    title: "Mastery you can see",
    text: "Per-topic progress bars build up round after round — you always know exactly what still needs work.",
  },
  {
    icon: Database,
    title: "Progress that persists",
    text: "Every session and round is stored in a real-time database. Close the tab, come back tomorrow — the loop remembers.",
  },
];

const stack = [
  { icon: Zap, label: "Groq · Llama 3.3 70B", role: "agent reasoning" },
  { icon: Database, label: "Convex", role: "real-time database" },
  { icon: Repeat2, label: "Lemma", role: "pod data layer" },
  { icon: Sparkles, label: "Next.js 16", role: "app runtime" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.15, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

/* ---------- Landing ---------- */

export function Landing() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="hero-glow" />
      <div className="grid-bg absolute inset-x-0 top-0 h-[640px]" />

      {/* Floating shapes */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden">
        <FloatingShape
          delay={0.3}
          width={520}
          height={120}
          rotate={12}
          gradient="from-primary/20"
          className="left-[-8%] top-[16%]"
        />
        <FloatingShape
          delay={0.5}
          width={420}
          height={100}
          rotate={-14}
          gradient="from-cyan-500/15"
          className="right-[-4%] top-[62%]"
        />
        <FloatingShape
          delay={0.6}
          width={220}
          height={60}
          rotate={18}
          gradient="from-fuchsia-500/15"
          className="right-[12%] top-[8%]"
        />
        <FloatingShape
          delay={0.7}
          width={160}
          height={44}
          rotate={-22}
          gradient="from-violet-400/15"
          className="left-[16%] top-[70%]"
        />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5"
      >
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
            <Repeat2 className="size-4 text-primary" />
          </div>
          StudyLoop
        </div>
        <Button asChild size="sm">
          <Link href="/study">
            Start studying <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Badge variant="secondary" className="gap-1.5 border-primary/20">
              <Sparkles className="size-3.5 text-primary" />
              Agentic study coach — Ship to Get Hired 2026
            </Badge>
          </motion.div>
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              Stop re-reading.
            </span>
            <br />
            <span className="gradient-text">Start re-testing.</span>
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-lg text-balance text-muted-foreground"
          >
            StudyLoop turns messy lecture notes into a personalized quiz,
            tracks exactly which topics you get wrong, and keeps re-testing
            them — harder each round — until you actually know the material.
          </motion.p>
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="group shadow-lg shadow-primary/25">
              <Link href="/study">
                Upload your notes
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#how-it-works">See the loop</Link>
            </Button>
          </motion.div>
          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-xs text-muted-foreground"
          >
            Free · no account needed · works with any lecture PDF
          </motion.p>
        </div>
        <ProductPreview />
      </section>

      {/* Subject marquee */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-14">
        <Reveal>
          <p className="mb-3 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
            Works with any subject
          </p>
          <SubjectMarquee />
        </Reveal>
      </section>

      {/* Live stats */}
      <section className="relative z-10 mx-auto flex w-full max-w-6xl justify-center px-6 pb-20">
        <Reveal className="flex w-full justify-center">
          <LiveStats />
        </Reveal>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mb-12 text-center">
          <Badge variant="secondary" className="mb-3">How it works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The loop that makes it stick
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Four steps, fully automatic — you just answer questions.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <Card className="card-hover relative h-full bg-card/60">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                      <step.icon className="size-5 text-primary" />
                    </div>
                    <span className="text-4xl font-bold text-primary/15">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mb-12 text-center">
          <Badge variant="secondary" className="mb-3">Why StudyLoop</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built to close the loop, not just open it
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.12}>
              <Card className="card-hover h-full bg-card/60">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                    <f.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.text}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stack strip */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10">
        <Reveal>
          <div className="grid gap-3 rounded-2xl border bg-card/40 p-6 backdrop-blur sm:grid-cols-4">
            {stack.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <s.icon className="size-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 py-24">
        <Reveal>
          <Card className="border-primary/25 bg-gradient-to-b from-primary/10 to-transparent">
            <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Your next exam won&apos;t study for itself.
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Paste today&apos;s lecture notes and find your weak spots in
                under a minute.
              </p>
              <Button asChild size="lg" className="group shadow-lg shadow-primary/25">
                <Link href="/study">
                  Start the loop
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Repeat2 className="size-3.5" /> StudyLoop
          </span>
          <span>Built for the Gappy AI &ldquo;Ship to Get Hired&rdquo; hackathon</span>
        </div>
      </footer>
    </main>
  );
}
