"use client"
import { useState } from "react";
import { TimelineEntry } from "../../types"; // Assuming you have a types file
import { Timeline } from "../../components/timeline";
import { motion } from "framer-motion";
import Image from "next/image";
import { BASE_URL } from "@/routes";
export default function Home() {

  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState<string>("");
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(true);
  const [fadeInput, setFadeInput] = useState<boolean>(false);

  const fetchTimelineData = async (message: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(BASE_URL+"/generate-timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (response.ok) {
        const formattedData = data.response.map((item: any) => ({
          title: item.title,
          content: (
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-white/10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              <h2 className="text-transparent dark:text-neutral-100 text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text">
                {item.heading}
              </h2>
              <h3 className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base font-medium mb-8 leading-relaxed">
                {item.description}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-64"
                />
                <Image
                  src={item.image_source}
                  alt={item.alternative}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-xl object-cover shadow-lg transform transition-transform duration-300 hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority // Optional: helps with LCP performance
                />
              </div>
            </div>
          ),
        }));

        setTimelineData(formattedData);
        setShowTimeline(true);
        setFadeInput(true);
        setTimeout(() => setShowInput(false), 500);
      } else {
        throw new Error(data.error || "Failed to fetch timeline data");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (userMessage.trim() !== "") {
      fetchTimelineData(userMessage);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat p-4 bg-fixed"
      style={{
        backgroundImage: `url('/backgrounds/timelineBackground.jpeg')`
      }}
    >
      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: fadeInput ? 0 : 1, y: fadeInput ? -20 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 mb-8"
        >
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Generate Your Timeline
          </h1>
          <input
            type="text"
            placeholder="Enter your query..."
            className="w-full p-4 bg-white/10 text-white border-2 border-white/20 rounded-xl outline-none placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300 ease-in-out text-lg backdrop-blur-md"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:opacity-90 focus:ring-2 focus:ring-purple-500 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Generate Timeline
          </button>
        </motion.div>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl font-semibold bg-white/10 backdrop-blur-xl px-8 py-4 rounded-full shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse" />
            Loading...
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white bg-red-500/20 backdrop-blur-xl px-8 py-4 rounded-xl border border-red-500/30 shadow-lg"
        >
          {error}
        </motion.div>
      )}

      {showTimeline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          <Timeline data={timelineData} />
        </motion.div>
      )}
    </div>
  );
}
