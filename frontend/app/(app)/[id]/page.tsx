'use client'

import { useParams } from 'next/navigation'
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LearnPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  console.log("Folder ID:", params.id)
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Dot Grid Background */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-size-[40px_40px]",
          "bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      <div className="main z-10 relative">

        <Button variant="default" onClick={() => router.push(`/${params.id}/quiz`)}>Attend A Quiz</Button>
      </div>

    </div>
  )
}