"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { REQUEST } from "@/routes";
import { TimelineEntry } from "@/types";
import { Timeline } from "@/components/timeline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Icons
import {
  Search,
  Sparkles,
  Clock,
  ArrowRight,
  Loader2,
  RefreshCcw,
  History
} from "lucide-react";

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState<string>("");
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!userQuery.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Using your custom REQUEST utility
      const data = await REQUEST("POST", "chat/generate_timeline/", { message: userQuery });

      const formattedData = data.response.map((item: any) => ({
        title: item.title,
        content: (
          <div className="group relative space-y-6">
            {/* Entry Header */}
            <div className="space-y-2">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/5 backdrop-blur-md">
                Historical Milestone
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white group-hover:text-purple-400 transition-colors">
                {item.heading}
              </h2>
            </div>

            {/* Description Card */}
            <Card className="p-6 bg-white/5 dark:bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed italic">
                "{item.description}"
              </p>
            </Card>

            {/* Visual Section */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10" />
              <Image
                src={item.image_source}
                alt={item.alternative || "Historical visualization"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-white/80 tracking-widest uppercase">Visual Archive Record</span>
              </div>
            </div>
          </div>
        ),
      }));

      setTimelineData(formattedData);
      setIsGenerated(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while accessing the archives.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-white selection:bg-purple-500/30 dark:bg-neutral-950">

      <main className="relative z-10 flex flex-col items-center">

        {/* State 1: Search Header */}
          <AnimatePresence mode="wait">
            {!isGenerated ? (
              <div className="parent relative w-full min-h-screen">

                <div className="background absolute inset-0 z-0">
                  <img src="/images/timeline.png" alt="Timeline background" className="h-full w-full object-contain brightness-75" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-8 relative z-10"
                >

                  <div className="space-y-4">
                    <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/10 px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-2 text-purple-400" />
                      AI-Powered Chronology
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-linear-to-b dark:from-white dark:to-white/40 bg-clip-text">
                      It's Time
                    </h1>
                    <p className="text-neutral-500 text-lg md:text-xl max-w-xl mx-auto font-medium dark:text-neutral-300">
                      To enter a <span className="bg-red-400 p-1 rounded text-white">subject
                      </span> to reconstruct its <span className="bg-purple-500 text-white p-1 rounded">
                        journey</span> through time with <span className="p-0.5 bg-green-400 text-white">
                        photographic</span> precision.
                    </p>
                  </div>

                  <div className="relative max-w-2xl mx-auto">
                    <Input
                      placeholder="e.g. The Renaissance, SpaceX, or Ancient Rome..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                      className="h-16 pl-6 pr-40 bg-white/5 border-white/10 rounded-2xl text-xl backdrop-blur-2xl focus-visible:ring-purple-500/50 dark:text-neutral-300"
                    />
                    <Button
                      onClick={handleGenerate}
                      disabled={loading || !userQuery}
                      className="absolute right-2 top-2 h-12 px-6 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold transition-transform active:scale-95"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Generate"}
                    </Button>
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-xs">
                    <History className="w-3 h-3" />
                    Archive Result
                  </div>
                  <h2 className="text-4xl font-bold capitalize tracking-tight">{userQuery}</h2>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setTimelineData([]); setIsGenerated(false); }}
                  className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 group"
                >
                  <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  New Exploration
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        {/* State 2: Loading Overlay */}
        {loading && !isGenerated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin" />
                <div className="absolute inset-4 border-t-2 border-blue-500 rounded-full animate-spin [animation-duration:1.5s]" />
              </div>
              <p className="text-white font-mono tracking-widest text-sm animate-pulse">RECONSTRUCTING TIMELINE...</p>
            </div>
          </div>
        )}

        {/* State 3: Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <Badge variant="destructive" className="py-2 px-6 text-sm">{error}</Badge>
          </motion.div>
        )}

        {/* State 4: Timeline Rendering */}
        {isGenerated && timelineData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full"
          >
            <Timeline data={timelineData} />
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Helper function for conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}