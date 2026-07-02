"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const pullUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function WordsPullUp({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap", className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i}
          variants={pullUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="whitespace-pre"
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

export type StyledSegment = { text: string; className?: string };

export function WordsPullUpMultiStyle({
  segments,
  className,
}: {
  segments: StyledSegment[];
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const words = segments.flatMap((seg) =>
    seg.text.split(" ").map((w) => ({ word: w, className: seg.className }))
  );

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap justify-center", className)}>
      {words.map((w, i) => (
        <motion.span
          key={`${w.word}-${i}`}
          custom={i}
          variants={pullUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className={cn("whitespace-pre", w.className)}
        >
          {w.word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
