"use client"
import { useState, useRef, type ChangeEvent, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Paperclip, Send, Sparkles } from "lucide-react"
import { ChatMessage } from "@/components/chat-message"
import { PDFViewer } from "@/components/pdf-viewer"

const FALLBACK_RESPONSES = [
  "Backend Not connected....",
  "Run python chat.py ....."
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [input, setInput] = useState("")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [videoPath, setVideoPath] = useState<string | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [...prev, { text: input, isUser: true }])
    setInput("")

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      })

      const textResponse = await response.text()
      let data
      try {
        data = JSON.parse(textResponse)
      } catch (error) {
        console.error("JSON parsing error:", error)
        throw new Error("Invalid JSON format from backend")
      }

      if (!data?.response) {
        throw new Error("Invalid response from backend")
      }

      if (data.response.endsWith(".mp4")) {
        setVideoPath(data.response)
      } else {
        setTimeout(() => {
          setMessages((prev) => [...prev, { text: data.response, isUser: false }])
          scrollToBottom()
        }, 500)
      }
    } catch (error) {
      console.error("API Error:", error)
      const fallbackResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: fallbackResponse, isUser: false }])
        scrollToBottom()
      }, 500)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="h-screen flex p-6 gap-6">
        <div className="w-1/2 h-full flex flex-col glass-panel rounded-2xl overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 p-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatMessage message={message.text} isUser={message.isUser} />
                  {videoPath && !isVideoModalOpen && index === messages.length - 1 && (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-violet-400 via-violet-500 to-blue-600 text-white rounded-full flex items-center gap-2 hover:shadow-lg transition-shadow"
                      onClick={() => setIsVideoModalOpen(true)}
                    >
                      <Sparkles className="w-4 h-4" />
                      Play Video
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-white/50 border-t border-white/20">
            <div className="flex gap-2 items-center bg-white rounded-full p-2 shadow-sm">
              <button
                type="button"
                onClick={() => document.getElementById("pdf-input")?.click()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-blue-300"
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <input
                id="pdf-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full bg-transparent px-4 py-2 focus:outline-none text-gray-700 placeholder:text-gray-400 border border-blue-300"
              />
              <button 
                type="submit" 
                className="premium-gradient p-2 rounded-full hover:shadow-md transition-shadow border border-blue-300"
              >
                <Send className="w-5 h-5 text-black" />
              </button>
            </div>
          </form>
        </div>

        <div className="w-1/2 h-full glass-panel rounded-2xl p-6">
          {pdfUrl ? (
            <PDFViewer url={pdfUrl} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/50">
              <Paperclip className="w-12 h-12 text-purple-300 mb-4" />
              <p className="text-gray-500 text-lg">Upload a PDF to view it here</p>
            </div>
          )}
        </div>
      </div>

      {isVideoModalOpen && videoPath && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
        >
          <div className="relative w-3/4 h-3/4 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-black/20 rounded-full p-2 backdrop-blur-sm hover:bg-black/30 transition-colors"
            >
              ✕
            </button>
            <video className="w-full h-full object-cover" controls autoPlay>
              <source src={`http://localhost:5000/api/${videoPath}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>
      )}
    </main>
  )
}