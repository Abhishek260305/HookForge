import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.95_0.02_250),_transparent_55%),linear-gradient(to_bottom,_oklch(0.99_0_0),_oklch(0.96_0.01_240))]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold tracking-tight">Hookforge</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button size="sm" render={<Link href="/overview" />}>
            Open dashboard
          </Button>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 pb-24">
        <p className="text-sm font-medium text-muted-foreground">Durable workflows</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Hookforge
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Ingest events, run versioned DAG workflows, and deliver signed webhooks
          with retries, timelines, and replay.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" render={<Link href="/overview" />}>
            Dashboard
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/workflows" />}>
            Workflows
          </Button>
        </div>
      </main>
    </div>
  );
}
