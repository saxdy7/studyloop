"use client";

import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnswerMap, Question, Topic } from "@/lib/types";

export function QuizRunner({
  questions,
  topics,
  heading,
  onComplete,
}: {
  questions: Question[];
  topics: Topic[];
  heading: string;
  onComplete: (answers: AnswerMap) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [revealed, setRevealed] = useState(false);

  const q = questions[index];
  const topicName = topics.find((t) => t.id === q.topicId)?.name ?? "General";
  const selected = answers[q.id];
  const isLast = index === questions.length - 1;
  const progress = (index / questions.length) * 100;

  function pick(i: number) {
    if (revealed) return;
    setAnswers((a) => ({ ...a, [q.id]: i }));
    setRevealed(true);
  }

  function next() {
    if (isLast) {
      onComplete(answers);
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{heading}</span>
          <span>
            Question {index + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            {topicName}
          </Badge>
          <CardTitle className="text-lg leading-snug">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answerIndex;
              const isPicked = i === selected;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={revealed}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    !revealed && "hover:bg-accent",
                    revealed && isCorrect && "border-green-500/50 bg-green-500/10",
                    revealed &&
                      isPicked &&
                      !isCorrect &&
                      "border-red-500/50 bg-red-500/10",
                    revealed && !isCorrect && !isPicked && "opacity-60"
                  )}
                >
                  <span>{opt}</span>
                  {revealed && isCorrect && (
                    <Check className="size-4 shrink-0 text-green-500" />
                  )}
                  {revealed && isPicked && !isCorrect && (
                    <X className="size-4 shrink-0 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {q.explanation}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={next} disabled={!revealed}>
              {isLast ? "See results" : "Next"} <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
