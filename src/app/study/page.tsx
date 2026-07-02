import { Suspense } from "react";
import { StudyApp } from "@/components/study-app";

export default function StudyPage() {
  return (
    <main className="flex-1">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading StudyLoop…
        </div>
      }>
        <StudyApp />
      </Suspense>
    </main>
  );
}
