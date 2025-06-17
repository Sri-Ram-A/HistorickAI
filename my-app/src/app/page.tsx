"use client"
import { WelcomeScreen } from "@/components/welcome-screen"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  return (
    <main className="relative min-h-screen overflow-hidden welcome-gradient">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50" />
      <div className="relative z-10 flex justify-center items-center min-h-screen">
        <WelcomeScreen onStart={() => router.push('/chat')} />
      </div>
    </main>
  )
}