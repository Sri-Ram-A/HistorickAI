'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Timeline } from '@/components/timeline'
import { Sparkles, Loader2, RefreshCcw, History, Calendar, Rocket, Orbit } from 'lucide-react'
import { REQUEST } from '@/routes'
import { TimelineOutput } from '@/types'

export default function TimelinePage() {
  const params = useParams<{ id: string }>()
  const [timelineResponse, setTimelineResponse] = useState<TimelineOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)

  const handleGenerate = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)

    try {
      const data: TimelineOutput = await REQUEST('POST', 'chat/generate_timeline/', {
        source_folder_id: params.id,
        query: query.trim(),
      })
      setTimelineResponse(data)
      setIsGenerated(true)
    } catch (err: any) {
      setError(err.message || 'Transmission failed. Signal lost.')
    } finally {
      setLoading(false)
    }
  }

  const formattedTimelineData = timelineResponse?.events.map((event) => ({
    title: event.title,
    content: (
      <div className="group/item relative space-y-6">
        {/* Event Header */}
        <div className="space-y-3">
          <Badge
            variant="secondary"
            className="bg-orange-100/50 text-orange-700 border-orange-200 dark:bg-slate-800/50 dark:text-orange-400 dark:border-orange-500/20 transition-colors"
          >
            <Orbit className="w-3 h-3 mr-1.5 animate-spin-slow" />
            Temporal Node
          </Badge>

          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white group-hover/item:text-orange-600 dark:group-hover/item:text-transparent dark:group-hover/item:bg-clip-text dark:group-hover/item:bg-linear-to-r dark:group-hover/item:from-orange-400 dark:group-hover/item:to-rose-400 transition-all duration-300">
            {event.heading}
          </h2>
        </div>

        {/* Image Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl bg-slate-100 dark:bg-slate-900">
          <Image
            src={event.image_source}
            alt={event.alternative || event.heading}
            fill
            className="object-cover transition-transform duration-1000 group-hover/item:scale-105"
          />
          {/* Adaptive Overlay: Lighter in light mode, deeper in dark mode */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-200/40 dark:from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed font-light border-l-2 border-slate-200 dark:border-slate-800 pl-6 py-2 transition-colors">
          {event.description}
        </p>
      </div>
    ),
  })) || []

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-50 overflow-x-hidden selection:bg-orange-500/30 transition-colors duration-300">
      {/* Space Background Effects - Subtle blurs that work on both themes */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/backgrounds/timeline.png" alt='Background Image'     className="absolute bottom-0 left-1/2 -translate-x-1/2" />
      </div>

      <main className="relative z-10 container mx-auto px-6">
        <AnimatePresence mode="wait">
          {!isGenerated ? (
            <motion.section
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center min-h-screen text-center"
            >
              {/* Badge: Adaptive border and background */}
              <Badge
                variant="outline"
                className="mb-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 text-orange-500 dark:text-orange-400" />
                Intelligence Protocol v2.0
              </Badge>

              {/* Hero Text: Dual-theme linear mapping */}
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-linear-to-b from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-white dark:to-slate-500">
                It&apos;s Time Travel Time
              </h1>

              {/* Input Group: Glassmorphism that lightens/darkens properly */}
              <div className="relative w-full max-w-2xl group">
                {/* Glow Effect: Reduced opacity in light mode for professionalism */}
                <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 via-rose-500 to-orange-500 rounded-2xl blur opacity-15 dark:opacity-25 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-1000" />

                <Card className="relative bg-white/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-xl dark:shadow-none backdrop-blur-xl opacity-75">
                  <div className="flex flex-col sm:flex-row gap-2 ">
                    <Input
                      placeholder="Input temporal coordinates..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      className="bg-transparent border-0 h-14 text-lg focus-visible:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 opacity-95"
                    />
                    <Button
                      onClick={handleGenerate}
                      disabled={loading || !query.trim()}
                      className="h-14 px-8 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl font-semibold transition-all shadow-lg dark:shadow-none"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Launch
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.section>
          ) : (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-12">
                <div>
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                    <History className="w-4 h-4" />
                    Archive Retrieved
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold dark:text-white tracking-tight">
                    {timelineResponse?.title || query}
                  </h2>
                </div>
                <Button variant="outline" onClick={() => setIsGenerated(false)} className="300 rounded-full px-6">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset Sequence
                </Button>
              </div>
              <Timeline data={formattedTimelineData} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}