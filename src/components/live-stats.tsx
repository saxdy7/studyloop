"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function LiveStats() {
  const stats = useQuery(api.study.stats);

  const items = [
    { label: "Study sessions", value: stats?.sessions },
    { label: "Quiz rounds run", value: stats?.rounds },
    { label: "Questions answered", value: stats?.questionsAnswered },
  ];

  return (
    <div className="grid w-full max-w-xl grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border bg-card/60 px-4 py-3 text-center backdrop-blur"
        >
          <div className="text-2xl font-bold tabular-nums">
            {item.value === undefined ? "–" : item.value.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
