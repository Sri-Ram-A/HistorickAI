"use client"

import { useState, useRef, useCallback } from "react"
import { Tldraw, Editor, createShapeId, TLShapePartial } from "tldraw"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
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
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<Editor | null>(null)

  const generateDiagram = useCallback(async () => {
    if (!query.trim()) {
      setError("Please provide a query to visualize.")
      return
    }

    const editor = editorRef.current
    if (!editor) return

    setLoading(true)
    setError(null) // Clear previous errors

    try {
      const res = await REQUEST("POST", "chat/generate_diagram/", { query })
      if (!res || !Array.isArray(res.shapes)) {
        throw new Error("The AI returned an incompatible diagram format.")
      }

      const shapes = res.shapes
        .map(transformShapeForTldraw)
        .filter((s): s is TLShapePartial => Boolean(s))

      if (shapes.length === 0) {
        throw new Error("The engine couldn't generate any valid shapes for this query.")
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
  }, [query])

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">

      
      {/* Floating UI Overlay */}
      <div className="flex max-w-6xl p-2 shrink-0">

        <Input
          placeholder="Describe a diagram (e.g. Microservices Architecture)"
          className="border-none bg-transparent shadow-none focus-visible:ring-0 text-md h-12"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateDiagram()}
        />
        <Button
          onClick={generateDiagram}
          disabled={loading}
          className=" rounded-xl px-6 h-10 right-2 transition-all hover:scale-[1.02] active:scale-95"
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

      {/* Canvas Area */}
      <div className="flex-1 py-5">
        <Tldraw autoFocus onMount={(editor) => {editorRef.current = editor}} />
      </div>
    </div>
  )
}