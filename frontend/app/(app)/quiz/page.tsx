"use client";

import { useState } from "react";
import { REQUEST } from "@/routes";
import { QuizQuestion } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Sparkles, BrainCircuit } from "lucide-react";

export default function UnifiedQuiz() {
  // --- State ---
  const [topic, setTopic] = useState("");
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  // --- Logic ---
  const fetchQuiz = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setQuizData([]);
    setSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestion(0);

    try {
      const data = await REQUEST("POST", "chat/generate_quiz/", { topic });
      const quizzes = data.quizzes;   
      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        throw new Error("The AI returned an empty quiz. Try a different topic!");
      }

      setQuizData(quizzes);
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Blame the interstellar particles.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion]: option }));
  };

  const current = quizData[currentQuestion];
  const progress = quizData.length > 0 ? ((currentQuestion + 1) / quizData.length) * 100 : 0;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center p-6 text-foreground">

      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <div className={cn(
          "absolute inset-0 bg-size-[40px_40px]opacity-30",
          "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"
        )} />
        <div className="absolute inset-0 bg-linear-to-tr from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-600/10" />
      </div>

      <div className="w-full max-w-2xl z-10 space-y-8">
        {/* Header Section */}
        {!quizData.length && !loading && (
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">What do you want to master today?</h1>
            <p className="text-muted-foreground text-lg">Enter a topic and let AI craft a custom assessment for you.</p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Input
                placeholder="e.g. Quantum Physics, React Hooks, or Roman History..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-12 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-muted-foreground/20 focus-visible:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && fetchQuiz()}
              />
              <Button onClick={fetchQuiz} size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Quiz"}
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center py-20 space-y-6 animate-pulse">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-ping" />
              <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-medium italic">"Consulting the digital oracles..."</h3>
              <p className="text-sm text-muted-foreground">Architecting your {topic} quiz now.</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 backdrop-blur-md">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={() => setError(null)}>Dismiss</Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Quiz Interface */}
        {quizData.length > 0 && !loading && (
          <Card className="border-none bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-500">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                <span>{topic} Assessment</span>
                <span>Question {currentQuestion + 1} / {quizData.length}</span>
              </div>
              <Progress value={progress} className="h-1.5 mt-4 transition-all duration-500" />
              <CardTitle className="text-2xl mt-6 font-semibold leading-tight">{current.question}</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3 pt-4">
              {current.options.map((option) => {
                const isSelected = selectedAnswers[currentQuestion] === option;
                const isCorrect = submitted && option === current.answer;
                const isWrong = submitted && isSelected && option !== current.answer;

                return (
                  <button
                    key={option}
                    disabled={submitted}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "group w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                      "hover:bg-primary/5 active:scale-[0.98]",
                      isSelected ? "border-primary bg-primary/5 shadow-inner" : "border-transparent bg-secondary/50",
                      isCorrect && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
                      isWrong && "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">{option}</span>
                      {isCorrect && <CheckCircle2 className="w-5 h-5 animate-in zoom-in" />}
                    </div>
                  </button>
                );
              })}
            </CardContent>

            <CardFooter className="flex justify-between items-center border-t border-border/50 pt-6 mt-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestion((p) => p - 1)}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion < quizData.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestion((p) => p + 1)}
                    disabled={!selectedAnswers[currentQuestion]}
                    className="gap-2 shadow-md"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant={submitted ? "secondary" : "default"}
                    onClick={() => setSubmitted(true)}
                    disabled={submitted || !selectedAnswers[currentQuestion]}
                    className={cn("gap-2", !submitted && "bg-green-600 hover:bg-green-700")}
                  >
                    {submitted ? "Well Done!" : <><Sparkles className="w-4 h-4" /> Finish Quiz</>}
                  </Button>
                )}
                {submitted && (
                  <Button variant="outline" onClick={() => setQuizData([])}>
                    New Topic
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}