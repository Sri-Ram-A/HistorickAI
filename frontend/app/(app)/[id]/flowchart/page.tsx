'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Sparkles, Code2 } from "lucide-react"
import { MermaidDiagram } from "@lightenna/react-mermaid-diagram"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import { REQUEST } from "@/routes"

type ChartType = "flowchart" | "sequence" | "gantt" | "class" | "git" | "er" | "journey" | "quadrant" | "xy"

const CHART_OPTIONS = [
    { type: "flowchart", label: "Flowchart", description: "Process flows and decision trees" },
    { type: "sequence", label: "Sequence", description: "Interactions over time" },
    { type: "gantt", label: "Gantt", description: "Project timelines" },
    { type: "class", label: "Class", description: "Class relationships" },
    { type: "git", label: "Git", description: "Version control flow" },
    { type: "er", label: "ER Diagram", description: "Database schema" },
    { type: "journey", label: "User Journey", description: "UX flows" },
    { type: "quadrant", label: "Quadrant", description: "2x2 categorization" },
    { type: "xy", label: "XY Chart", description: "Axis-based charts" },
]

export default function ChartPage() {
    const params = useParams<{ id: string }>()
    const [query, setQuery] = useState("")
    const [selectedType, setSelectedType] = useState<ChartType>("flowchart")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [diagram, setDiagram] = useState<{ title: string; code: string } | null>(null)

    const handleGenerate = async () => {
        if (!query.trim()) {
            setError("Please enter a description")
            return
        }
        setLoading(true)
        setError(null)

        try {
            const response = await REQUEST("POST", "chat/generate_chart/", {
                source_folder_id: params.id,
                type: selectedType,
                query: query.trim(),
            })
            setDiagram(response)
        } catch (err: any) {
            setError(err?.message || "Failed to generate diagram")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="relative min-h-screen bg-background overflow-x-hidden">

            <div className="background absolute inset-0 z-0 opacity-80">
                <img src="/backgrounds/flowchart.png" />
            </div>

            <div className="relative z-10 container mx-auto max-w-5xl p-4 space-y-2">

                {/* Header */}
                <header className="text-center space-y-4">
                    <Badge variant="outline" className="px-4 py-1 bg-red-500/80 border-primary/20">
                        <Sparkles className="w-3 h-3 mr-2" />
                        AI Visualization
                    </Badge>
                    <h1 className="text-4xl font-bold">
                        Architectural <span className="p-1 bg-red-500/80 rounded">Designer</span>
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Convert natural language into structured Mermaid diagrams.
                    </p>
                </header>

                {/* Input Card */}
                <Card className="bg-card/50 backdrop-blur-sm shadow-xl">

                    <CardHeader>
                        <CardTitle>Diagram Configuration</CardTitle>
                        <CardDescription>
                            Describe your workflow and choose a diagram type.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">

                        {/* User Query */}
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                className="min-h-30"
                                placeholder="What's new today ? Life of Netaji or perhaps the lifecycle of a butterfly !"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {/* Diagram Type Selection */}
                        <div className="space-y-2">
                            <Label>Diagram Type</Label>
                            <div className="flex flex-wrap gap-2">
                                {CHART_OPTIONS.map((chart) => (
                                    <HoverCard key={chart.type}>
                                        <HoverCardTrigger>
                                            <Badge
                                                onClick={() => setSelectedType(chart.type as ChartType)}
                                                variant={selectedType === chart.type ? "default" : "outline"}
                                                className={cn(
                                                    "cursor-pointer",
                                                    selectedType !== chart.type && "hover:bg-accent"
                                                )}
                                            >
                                                {chart.label}
                                            </Badge>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="text-xs">
                                            {chart.description}
                                        </HoverCardContent>
                                    </HoverCard>
                                ))}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button className="w-full" onClick={handleGenerate} disabled={loading} >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate Diagram
                                </>
                            )}
                        </Button>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardFooter>

                </Card>

                {/* Preview */}
                {(diagram || loading) && (
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle>{diagram?.title || "Generating..."}</CardTitle>
                                <CardDescription>Visual Output</CardDescription>
                            </div>

                            {diagram && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Code2 className="w-4 h-4 mr-2" />
                                            Source
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Mermaid Code</DialogTitle>
                                            <DialogDescription>
                                                Copy & reuse anywhere Mermaid is supported.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Separator />
                                        <pre className="bg-slate-950 p-4 rounded text-xs text-slate-300 overflow-auto">
                                            {diagram.code}
                                        </pre>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardHeader>

                        <CardContent className="min-h-[400px] flex justify-center items-center bg-white dark:bg-slate-950/40">
                            {loading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            ) : (
                                <MermaidDiagram>{diagram!.code}</MermaidDiagram>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

        </main>
    )
}
