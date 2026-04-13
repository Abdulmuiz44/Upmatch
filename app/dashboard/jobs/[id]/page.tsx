import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Matched job detail placeholder</CardTitle>
            <Badge>{id}</Badge>
          </div>
          <CardDescription>
            This route is reserved for the normalized jobs table, score
            explanations, save or dismiss actions, and proposal guidance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-2xl border p-4">
            Future modules here: normalized job attributes, explainable score
            breakdown, profile-fit notes, and proposal talking points.
          </div>
          <div className="flex flex-wrap gap-3">
            <form action={`/api/jobs/${id}/save`} method="post">
              <button className={cn(buttonVariants({ size: "default" }))} type="submit">
                Save placeholder
              </button>
            </form>
            <form action={`/api/jobs/${id}/dismiss`} method="post">
              <button
                className={cn(buttonVariants({ variant: "outline", size: "default" }))}
                type="submit"
              >
                Dismiss placeholder
              </button>
            </form>
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "default" }))}
              href="/dashboard"
            >
              Back to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
