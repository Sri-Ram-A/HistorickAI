"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { useFolders } from "@/hooks/useFolders";

type QuizType = "basic" | "advanced" | "question-bank";

const BLOOMS_LEVELS = [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
];
const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;

const quizCards = [
  {
    type: "basic" as QuizType,
    title: "Basic Quiz",
    description: "Fast AI-generated multiple choice questions perfect for quick assessments and practice sessions",
    image: "/images/basic.png",
  },
  {
    type: "advanced" as QuizType,
    title: "Advanced Assessment",
    description: "Comprehensive mixed-format questions with detailed reasoning, rubrics, and higher-order thinking challenges",
    image: "/images/advanced.png",
  },
  {
    type: "question-bank" as QuizType,
    title: "Question Bank",
    description: "RAG-powered questions generated from your stored papers, documents, and custom knowledge sources",
    image: "/images/qbank.png",
  },
];

export default function QuizHome() {
  const router = useRouter();
  const { folders } = useFolders() || {};
  const [modalOpen, setModalOpen] = useState(false);
  const [quizType, setQuizType] = useState<QuizType>("basic");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [timeLimitHours, setTimeLimitHours] = useState(0);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [selectedBlooms, setSelectedBlooms] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const toggleModal = (type: QuizType) => {
    setQuizType(type);
    setModalOpen(true);
  };

  const toggleBloom = (bloom: string) => {
    setSelectedBlooms((prev) =>
      prev.includes(bloom)
        ? prev.filter((b) => b !== bloom)
        : [...prev, bloom]
    );
  };

  const toggleFolder = (folder: any) => {
    const nextFolders = new Set(selectedFolders);
    const nextFiles = new Set(selectedFiles);
    const checked = nextFolders.has(folder.id)
    if (checked) {
      nextFolders.delete(folder.id);
      folder.files?.forEach((f: any) => nextFiles.delete(f.id));
    } else {
      nextFolders.add(folder.id);
      folder.files?.forEach((f: any) => nextFiles.add(f.id));
    }
    setSelectedFolders(nextFolders);
    setSelectedFiles(nextFiles);
  };

  const toggleFile = (fileId: string) => {
    const nextFiles = new Set(selectedFiles);
    if (nextFiles.has(fileId)) {
      nextFiles.delete(fileId);
    } else {
      nextFiles.add(fileId);
    }
    setSelectedFiles(nextFiles);
  };

  const startQuiz = () => {
    // Convert hours and minutes to total minutes
    const totalMinutes = timeLimitHours * 60 + timeLimitMinutes;
    const payload = {
      type: quizType,
      topic: topic || undefined,
      num_questions: numQuestions,
      difficulty,
      time_limit: totalMinutes > 0 ? totalMinutes : null,
      blooms: selectedBlooms,
      sources: {
        folders: Array.from(selectedFolders),
        files: Array.from(selectedFiles),
      },
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    const route = quizType === "basic" ? "basic" : "advanced";
    router.push(`quiz/${route}?config=${encoded}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Create Your Assessment
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose your assessment type and customize it to match your learning objectives
          </p>
        </div>

        {/* Quiz Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {quizCards.map((card) => (
            <Card
              key={card.type}
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl border-slate-200 dark:border-slate-800 h-100 rounded-xl"
              onClick={() => toggleModal(card.type)}
            >
              <CardContent className="w-full h-full p-0 relative">
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 rounded-xl w-full h-full object-cover transition-transform duration-700 group-hover:scale-101"
                />

                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />

                <div className="relative z-10 h-full flex flex-col justify-between p-6">

                  <div className="flex justify-end">
                    <Badge
                      variant="secondary"
                      className={`
                        font-bold text-xs uppercase tracking-wider
                        ${card.type === 'basic' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200' : ''}
                        ${card.type === 'advanced' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200' : ''}
                        ${card.type === 'question-bank' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200' : ''}
                      `}>
                      {card.title}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-black font-semibold bg-amber-50 rounded p-2 opacity-80 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Configure {quizType === "basic" ? "Basic Quiz" : quizType === "advanced" ? "Advanced Assessment" : "Question Bank"}
              </DialogTitle>
              <DialogDescription>
                Customize your assessment settings and select source materials
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Graph Theory, Machine Learning, World History"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min={1}
                  max={50}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <div className="flex gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <Badge
                      key={level}
                      variant={difficulty === level ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 capitalize"
                      onClick={() => setDifficulty(level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <Label>Time Limit</Label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="hours" className="text-xs text-muted-foreground">
                      Hours
                    </Label>
                    <Input
                      id="hours"
                      type="number"
                      min={0}
                      max={5}
                      value={timeLimitHours}
                      onChange={(e) => setTimeLimitHours(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="minutes" className="text-xs text-muted-foreground">
                      Minutes
                    </Label>
                    <Input
                      id="minutes"
                      type="number"
                      min={0}
                      max={59}
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Bloom's Taxonomy (for advanced/question-bank) */}
              {quizType !== "basic" && (
                <div className="space-y-2">
                  <Label>Bloom's Taxonomy Levels</Label>
                  <div className="flex flex-wrap gap-2">
                    {BLOOMS_LEVELS.map((bloom) => (
                      <Badge
                        key={bloom}
                        variant={selectedBlooms.includes(bloom) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1.5 capitalize"
                        onClick={() => toggleBloom(bloom)}
                      >
                        {bloom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              <div className="space-y-2">
                <Label>Source Materials</Label>
                <ScrollArea className="h-64 rounded-md border p-4">
                  {folders.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic text-center py-8">
                      No folders available. Upload documents to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {folders.map((folder: any) => (
                        <div key={folder.id} className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`folder-${folder.id}`}
                              checked={selectedFolders.has(folder.id)}
                              onCheckedChange={() => toggleFolder(folder)}
                            />
                            <Label
                              htmlFor={`folder-${folder.id}`}
                              className="font-medium cursor-pointer flex-1"
                            >
                              {folder.name}
                            </Label>
                          </div>
                          {folder.files && folder.files.length > 0 && (
                            <div className="ml-8 space-y-2">
                              {folder.files.map((file: any) => (
                                <div key={file.id} className="flex items-center gap-3">
                                  <Checkbox
                                    id={`file-${file.id}`}
                                    checked={selectedFiles.has(file.id)}
                                    onCheckedChange={() => toggleFile(file.id)}
                                  />
                                  <Label
                                    htmlFor={`file-${file.id}`}
                                    className="text-sm cursor-pointer text-muted-foreground"
                                  >
                                    {file.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={startQuiz}
                className="flex-1"
                size="lg"
              >
                Start Assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}