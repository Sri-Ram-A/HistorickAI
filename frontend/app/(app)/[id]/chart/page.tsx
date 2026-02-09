'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Loader2, Sparkles, Download, Copy, Check, Code2, Info, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { REQUEST } from "@/routes"
import { MermaidDiagram } from "@lightenna/react-mermaid-diagram";

// --- Types ---

type ChartType = "flowchart" | "sequence" | "gantt" | "class" | "git" | "er" | "journey" | "quadrant" | "xy"

interface ChartTypeOption {
    type: ChartType
    label: string
    description: string
    variant: "default" | "secondary" | "outline" | "destructive" // Mapped for Badge
}

const CHART_OPTIONS: ChartTypeOption[] = [
    { type: "flowchart", label: "Flowchart", description: "Process flows and decision trees", variant: "default" },
    { type: "sequence", label: "Sequence", description: "Interactions between entities over time", variant: "default" },
    { type: "gantt", label: "Gantt", description: "Project timelines and schedules", variant: "default" },
    { type: "class", label: "Class", description: "Object-oriented class relationships", variant: "default" },
    { type: "git", label: "Git", description: "Version control branches and commits", variant: "default" },
    { type: "er", label: "ER Diagram", description: "Entity relationships and database schema", variant: "default" },
    { type: "journey", label: "User Journey", description: "User experience maps", variant: "default" },
    { type: "quadrant", label: "Quadrant", description: "2x2 matrix for categorization", variant: "default" },
    { type: "xy", label: "XY Chart", description: "Data visualization with axes", variant: "default" }
]

// --- Components ---

export default function ChartPage() {
    // --- State ---
    const [query, setQuery] = useState("")
    const [selectedType, setSelectedType] = useState<ChartType>("flowchart")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [diagram, setDiagram] = useState<{ title: string; code: string } | null>(null)
    const [copied, setCopied] = useState(false)

    // --- Functions ---
    const handleGenerate = async () => {
        if (!query.trim()) { setError("Please enter a description for your diagram"); return; }
        setLoading(true)
        setError(null)

        try {
            const response = await REQUEST("POST", "chat/generate_chart/", {
                type: selectedType,
                query: query.trim()
            })
            setDiagram(response)
        } catch (err: any) {
            setError(err?.message || "Failed to generate diagram")
        } finally {
            setLoading(false)
        }
    }

    const handleCopyCode = () => {
        if (diagram?.code) {
            navigator.clipboard.writeText(diagram.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownload = () => {
        const svg = document.querySelector('.mermaid svg')
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg)
            const blob = new Blob([svgData], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${diagram?.title || 'diagram'}.svg`
            link.click()
            URL.revokeObjectURL(url)
        }
    }

    // --- Sub-sections ---

    const PageHeader = () => (
        <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">AI Visualization Engine</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Turn ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Diagrams</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
                Visualizations generated from your natural language descriptions.
            </p>
        </div>
    )

    const ChartSelector = () => (
        <div className="flex flex-wrap gap-2 pt-2">
            {CHART_OPTIONS.map((chart) => (
                <HoverCard key={chart.type} openDelay={200}>
                    <HoverCardTrigger asChild>
                        <Badge
                            variant={selectedType === chart.type ? "default" : "outline"}
                            className={cn(
                                "cursor-pointer px-3 py-1.5 transition-all duration-200 text-sm font-medium",
                                selectedType === chart.type
                                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                            onClick={() => setSelectedType(chart.type)}
                        >
                            {chart.label}
                        </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 p-0 overflow-hidden border-2">
                        <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            {/* Placeholder for images */}
                            <div className="flex flex-col items-center gap-2">
                                <Info className="w-6 h-6 opacity-20" />
                                <img src="/images/placeholder.png" />
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-sm mb-1">{chart.label}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {chart.description}
                            </p>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            ))}
        </div>
    )

    const CodeModal = () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Code2 className="w-4 h-4" />
                    View Code
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white dark:bg-slate-950">
                <DialogHeader>
                    <div className="flex justify-between items-center pr-6">
                        <div>
                            <DialogTitle>Mermaid Syntax</DialogTitle>
                            <DialogDescription>Use this code in any Mermaid-supported editor.</DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleDownload}>
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                <div className="relative mt-4">
                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 overflow-x-auto text-sm font-mono border border-slate-800">
                        <code>{diagram?.code}</code>
                    </pre>
                </div>
            </DialogContent>
        </Dialog>
    )

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-indigo-100">
            <div className="container mx-auto px-6 py-16 max-w-6xl">
                <PageHeader />

                <div className="grid grid-cols-1 gap-12">
                    {/* Input Section */}
                    <div className="max-w-3xl mx-auto w-full space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="query" className="text-base font-semibold">Describe your process</Label>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Step 1</span>
                            </div>
                            <Textarea
                                id="query"
                                placeholder="e.g. A user logs in, the system validates credentials, then redirects to dashboard..."
                                className="min-h-[120px] text-lg p-4 resize-none rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-indigo-500 transition-all shadow-sm"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Select Format</Label>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Step 2</span>
                            </div>
                            <ChartSelector />
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={loading || !query.trim()}
                            className="w-full h-14 text-lg font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Architecting...</>
                            ) : (
                                <><Sparkles className="mr-2 h-5 w-5" /> Generate Visualization</>
                            )}
                        </Button>

                        {error && (
                            <Alert variant="destructive" className="rounded-xl border-2">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Preview Section */}
                    {(diagram || loading) && (
                        <Card className="border-0 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-transparent backdrop-blur-md px-8 py-6">
                                <div>
                                    <CardTitle className="text-xl">{diagram?.title || "Drafting Diagram..."}</CardTitle>
                                    <CardDescription>Live Preview</CardDescription>
                                </div>
                                {diagram && (
                                    <div className="flex gap-3">
                                        <CodeModal />
                                        <Button onClick={handleDownload} size="sm" className="h-8 gap-2 bg-slate-900 dark:bg-white dark:text-slate-900">
                                            <Download className="w-3.5 h-3.5" />
                                            Export SVG
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-8 flex items-center justify-center min-h-[500px]">
                                {loading ? (
                                    <div className="flex flex-col items-center gap-4 animate-pulse">
                                        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                        </div>
                                        <p className="text-slate-400 font-medium">Processing logic flows...</p>
                                    </div>
                                ) : (
                                    <div className="w-full overflow-auto flex justify-center bg-white dark:bg-slate-950 p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <MermaidDiagram>{diagram!.code}</MermaidDiagram>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Footer / Tips */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Lightbulb, text: "Be specific about logic branches like 'If authenticated' or 'Else'." },
                        { icon: Check, text: "The AI understands entity names—try 'Database' or 'Mobile Client'." },
                        { icon: Info, text: "Sequence diagrams work best for API call flows and timing." }
                    ].map((tip, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <tip.icon className="w-5 h-5 text-indigo-500 shrink-0" />
                            <p className="text-sm text-slate-500">{tip.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}