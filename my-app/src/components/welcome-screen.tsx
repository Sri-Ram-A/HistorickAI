"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [greeting, setGreeting] = useState("Good morning")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon")
    else if (hour >= 17) setGreeting("Good evening")
  }, [])

  return (
    <div className="w-full h-screen flex justify-center items-center relative bg-gradient-to-br from-purple-50 to-blue-50">
      
      {/* Background video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="https://videos.pexels.com/video-files/3151482/3151482-sd_960_506_24fps.mp4" type="video/mp4" />
        {/* You can also add other formats like .webm or .ogv for compatibility */}
      </video>
  
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center space-y-8 p-12 rounded-3xl glass-panel"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <Sparkles className="w-10 h-10 text-purple-500" />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            {greeting}
          </h1>
        </motion.div>
        <p className="text-blue-600 text-xl">Ready to start an amazing conversation?</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-200 via-blue-400 to-violet-600 text-white rounded-full flex items-center gap-2 hover:shadow-lg transition-shadow"
          disabled={true}
        >
          Let's Begin
        </motion.button>
        <h1>(Currently Ongoing,Explore the sidebar)</h1>
      </motion.div>
    </div>
  )
}  