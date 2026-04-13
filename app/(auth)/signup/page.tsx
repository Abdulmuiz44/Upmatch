import { AuthForm } from "@/components/forms/auth-form";
import { PageShell } from "@/components/layout/page-shell";

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="py-20">
      <PageShell className="flex justify-center">
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
      </PageShell>
    </main>
  );
}
