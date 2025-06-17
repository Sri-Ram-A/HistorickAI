"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Video, Loader2, CheckCircle2, XCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { BASE_URL } from "@/routes"

const steps = [
  { id: 1, title: "Generating Script" },
  { id: 2, title: "Creating Audio" },
  { id: 3, title: "Fetching Videos" },
  { id: 4, title: "Composing Final Video" },
]

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoPath, setVideoPath] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [overlayLoaded, setOverlayLoaded] = useState(false)
  const [script, setScript] = useState<string>("")
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (script && videoRef.current) {
      const words = script.split(" ")
      let currentIndex = 0
      
      const updateSubtitle = () => {
        const start = currentIndex
        const end = Math.min(currentIndex + 5, words.length)
        setCurrentSubtitle(words.slice(start, end).join(" "))
        currentIndex = end
        
        if (currentIndex >= words.length) {
          currentIndex = 0
        }
      }

      const interval = setInterval(updateSubtitle, 2000) // Change subtitle every 2 seconds
      return () => clearInterval(interval)
    }
  }, [script, videoRef.current])

  const generateVideo = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    setError(null)
    setCurrentStep(1)

    try {
      const response = await fetch(BASE_URL+"/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `generate video ${prompt}` }),
      })

      // Simulate steps for demo purposes
      for (let i = 2; i <= steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        setCurrentStep(i)
      }

      const data = await response.json()

      if (!data?.response) {
        throw new Error("Invalid response from server")
      }

      if (data.response.endsWith(".mp4")) {
        setVideoPath(data.response)
        // Set the script from the response
        setScript(data.script || "")
        setIsModalOpen(true)
      } else {
        throw new Error("Invalid video response")
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
      setCurrentStep(0)
    }
  }

  // ... keep existing code (until the video modal JSX)
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
      style={{ backgroundImage:`url("/backgrounds/videoGenerationBackground.jpg")` }}>
      {/* ... keep existing code (until the video modal) */}
      <div className="w-full max-w-4xl p-8">
        <div className="glass-panel rounded-3xl p-8 space-y-8 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 justify-center">
            <Video className="w-8 h-8 text-purple-500" />
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              Lets Generate A Video
            </h2>
          </div>

          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate..."
              className="w-full h-32 p-4 rounded-xl bg-white/80 backdrop-blur border border-purple-100 
                       text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-purple-500 focus:border-transparent resize-none"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}

            <button
              onClick={generateVideo}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 
                       text-white font-medium hover:shadow-lg transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate Video
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-50 bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-4"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-1">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-black">
                  {steps.map((step, index) => {
                    const isActive = currentStep === step.id
                    const isCompleted = currentStep > step.id
                    
                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "relative flex items-center gap-3 p-4 rounded-lg transition-all duration-300",
                          isActive && "bg-purple-50/50",
                          isCompleted && "text-green-500"
                        )}
                      >
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isActive ? (
                            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <span className="font-medium">{step.title}</span>
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2 }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isModalOpen && videoPath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <div className="relative w-3/4 h-3/4 bg-black rounded-2xl overflow-hidden shadow-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 
                         text-white hover:bg-black/30 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
              
              <div className="relative w-full h-full">
                {/* Main Video */}
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                >
                  <source src={`http://localhost:5000/api/videos/${videoPath}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Overlay Video */}
                <div className="absolute inset-0 mix-blend-overlay pointer-events-none">
                  <video
                    className="w-full h-full object-cover opacity-100"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onLoadedData={() => setOverlayLoaded(true)}
                  >
                    <source src="overlay.mp4" type="video/mp4" />
                  </video>
                </div>

                {/* Subtitles with Glassmorphism */}
                {currentSubtitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute bottom-16  transform -translate-x-1/2 px-8 py-4 
                             rounded-xl bg-black/30 backdrop-blur-md border border-white/10
                             text-white text-xl font-md tracking-wide text-center
                             shadow-lg min-w-[300px] max-w-[80%]"
                  >
                    {currentSubtitle}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}