"use client"

import { useState, useRef } from "react"
import { Tldraw, Editor } from "tldraw"
import "tldraw/tldraw.css"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { REQUEST } from "@/routes" 

export default function DiagramPage() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)

  const editorRef = useRef<Editor | null>(null)

  // 🔥 Generate diagram from backend
  const generateDiagram = async () => {
    if (!topic.trim()) return

    try {
      setLoading(true)

      const diagram = await REQUEST("POST", "chat/generate_diagram/", {
        topic,
      })

      const editor = editorRef.current
      if (!editor) return

      // create new shapes
      editor.createShapes(diagram.shapes)

      editor.zoomToFit()
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col gap-3 p-4 bg-background">
      
      {/* Top control bar */}
      <Card className="p-3 flex gap-2 items-center">
        <Input
          placeholder="Enter topic... e.g. Solar system, Water cycle, Rocket launch"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateDiagram()}
        />

        <Button onClick={generateDiagram} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </Card>

      {/* Canvas */}
      <div className="flex-1 rounded-xl overflow-hidden border">
        <Tldraw
          onMount={(editor) => {
            editorRef.current = editor
          }}
        />
      </div>
    </div>
  )
}
