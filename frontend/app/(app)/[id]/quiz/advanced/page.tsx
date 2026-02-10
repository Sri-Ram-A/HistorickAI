"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { REQUEST } from "@/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionType = "mcq" | "fill_blank" | "short" | "long";

interface BaseQuestion {
    id: string;
    type: QuestionType;
    question: string;
    marks: number;
    difficulty: "easy" | "medium" | "hard";
    blooms: string;
    explanation?: string;
    source: string;
}

interface MCQ extends BaseQuestion {
    type: "mcq";
    options: string[];
    answer: number;
}

interface FillBlank extends BaseQuestion {
    type: "fill_blank";
    answer: string;
}

interface ShortAnswer extends BaseQuestion {
    type: "short";
    answer: string;
    keywords: string[];
}

interface LongAnswer extends BaseQuestion {
    type: "long";
    rubric: string[];
    answer: string;
}

type Question = MCQ | FillBlank | ShortAnswer | LongAnswer;

interface QuizConfig {
    type: string;
    topic?: string;
    num_questions: number;
    difficulty?: string;
    time_limit?: number | null;
    blooms?: string[];
    sources?: {
        folders: string[];
        files: string[];
    };
}

interface QuestionFeedback {
    question_id: string;
    marks_obtained: number;
    max_marks: number;
    feedback: string;
    correct?: boolean | null;
}

interface EvaluationResult {
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    feedback: QuestionFeedback[];
}

export default function AdvancedQuizPage() {
    const params = useSearchParams();
    const router = useRouter();

    const [config, setConfig] = useState<QuizConfig | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    useEffect(() => {
        const raw = params.get("config");
        if (!raw) {
            router.push("/quiz");
            return;
        }
        try {
            const parsed = JSON.parse(decodeURIComponent(raw));
            setConfig(parsed);
            if (parsed.time_limit) {
                setTimeRemaining(parsed.time_limit * 60);
            }
            generateQuiz(parsed);
        } catch (err) {
            setError("Invalid configuration");
            setLoading(false);
        }
    }, [params, router]);

    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0 || submitted) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, submitted]);

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

    const setAnswer = (qid: string, value: any) => {
        setAnswers((prev) => ({ ...prev, [qid]: value }));
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setEvaluating(true);

        try {
            const result = await REQUEST("POST", "chat/evaluate_answers/", {
                questions,
                answers,
                config,
            });
            setEvaluationResult(result);
        } catch (err: any) {
            setError(err?.message || "Failed to evaluate answers");
        } finally {
            setEvaluating(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    const getFeedbackForQuestion = (questionId: string) => {
        return evaluationResult?.feedback.find((f) => f.question_id === questionId);
    };

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Generating your assessment...</p>
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

    // Results View
    if (submitted && evaluationResult && !evaluating) {
        const percentage = evaluationResult.percentage;
        const grade = percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : percentage >= 60 ? "D" : "F";

        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
                <div className="container mx-auto max-w-5xl">
                    {/* Results Summary */}
                    <Card className="mb-8 border-2">
                        <CardHeader>
                            <CardTitle className="text-3xl text-center">Assessment Complete!</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-5xl font-bold text-primary mb-2">{grade}</div>
                                    <div className="text-sm text-muted-foreground">Grade</div>
                                </div>
                                <div>
                                    <div className="text-5xl font-bold mb-2">
                                        {evaluationResult.obtained_marks}/{evaluationResult.total_marks}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Marks</div>
                                </div>
                                <div>
                                    <div className="text-5xl font-bold mb-2">{percentage.toFixed(1)}%</div>
                                    <div className="text-sm text-muted-foreground">Percentage</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Feedback */}
                    <div className="space-y-6 mb-8">
                        {questions.map((question, index) => {
                            const feedback = getFeedbackForQuestion(question.id);
                            if (!feedback) return null;

                            const marksPercentage = (feedback.marks_obtained / feedback.max_marks) * 100;
                            const performanceColor = marksPercentage >= 70 ? "text-green-600 dark:text-green-400" : marksPercentage >= 40 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";

                            return (
                                <Card key={question.id} className="border-2">
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-2">
                                                    <span className="font-bold text-lg shrink-0">Q{index + 1}.</span>
                                                    <p className="text-lg leading-relaxed">{question.question}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn("text-sm font-semibold", performanceColor)}>
                                                    {feedback.marks_obtained}/{feedback.max_marks}
                                                </Badge>
                                                {feedback.correct === true && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                {feedback.correct === false && <XCircle className="w-5 h-5 text-red-500" />}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Student's Answer */}
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Your Answer:</p>
                                            {question.type === "mcq" && (
                                                <p className="text-base">
                                                    {question.options[answers[question.id]] || "No answer provided"}
                                                </p>
                                            )}
                                            {question.type !== "mcq" && (
                                                <p className="text-base whitespace-pre-wrap">
                                                    {answers[question.id] || "No answer provided"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Correct Answer (for objective questions) */}
                                        {(question.type === "mcq" || question.type === "fill_blank") && (
                                            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                                                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                                                    Correct Answer:
                                                </p>
                                                <p className="text-base text-green-800 dark:text-green-200">
                                                    {question.type === "mcq" ? question.options[question.answer] : question.answer}
                                                </p>
                                            </div>
                                        )}

                                        {/* Model Answer (for subjective questions) */}
                                        {(question.type === "short" || question.type === "long") && (
                                            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                                    Model Answer:
                                                </p>
                                                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                                                    {question.answer}
                                                </p>
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                            <div className="flex items-start gap-2 mb-2">
                                                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <p className="text-sm font-medium">Feedback:</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap ml-7">
                                                {feedback.feedback}
                                            </p>
                                        </div>

                                        {/* Explanation (if available) */}
                                        {question.explanation && (
                                            <div className="border-t pt-4">
                                                <p className="text-sm font-medium mb-2">Explanation:</p>
                                                <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => router.push("/quiz")} size="lg" className="min-w-40">
                            Create New Quiz
                        </Button>
                        <Button onClick={() => window.location.reload()} variant="outline" size="lg">
                            Retry Assessment
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Taking View
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Exam Header */}
                <Card className="mb-8 border-2">
                    <CardHeader>
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl mb-2">
                                        {config?.topic || "Assessment"}
                                    </CardTitle>
                                    <p className="text-muted-foreground">
                                        Total Marks: <span className="font-semibold">{totalMarks}</span>
                                    </p>
                                </div>
                                {timeRemaining !== null && (
                                    <div className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2",
                                        timeRemaining < 300 ? "border-red-500 bg-red-50 dark:bg-red-950" : "border-primary bg-primary/5"
                                    )}>
                                        <Clock className={cn(
                                            "w-5 h-5",
                                            timeRemaining < 300 ? "text-red-500" : "text-primary"
                                        )} />
                                        <span className={cn(
                                            "font-mono text-lg font-semibold",
                                            timeRemaining < 300 ? "text-red-600 dark:text-red-400" : ""
                                        )}>
                                            {formatTime(timeRemaining)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {config?.difficulty && (
                                    <Badge variant="outline" className="capitalize">
                                        {config.difficulty}
                                    </Badge>
                                )}
                                <Badge variant="secondary">
                                    {questions.length} Questions
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Questions */}
                <div className="space-y-8 mb-8">
                    {questions.map((question, index) => (
                        <Card key={question.id} className="border-2">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-2">
                                            <span className="font-bold text-lg shrink-0">Q{index + 1}.</span>
                                            <p className="text-lg leading-relaxed">{question.question}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <Badge variant="outline" className="text-xs">
                                                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {question.difficulty}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs capitalize">
                                                {question.blooms}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* MCQ */}
                                {question.type === "mcq" && (
                                    <div className="space-y-2">
                                        {question.options.map((option, idx) => {
                                            const isSelected = answers[question.id] === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setAnswer(question.id, idx)}
                                                    disabled={submitted}
                                                    className={cn(
                                                        "w-full p-3 rounded-lg text-left border-2 transition-all",
                                                        "hover:border-primary/50 disabled:cursor-not-allowed",
                                                        isSelected && "border-primary bg-primary/5"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-muted-foreground">
                                                            {String.fromCharCode(65 + idx)}.
                                                        </span>
                                                        <span>{option}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Fill in the Blank */}
                                {question.type === "fill_blank" && (
                                    <div>
                                        <Input
                                            placeholder="Type your answer..."
                                            value={answers[question.id] || ""}
                                            onChange={(e) => setAnswer(question.id, e.target.value)}
                                            disabled={submitted}
                                            className="text-base"
                                        />
                                    </div>
                                )}

                                {/* Short Answer */}
                                {question.type === "short" && (
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="answer" className="border rounded-lg px-4">
                                            <AccordionTrigger className="hover:no-underline">
                                                <span className="text-sm font-medium">
                                                    {answers[question.id] ? "Edit your answer" : "Write your answer"}
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <Textarea
                                                    placeholder="Write a concise answer (2-3 sentences)..."
                                                    value={answers[question.id] || ""}
                                                    onChange={(e) => setAnswer(question.id, e.target.value)}
                                                    disabled={submitted}
                                                    className="min-h-24 mt-2"
                                                />
                                                {question.keywords && question.keywords.length > 0 && (
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        <span className="font-medium">Key concepts:</span>{" "}
                                                        {question.keywords.join(", ")}
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                )}

                                {/* Long Answer */}
                                {question.type === "long" && (
                                    <div className="space-y-3">
                                        {question.rubric && question.rubric.length > 0 && (
                                            <div className="bg-muted/50 p-4 rounded-lg">
                                                <p className="font-medium text-sm mb-2">Marking Rubric:</p>
                                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                    {question.rubric.map((item, idx) => (
                                                        <li key={idx}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="answer" className="border rounded-lg px-4">
                                                <AccordionTrigger className="hover:no-underline">
                                                    <span className="text-sm font-medium">
                                                        {answers[question.id] ? "Edit your answer" : "Write your answer"}
                                                    </span>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <Textarea
                                                        placeholder="Write a detailed answer with proper explanations and examples..."
                                                        value={answers[question.id] || ""}
                                                        onChange={(e) => setAnswer(question.id, e.target.value)}
                                                        disabled={submitted}
                                                        className="min-h-48 mt-2"
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                )}

                                {/* Source citation */}
                                {question.source && (
                                    <div className="text-xs text-muted-foreground pt-2 border-t">
                                        Source: {question.source}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Submit Section */}
                <Card className="sticky bottom-4 border-2 shadow-lg">
                    <CardContent className="py-4">
                        <div className="flex justify-between items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium">
                                    {Object.keys(answers).length} / {questions.length}
                                </span>{" "}
                                questions answered
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/quiz")}
                                    disabled={submitted}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitted || Object.keys(answers).length === 0 || evaluating}
                                    size="lg"
                                    className="min-w-40"
                                >
                                    {evaluating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Evaluating...
                                        </>
                                    ) : submitted ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Submitted
                                        </>
                                    ) : (
                                        "Submit & Evaluate"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Time's up overlay */}
                {timeRemaining === 0 && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <Card className="max-w-md">
                            <CardHeader>
                                <CardTitle>Time's Up!</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Your assessment has been automatically submitted for evaluation.
                                </p>
                                {evaluating && (
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Evaluating your answers...</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}