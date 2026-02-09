'use client'

import { useParams, useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Video,
  FileQuestion,
  MessageSquare,
  Timer,
  Network,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react"

interface FeatureCard {
  title: string
  description: string
  route: string
  image: string
  badge: {
    text: string
    variant: "default" | "secondary" | "destructive" | "outline"
    color: string
  }
  color: string
  icon: any
}

export default function LearnPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const features: FeatureCard[] = [
    {
      title: "Explanatory Video",
      description: "Generate AI-powered video explanations for complex topics",
      route: `/${params.id}/video`,
      image: "/images/animals/lion.png",
      badge: { text: "Create", variant: "default", color: "bg-purple-500" },
      icon: Video,
      color: "text-purple-500"
    },
    {
      title: "Take Assessment",
      description: "Practice with basic tests or comprehensive question papers",
      route: `/${params.id}/quiz`,
      image: "/images/animals/tiger.png",
      badge: { text: "Practice", variant: "default", color: "bg-blue-500" },
      icon: FileQuestion,
      color: "text-blue-500"
    },
    {
      title: "Chat with Documents",
      description: "Upload files and have intelligent conversations about content",
      route: "chat",
      image: "/images/animals/bear.png",
      badge: { text: "AI Chat", variant: "default", color: "bg-green-500" },
      icon: MessageSquare,
      color: "text-green-500"
    },
    {
      title: "Event Timeline",
      description: "Create interactive timelines to visualize historical events",
      route: `/${params.id}/timeline`,
      image: "/images/animals/wolf.png",
      badge: { text: "Visualize", variant: "default", color: "bg-orange-500" },
      icon: Timer,
      color: "text-orange-500"
    },
    {
      title: "Diagrams",
      description: "Build beautiful visuals for better understanding",
      route: `/${params.id}/draw`,
      image: "/images/animals/cat.png",
      badge: { text: "Draw", variant: "default", color: "bg-cyan-500" },
      icon: Network,
      color: "text-cyan-500"
    },
    {
      title: "Flowcharts",
      description: "Build concept maps and flowcharts for better understanding",
      route: `/${params.id}/chart`,
      image: "/images/animals/bird.png",
      badge: { text: "Design", variant: "default", color: "bg-red-500" },
      icon: Network,
      color: "text-red-500"
    },
    {
      title: "Scrapbook",
      description: "Review your saved notes, highlights, and study materials",
      route: `/${params.id}/scrapbook`,
      image: "/images/animals/dog.png",
      badge: { text: "Review", variant: "default", color: "bg-pink-500" },
      icon: BookOpen,
      color: "text-pink-500"
    },
    {
      title: "AI Teacher",
      description: "Converse with an AI tutor for personalized learning support",
      route: `/${params.id}/teacher`,
      image: "/images/animals/elephant.png",
      badge: { text: "Learn", variant: "default", color: "bg-amber-500" },
      icon: GraduationCap,
      color: "text-amber-500"
    },
  ]

  const handleCardClick = (route: string) => {
    router.push(route)
  }

  // Replace your current JSX return structure with this:

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/children-running.png"
          alt="Running children background"
          className="w-full h-full object-cover"
        />
        {/* Optional linear overlay for better readability */}
        <div className="absolute inset-0 bg-linear-to-b from-white/60 via-white/40 to-white/80 dark:from-slate-950/70 dark:via-slate-900/60 dark:to-slate-950/80" />
      </div>

      {/* Content - using z-10 to appear above background */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-7xl">

          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
              <span className="text-sm font-medium text-primary">Learning Hub</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Choose Your Learning Path
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Explore AI-powered tools designed to enhance your learning experience
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group relative h-100 w-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-slate-200 dark:border-slate-800"
                  onClick={() => handleCardClick(feature.route)}
                >
                  {/* Image Section */}
                  <div className="p-0">
                    <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="h-full w-full object-fill rounded-xl transition-transform duration-500 group-hover:scale-110"
                      />


                      {/* Icon Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-full ">
                        <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 ">
                        <Badge
                          className={cn(
                            "text-white border-0 font-semibold w-15 h-6",
                            feature.badge.color
                          )}
                        >
                          {feature.badge.text}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="p-0 mb-2">
                      <span className={cn("text-white text-2xl font-bold p-1 rounded opacity-90 bg-", feature.badge.color)}>
                        {feature.title}
                      </span>
                    </div>
                    <div className="p-0">
                      <span className={cn(`text-sm font-semibold p-0.5 rounded-xl leading-relaxed ${feature.color} bg-white/80`)}>
                        {feature.description}
                      </span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-lg transition-colors pointer-events-none" />
                </div>
              )
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              All tools are powered by AI to provide personalized learning experiences
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}