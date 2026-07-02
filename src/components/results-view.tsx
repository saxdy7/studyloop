"use client";

import { Loader2, RotateCcw, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@/lib/types";
import { computeTopicStats, scoreRound } from "@/lib/study";

export function ResultsView({
  session,
  onRetest,
  onReset,
  retesting,
}: {
  session: Session;
  onRetest: (weakTopics: string[]) => void;
  onReset: () => void;
  retesting: boolean;
}) {
  const lastRound = session.rounds[session.rounds.length - 1];
  const { correct, total } = scoreRound(lastRound.questions, lastRound.answers);
  const pct = Math.round((correct / total) * 100);

  const stats = computeTopicStats(session.topics, session.rounds);
  const weak = stats.filter((s) => s.weak);
  const mastered = stats.filter((s) => !s.weak);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            Round {lastRound.round} · {correct}/{total} correct ({pct}%)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Topic mastery (across all {session.rounds.length} round
              {session.rounds.length > 1 ? "s" : ""})
            </p>
            <div className="space-y-3">
              {stats.map((s) => (
                <div key={s.topicId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {s.name}
                      {s.weak ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Needs work
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600 text-[10px] hover:bg-green-600">
                          Mastered
                        </Badge>
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      {s.correct}/{s.total}
                    </span>
                  </div>
                  <Progress value={s.mastery * 100} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1"
          onClick={() => onRetest(weak.map((w) => w.name))}
          disabled={weak.length === 0 || retesting}
        >
          {retesting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Building a sharper re-test…
            </>
          ) : weak.length === 0 ? (
            <>
              <Trophy className="size-4" /> All topics mastered 🎉
            </>
          ) : (
            <>
              <Target className="size-4" /> Re-test {weak.length} weak spot
              {weak.length > 1 ? "s" : ""}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={retesting}>
          <RotateCcw className="size-4" /> New material
        </Button>
      </div>

      {weak.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Re-test focuses only on: {weak.map((w) => w.name).join(", ")}
        </p>
      )}
      {mastered.length > 0 && weak.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Already solid: {mastered.map((m) => m.name).join(", ")}
        </p>
      )}
    </div>
  );
}
