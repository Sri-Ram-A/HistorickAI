"use client"

import { useState, useRef, useCallback } from "react"
import { Tldraw, Editor, createShapeId, TLShapePartial } from "tldraw"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, AlertCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import "tldraw/tldraw.css"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { REQUEST } from "@/routes"

/* -------------------------
   Helpers (Logic preserved)
   ------------------------- */

function toRichText(text?: string) {
  if (!text || !text.trim()) return undefined
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: text.trim() }] }],
  }
}

function transformShapeForTldraw(shape: any): TLShapePartial | null {
  if (!shape?.id || !shape?.type) return null
  const id = createShapeId(shape.id.replace(/^shape:/, ""))
  const base = {
    id,
    type: shape.type,
    x: typeof shape.x === "number" ? shape.x : 0,
    y: typeof shape.y === "number" ? shape.y : 0,
    rotation: typeof shape.rotation === "number" ? shape.rotation : 0,
  }
  const p = shape.props ?? {}

  switch (shape.type) {
    case "text":
      return { ...base, props: { richText: toRichText(p.text), size: p.size ?? "m", color: p.color ?? "black" } }
    case "note":
      return { ...base, props: { richText: toRichText(p.text), color: p.color ?? "yellow" } }
    case "geo":
      return { ...base, props: { geo: p.geo ?? "rectangle", w: Math.max(1, p.w ?? 200), h: Math.max(1, p.h ?? 100), fill: p.fill ?? "none", color: p.color ?? "black" } }
    case "arrow":
      return { ...base, props: { start: p.start ?? { x: 0, y: 0 }, end: p.end ?? { x: 100, y: 0 }, color: p.color ?? "black" } }
    default:
      return null
  }
}

/* -------------------------
   Component
   ------------------------- */

export default function DiagramPage() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<Editor | null>(null)

  const generateDiagram = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please provide a topic to visualize.")
      return
    }

    const editor = editorRef.current
    if (!editor) return

    setLoading(true)
    setError(null) // Clear previous errors

    try {
      const res = await REQUEST("POST", "chat/generate_diagram/", { topic })
      if (!res || !Array.isArray(res.shapes)) {
        throw new Error("The AI returned an incompatible diagram format.")
      }

      const shapes = res.shapes
        .map(transformShapeForTldraw)
        .filter((s): s is TLShapePartial => Boolean(s))

      if (shapes.length === 0) {
        throw new Error("The engine couldn't generate any valid shapes for this topic.")
      }

      const existing = editor.getCurrentPageShapes()
      if (existing.length) editor.deleteShapes(existing.map((s) => s.id))

      editor.createShapes(shapes)
      editor.zoomToFit()

      toast.success(`Generated ${shapes.length} elements successfully.`)
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred during generation."
      setError(msg)
      toast.error("Generation failed")
    } finally {
      setLoading(false)
    }
  }, [topic])

  return (
    <div className="relative h-screen w-screen bg-[#fafafa] overflow-hidden">
      {/* Canvas Area */}
      <div className="absolute inset-0 z-0">
        <Tldraw
          onMount={(editor) => {
            editorRef.current = editor
          }}
          autoFocus
        />
      </div>

      {/* Floating UI Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col gap-3"
        >
          {/* Main Input Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-2 flex items-center gap-2 group transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <div className="pl-3 text-muted-foreground">
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <Input
              placeholder="Describe a diagram (e.g. Microservices Architecture)"
              className="border-none bg-transparent shadow-none focus-visible:ring-0 text-md h-12"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateDiagram()}
            />
            <Button 
              onClick={generateDiagram} 
              disabled={loading}
              className="rounded-xl px-6 h-10 transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Generate</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Error Log Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Generation Error</p>
                    <p className="text-xs text-red-600/80 leading-relaxed mt-0.5">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Subtle Bottom Branding/Status */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 text-xs font-medium text-muted-foreground bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/40">
        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
        {loading ? "AI is drawing..." : "Ready to design"}
      </div>
    </div>
  )
}