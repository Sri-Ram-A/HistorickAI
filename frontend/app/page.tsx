"use client"
import { useRouter } from 'next/navigation';
import Aurora from '@/components/Aurora';
import { Button } from '@/components/ui/button';
export default function HomePage() {
  const router = useRouter()

  return (
    <main id="parent-bg" className="relative flex min-h-screen overflow-hidden bg-black">

      <div id="aurora-bg" className='absolute inset-0'>
      <Aurora
        colorStops={["#ffbf66", "#B19EEF", "#5227FF"]}
        blend={0.5}
        amplitude={3.0}
        speed={1}
      />
      </div>

      <div id="front-bg" className="relative z-10 flex flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="mb-4 text-5xl font-bold">Welcome to HistorickAI</h1>
        <p className="mb-8 max-w-xl text-lg">
          Unlock the power of your historical documents with AI-driven insights and analysis.
        </p>
        <div className="button-container flex gap-4">
        <Button
          size="lg"
          onClick={() => router.push('/register')}
        >
          Register
        </Button>
        <Button
          size="lg"
          onClick={() => router.push('/login')}
        >
          Login
        </Button>
        </div>
      </div>

    </main>
  );
}
