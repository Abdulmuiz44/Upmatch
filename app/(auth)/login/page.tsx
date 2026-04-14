import { ShieldCheck, Sparkles } from "lucide-react";

import { UpmatchLogo } from "@/components/brand/upmatch-logo";
import { AuthForm } from "@/components/forms/auth-form";
import { PageShell } from "@/components/layout/page-shell";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="pb-10 pt-5 sm:pb-20 sm:pt-6">
      <PageShell className="space-y-6 sm:space-y-8">
        <UpmatchLogo />
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8">
          <section className="space-y-5 sm:space-y-6">
            <div className="eyebrow w-fit">Freelancer workflow</div>
            <div className="space-y-4">
              <h1 className="page-title max-w-xl">
                Return to a calm job intelligence workspace.
              </h1>
              <p className="body-lg max-w-xl">
                Upmatch keeps your workflow focused: connect Upwork, review explainable matches,
                and apply manually with confidence.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="app-surface-muted flex items-start gap-3 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                Official API-first architecture with human-in-control actions.
              </div>
              <div className="app-surface-muted flex items-start gap-3 p-4 text-sm text-muted-foreground">
                <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                Explainable ranking and cleaner decision-making for serious freelancers.
              </div>
            </div>
          </section>
          <div className="flex justify-center lg:justify-end">
            <AuthForm
              action="/api/auth/login"
              description="Access your private Upmatch workspace."
              error={params.error}
              footerHref="/signup"
              footerLabel="Need an account?"
              footerLinkText="Create one"
              submitLabel="Sign in"
              title="Welcome back"
            />
          </div>
        </div>
      </PageShell>
    </main>
  );
}
