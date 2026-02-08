"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { REQUEST } from "@/routes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BasicQuizPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [config, setConfig] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const raw = params.get("config");
    if (!raw) {
      router.push("/quiz");
      return;
    }
    const parsed = JSON.parse(decodeURIComponent(raw));
    setConfig(parsed);
    generateQuiz(parsed);
  }, []);

  const generateQuiz = async (cfg: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await REQUEST("POST", "chat/create-quiz/", cfg);
      setQuestions(res.questions || []);
    } catch (err: any) {
      setError(err?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const current = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSelect = (val: any) => {
    if (submitted) return;
    setSelectedAnswers((p) => ({ ...p, [currentIndex]: val }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    // optional: send to backend for grading
    try {
      await REQUEST("POST", "chat/grade-quiz/", { questions, answers: selectedAnswers, config });
      // show graded result (not implemented: depends on your backend)
    } catch {
      // ignore for now
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-3xl">
        {questions.length === 0 ? (
          <Card className="p-8 text-center">No questions returned.</Card>
        ) : (
          <Card className="p-6">
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
              <span>{config.topic || "Topic"}</span>
              <span>Question {currentIndex + 1} / {questions.length}</span>
            </div>

            <Progress value={progress} className="mb-4" />

            <h2 className="text-xl font-semibold mb-4">{current.question}</h2>

            {/* MCQ options */}
            {Array.isArray(current.options) ? (
              <div className="grid gap-3">
                {current.options.map((opt: string, idx: number) => {
                  const selected = selectedAnswers[currentIndex] === idx;
                  const showCorrect = submitted && current.answer !== undefined;
                  const isCorrect = showCorrect && current.answer === idx;
                  const isWrong = showCorrect && selected && current.answer !== idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={submitted}
                      className={cn(
                        "p-4 rounded-xl text-left border transition",
                        selected ? "border-primary bg-primary/5" : "border-transparent",
                        isCorrect && "border-green-500 bg-green-500/10 text-green-400",
                        isWrong && "border-red-500 bg-red-500/10 text-red-400"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span>{opt}</span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // non-MCQ, allow free text
              <Input value={selectedAnswers[currentIndex] || ""} onChange={(e) => handleSelect(e.target.value)} />
            )}

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))} disabled={currentIndex === 0}>
                <ChevronLeft /> Prev
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentIndex((p) => p + 1)} disabled={selectedAnswers[currentIndex] === undefined}>
                  Next <ChevronRight />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitted || selectedAnswers[currentIndex] === undefined}>
                  {submitted ? "Submitted" : "Finish & Submit"}
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
