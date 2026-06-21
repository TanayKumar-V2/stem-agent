export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
      <main className="flex flex-col items-center text-center gap-8 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl text-primary">
          STEM Agent
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Your intelligent co-pilot for Science, Technology, Engineering & Mathematics.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-primary text-primary-foreground gap-2 hover:bg-primary/90 text-sm sm:text-base h-12 px-8 font-medium shadow-sm"
            href="/chat"
          >
            Get Started
          </a>
          <a
            className="rounded-full border border-solid border-border transition-colors flex items-center justify-center hover:bg-muted text-sm sm:text-base h-12 px-8 font-medium"
            href="/pricing"
          >
            View Pricing
          </a>
        </div>
      </main>
      <footer className="mt-24 text-sm text-muted-foreground">
        © {new Date().getFullYear()} STEM Agent. All rights reserved.
      </footer>
    </div>
  );
}
