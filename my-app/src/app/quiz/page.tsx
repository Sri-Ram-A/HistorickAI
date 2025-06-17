"use client";
import { useState, useEffect } from "react";
import { QuizQuestion } from "@/types";

export default function Quiz() {
  const [hasMounted, setHasMounted] = useState(false);
  const [topic, setTopic] = useState("");
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [background, setBackground] = useState("");

  // Ensure hydration only happens on client
  useEffect(() => {
    setHasMounted(true);
    setBackground("/backgrounds/beforeQuizBackground.jpeg");
  }, []);

  if (!hasMounted) return null; // 👈 avoids mismatch

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error("Failed to fetch quiz. Try again!");
      const data: QuizQuestion[] = await response.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid quiz data received!");

      setQuizData(data);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setSubmitted(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionIndex: number, option: string) => {
    if (!submitted) {
      setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
    }
  };

  const submitQuiz = () => {
    setSubmitted(true);
    setTimeout(() => setBackground("/backgrounds/afterQuizBackground.jpeg"));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="bg-white/10 backdrop-blur-lg shadow-lg rounded-lg p-8 w-96 text-white text-center">
        {!quizData.length ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Enter Quiz Topic</h2>
            <input
              type="text"
              className="p-2 w-full text-black rounded-md"
              placeholder="e.g. Space, AI, History"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button
              onClick={fetchQuiz}
              className="mt-4 bg-blue-500 px-4 py-2 rounded-md text-white hover:bg-blue-600 transition"
              disabled={loading || !topic.trim()}
            >
              {loading ? "Loading..." : "Generate Quiz"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">{quizData[currentQuestion].question}</h2>
            <ul className="space-y-2">
              {quizData[currentQuestion].options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion] === option;
                const isCorrect = submitted && option === quizData[currentQuestion].correctAnswer;
                const isWrong =
                  submitted && isSelected && option !== quizData[currentQuestion].correctAnswer;

                return (
                  <li
                    key={index}
                    onClick={() => selectAnswer(currentQuestion, option)}
                    className={`p-2 rounded-md cursor-pointer transition ${
                      isSelected ? "bg-blue-500 text-white" : "bg-white/20 hover:bg-white/30"
                    } ${isCorrect ? "bg-green-500" : ""} ${isWrong ? "bg-red-500" : ""}`}
                  >
                    {option}
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
                className="bg-white/20 px-4 py-2 rounded-md hover:bg-white/30 transition disabled:opacity-50"
                disabled={currentQuestion === 0}
              >
                ←
              </button>
              {currentQuestion < quizData.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  className="bg-white/20 px-4 py-2 rounded-md hover:bg-white/30 transition"
                >
                  →
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600 transition"
                  disabled={submitted}
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
