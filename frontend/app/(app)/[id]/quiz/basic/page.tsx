"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { REQUEST } from "@/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BasicQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizConfig {
  type: string;
  topic?: string;
  num_questions: number;
  difficulty?: string;
  time_limit?: number | null;
  sources?: {
    folders: string[];
    files: string[];
  };
}

export default function BasicQuizPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<BasicQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const raw = params.get("config");
    if (!raw) {
      router.push("/quiz");
      return;
    }
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      setConfig(parsed);
      generateQuiz(parsed);
    } catch (err) {
      setError("Invalid configuration");
      setLoading(false);
    }
  }, [params, router]);

  const generateQuiz = async (cfg: QuizConfig) => {
    setLoading(true);
    setError(null);
    try {
      const res = await REQUEST("POST", "chat/generate_quiz/", cfg);
      setQuestions(res.questions || []);
    } catch (err: any) {
      setError(err?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const toggleReveal = () => {
    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(currentIndex)) {
      newRevealed.delete(currentIndex);
    } else {
      newRevealed.add(currentIndex);
    }
    setRevealedAnswers(newRevealed);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    
    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selectedOption = selectedAnswers[idx];
      if (selectedOption !== undefined && q.options[selectedOption] === q.answer) {
        correctCount++;
      }
    });

    // Subtract 1 point for each revealed answer
    const penalty = revealedAnswers.size;
    const finalScore = Math.max(0, correctCount - penalty);
    setScore(finalScore);
  };

  const current = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isRevealed = revealedAnswers.has(currentIndex);
  const correctAnswerIndex = current?.options.findIndex((opt) => opt === current.answer);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Generating your quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (submitted && score !== null) {
    const totalQuestions = questions.length;
    const percentage = (score / totalQuestions) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-primary">
                {score}/{totalQuestions}
              </div>
              <div className="text-2xl text-muted-foreground">
                {percentage.toFixed(0)}% Correct
              </div>
              {revealedAnswers.size > 0 && (
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {revealedAnswers.size} answer{revealedAnswers.size !== 1 ? 's' : ''} revealed (-{revealedAnswers.size} point{revealedAnswers.size !== 1 ? 's' : ''})
                </Badge>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => router.push("/quiz")} className="flex-1" size="lg">
                Create New Quiz
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" size="lg">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{config?.topic || "Quiz"}</h1>
              <p className="text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
            {config?.difficulty && (
              <Badge variant="outline" className="capitalize">
                {config.difficulty}
              </Badge>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        {current && (
          <Card className="mb-6 border-2">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-xl leading-relaxed flex-1">
                  {current.question}
                </CardTitle>
                <Button
                  variant={isRevealed ? "secondary" : "outline"}
                  size="sm"
                  onClick={toggleReveal}
                  disabled={submitted}
                  className="shrink-0"
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Reveal
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {current.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentIndex] === idx;
                const isCorrectAnswer = idx === correctAnswerIndex;
                const showCorrect = submitted || isRevealed;
                const isWrong = submitted && isSelected && !isCorrectAnswer;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={submitted}
                    className={cn(
                      "w-full p-4 rounded-lg text-left border-2 transition-all duration-200",
                      "hover:border-primary/50 disabled:cursor-not-allowed",
                      isSelected && !submitted && "border-primary bg-primary/5",
                      showCorrect && isCorrectAnswer && "border-green-500 bg-green-500/10",
                      isWrong && "border-red-500 bg-red-500/10"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "flex-1",
                        showCorrect && isCorrectAnswer && "text-green-700 dark:text-green-400 font-medium",
                        isWrong && "text-red-700 dark:text-red-400"
                      )}>
                        {option}
                      </span>
                      {showCorrect && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-2" />
                      )}
                      {isWrong && (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
            size="lg"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {Object.keys(selectedAnswers).length} / {questions.length} answered
          </div>

          {currentIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex((p) => p + 1)}
              size="lg"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitted || Object.keys(selectedAnswers).length < questions.length}
              size="lg"
              className="min-w-32"
            >
              {submitted ? "Submitted" : "Submit Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}