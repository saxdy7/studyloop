"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function SourceInput({
  onGenerate,
  busy,
}: {
  onGenerate: (text: string, numQuestions: number) => void;
  busy: boolean;
}) {
  const [text, setText] = useState("");
  const [numQuestions, setNumQuestions] = useState(8);
  const [extracting, setExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setExtracting(true);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      setText(data.text);
      toast.success("PDF text extracted", { description: file.name });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read PDF");
      setFileName(null);
    } finally {
      setExtracting(false);
    }
  }

  const disabled = busy || extracting || text.trim().length < 40;

  return (
    <Card className="border-dashed">
      <CardContent className="space-y-4 pt-6">
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-6 py-8 text-center transition-colors hover:bg-muted/60"
        >
          {extracting ? (
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          ) : (
            <FileUp className="size-6 text-muted-foreground" />
          )}
          <p className="text-sm font-medium">
            {fileName ?? "Drop a lecture PDF or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            We extract the text — or just paste your notes below.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="…or paste your messy lecture notes here."
          className="min-h-40 resize-y"
        />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.trim().length} characters
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="num-questions" className="whitespace-nowrap text-xs text-muted-foreground">
                Questions:
              </label>
              <select
                id="num-questions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={5}>5</option>
                <option value={8}>8 (default)</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onGenerate(text, numQuestions)} disabled={disabled}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Building your study plan…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate {numQuestions} questions
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
