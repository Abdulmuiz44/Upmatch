import { AuthForm } from "@/components/forms/auth-form";
import { PageShell } from "@/components/layout/page-shell";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="py-20">
      <PageShell className="flex justify-center">
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
      </PageShell>
    </main>
  );
}
