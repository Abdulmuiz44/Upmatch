import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const pillars = [
  {
    title: "Official API posture",
    description:
      "Designed for OAuth 2.0, GraphQL, tenant-aware requests, and conservative caching."
  },
  {
    title: "Signal over noise",
    description:
      "Turn loose preferences and freelancer context into an explainable matched jobs workspace."
  },
  {
    title: "Human-in-control workflow",
    description:
      "Upmatch assists with decisions and proposal guidance, but final application remains on Upwork."
  }
];

export default function LandingPage() {
  return (
    <main className="pb-24 pt-8">
      <PageShell>
        <header className="flex items-center justify-between rounded-[28px] border bg-white/85 px-6 py-5 shadow-soft">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Upmatch
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Compliance-first Upwork job intelligence copilot
            </p>
          </div>
          <div className="flex gap-3">
            <Link className={cn(buttonVariants({ variant: "ghost" }))} href="/login">
              Log in
            </Link>
            <Link className={cn(buttonVariants({ size: "default" }))} href="/signup">
              Get started
            </Link>
          </div>
        </header>

        <section className="grid gap-12 px-2 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <Badge>Foundation slice implemented</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-foreground lg:text-6xl">
              Find the right Upwork jobs faster, without crossing compliance lines.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Upmatch gives freelancers a disciplined workspace for account
              connection, fit preferences, matched opportunities, and proposal
              guidance. It is built for official APIs and manual final action.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className={cn(buttonVariants({ size: "lg" }))} href="/signup">
                Create account
              </Link>
              <Link
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
                href="/dashboard"
              >
                View dashboard shell
              </Link>
            </div>
          </div>

          <Card className="border-white/80 bg-white/92">
            <CardHeader>
              <CardTitle>What the MVP covers</CardTitle>
              <CardDescription>
                A serious starting point for job discovery and proposal support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-2xl bg-secondary p-4">
                Connect Upwork through OAuth, save preferences, and review a
                protected dashboard shaped for ranking and action.
              </div>
              <div className="rounded-2xl border p-4">
                The product does not auto-apply, submit proposals, scrape pages, or
                automate Connects.
              </div>
              <Button className="w-full" variant="secondary">
                Designed for explainable matching
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Card className="border-white/75 bg-white/88" key={pillar.title}>
              <CardHeader>
                <CardTitle>{pillar.title}</CardTitle>
                <CardDescription>{pillar.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </PageShell>
    </main>
  );
}
