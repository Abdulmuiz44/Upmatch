import { BriefcaseBusiness, ShieldCheck } from "lucide-react";

import { UpmatchLogo } from "@/components/brand/upmatch-logo";
import { AuthForm } from "@/components/forms/auth-form";
import { PageShell } from "@/components/layout/page-shell";

export default async function SignupPage({
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
            <div className="eyebrow w-fit">Get started</div>
            <div className="space-y-4">
              <h1 className="page-title max-w-xl">
                Build a disciplined pipeline for better-fit Upwork opportunities.
              </h1>
              <p className="body-lg max-w-xl">
                Create your account to save ranking preferences, sync your profile later, and keep
                your search process grounded in clarity rather than automation.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="app-surface-muted flex items-start gap-3 p-4 text-sm text-muted-foreground">
                <BriefcaseBusiness className="mt-0.5 h-5 w-5 text-primary" />
                Preference-aware ranking for a workflow that feels operational, not noisy.
              </div>
              <div className="app-surface-muted flex items-start gap-3 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                Compliance-first product boundaries with manual final action on Upwork.
              </div>
            </div>
          </section>
          <div className="flex justify-center lg:justify-end">
            <AuthForm
              action="/api/auth/signup"
              description="Create your product account and start shaping your job pipeline."
              error={params.error}
              footerHref="/login"
              footerLabel="Already have an account?"
              footerLinkText="Sign in"
              includeFullName
              submitLabel="Create account"
              title="Start with Upmatch"
            />
          </div>
        </div>
      </PageShell>
    </main>
  );
}
