"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { REQUEST } from "@/routes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdvancedQuizPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [config, setConfig] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const raw = params.get("config");
    if (!raw) {
      router.push("/quiz");
      return;
    }
    const parsed = JSON.parse(decodeURIComponent(raw));
    setConfig(parsed);
    loadQuiz(parsed);
  }, []);

  const loadQuiz = async (cfg: any) => {
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

  const setAnswer = (qid: string | number, value: any) => {
    setAnswers((p) => ({ ...p, [qid]: value }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      await REQUEST("POST", "chat/grade-quiz/", { questions, answers, config });
      // expecting backend returns scores/feedback — adapt to your API
    } catch (e) {
      // ignore for now
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;

  const current = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-4xl">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
            <span>{config.topic || "Advanced Quiz"}</span>
            <span>Question {currentIndex + 1} / {questions.length}</span>
          </div>

          <Progress value={progress} className="mb-4" />

          <h3 className="text-xl font-semibold mb-4">{current.question}</h3>

          {/* Render by type */}
          {current.type === "mcq" && Array.isArray(current.options) && (
            <div className="grid gap-3">
              {current.options.map((opt: string, idx: number) => {
                const selected = answers[current.id] === idx;
                const showCorrect = submitted && current.answer !== undefined;
                const isCorrect = showCorrect && current.answer === idx;
                const isWrong = showCorrect && selected && current.answer !== idx;
                return (
                  <button key={idx} onClick={() => setAnswer(current.id, idx)} disabled={submitted}
                          className={cn("p-3 rounded-lg text-left border transition", selected ? "border-primary bg-primary/5" : "border-transparent", isCorrect && "border-green-500 bg-green-500/10", isWrong && "border-red-500 bg-red-500/10")}>
                    <div className="flex justify-between items-center">
                      <span>{opt}</span>
                      {isCorrect && <span className="text-green-500 font-bold">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {(current.type === "fill_blank" || current.type === "short") && (
            <Input placeholder="Your answer..." value={answers[current.id] || ""} onChange={(e) => setAnswer(current.id, e.target.value)} disabled={submitted} />
          )}

          {current.type === "long" && (
            <Textarea placeholder="Write your answer..." value={answers[current.id] || ""} onChange={(e) => setAnswer(current.id, e.target.value)} disabled={submitted} className="min-h-[200px]" />
          )}

          {/* show rubric (if present) */}
          {current.rubric && Array.isArray(current.rubric) && (
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Rubric:</strong>
              <ul className="list-disc ml-5">
                {current.rubric.map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))} disabled={currentIndex === 0}>Previous</Button>

            {currentIndex < questions.length - 1 ? (
              <Button onClick={() => setCurrentIndex((p) => p + 1)} disabled={answers[current.id] === undefined}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitted}>Submit & Grade</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
