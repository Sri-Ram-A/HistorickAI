"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { User, Bot } from "lucide-react"
import { ChatMessageProps } from "@/types"


export function ChatMessage({ message, isUser }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!isUser) {
      let i = 0
      const interval = setInterval(() => {
        if (i < message.length) {
          setDisplayedText((prev) => prev + message[i])
          i++
        } else {
          clearInterval(interval)
          setShowCursor(false)
        }
      }, 30)

      return () => clearInterval(interval)
    } else {
      setDisplayedText(message)
    }
  }, [message, isUser])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={cn(
        "flex gap-3 items-start max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-purple-100" : "bg-blue-100"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-purple-500" />
        ) : (
          <Bot className="w-4 h-4 text-blue-500" />
        )}
      </div>
      
      <div className={cn(
        "px-6 py-3 rounded-2xl shadow-sm",
        isUser 
          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" 
          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      )}>
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {displayedText}
          {!isUser && showCursor && (
            <span className="animate-pulse ml-1 opacity-70">▋</span>
          )}
        </p>
      </div>
    </motion.div>
  )
}