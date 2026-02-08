"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Layers, LibraryBig, X } from "lucide-react";
import { useFolders } from "@/hooks/useFolders";
import { cn } from "@/lib/utils";

type QuizType = "basic" | "advanced" | "question-bank";

const quizCards = [
  { type: "basic", title: "Basic Quiz", desc: "Fast AI-generated questions", icon: BrainCircuit, color: "#6366f1" },
  { type: "advanced", title: "Advanced", desc: "Mixed types + reasoning", icon: Layers, color: "#10b981" },
  { type: "question-bank", title: "Question Bank", desc: "RAG from stored papers", icon: LibraryBig, color: "#f59e0b" },
] as const;

export default function QuizHome() {
  const router = useRouter();
  const { folders = [] } = useFolders() || {};

  const [topic, setTopic] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [quizType, setQuizType] = useState<QuizType>("basic");

  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const toggleSet = (set: Set<string>, value: string, setter: any) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };

  const toggleFolder = (folder: any) => {
    const nextFolders = new Set(selectedFolders);
    const nextFiles = new Set(selectedFiles);
    const checked = nextFolders.has(folder.id);
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

  const startQuiz = () => {
    const payload = {
      type: quizType,
      topic,
      num_questions: 10,
      difficulty: "medium",
      time_limit: null,
      sources: {
        folders: [...selectedFolders],
        files: [...selectedFiles],
      },
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    const route = quizType === "advanced" ? "advanced" : "basic";
    router.push(`quiz/${route}?config=${encoded}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-6xl space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Launch Quiz</h1>
          <p className="text-muted-foreground">Choose your mission profile</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizCards.map((card) => (
            <div key={card.type} onClick={() => { setQuizType(card.type); setModalOpen(true); }}
                 className="group relative rounded-2xl border bg-card p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-30 group-hover:opacity-60 transition"
                   style={{ background: card.color }} />
              <card.icon className="relative mx-auto mb-4 w-10 h-10" style={{ color: card.color }} />
              <h3 className="font-semibold text-lg">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-6 space-y-6">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setModalOpen(false)}>
              <X className="w-4 h-4" />
            </Button>

            <h2 className="text-xl font-semibold capitalize">{quizType.replace("-", " ")} Setup</h2>

            <Input placeholder="Topic (e.g. Graph Theory)" value={topic} onChange={(e) => setTopic(e.target.value)} />

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Sources</h3>
              <ScrollArea className="h-60 border rounded-lg p-3">
                {folders.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic">No folders available</div>
                ) : (
                  folders.map((folder: any) => (
                    <div key={folder.id} className="mb-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Checkbox checked={selectedFolders.has(folder.id)} onCheckedChange={() => toggleFolder(folder)} />
                        <span>{folder.name}</span>
                      </div>
                      <div className="ml-6 mt-2 space-y-2">
                        {folder.files?.map((file: any) => (
                          <div key={file.id} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={selectedFiles.has(file.id)} onCheckedChange={() => toggleSet(selectedFiles, file.id, setSelectedFiles)} />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>

            <div className="flex gap-2">
              <Button className="grow" onClick={startQuiz}>Start Quiz</Button>
              <Button variant="ghost" onClick={() => { setModalOpen(false); setSelectedFolders(new Set()); setSelectedFiles(new Set()); }}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
