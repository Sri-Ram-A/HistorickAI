"use client";


export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 m-6">
        <header className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            Welcome to HistorickAI
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Select a notebook to proceed forward
          </p>

        </header>
      </main>
    </div>
  );
}