import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  title: string;
  description: string;
  action: string;
  submitLabel: string;
  footerLabel: string;
  footerHref: Route;
  footerLinkText: string;
  includeFullName?: boolean;
  error?: string;
};

export function AuthForm({
  title,
  description,
  action,
  submitLabel,
  footerLabel,
  footerHref,
  footerLinkText,
  includeFullName = false,
  error
}: AuthFormProps) {
  return (
    <Card className="w-full max-w-xl border-border/70 bg-white/92 shadow-panel">
      <CardHeader className="px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
        <div className="eyebrow w-fit">Private workspace</div>
        <CardTitle className="pt-2 text-[1.75rem] leading-tight sm:text-[2.3rem]">{title}</CardTitle>
        <CardDescription className="max-w-md text-sm leading-6 sm:text-[15px] sm:leading-7">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5 sm:space-y-6 sm:px-6 sm:pb-6">
        <div className="grid gap-3 rounded-2xl border border-border/70 bg-secondary/60 p-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
            <span>Manual apply flow only</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <span>Clear ranking and preference control</span>
          </div>
        </div>
        <form action={action} className="space-y-4 sm:space-y-5" method="post">
          {includeFullName ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Jordan Smith" />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete={includeFullName ? "new-password" : "current-password"}
              id="password"
              name="password"
              required
              type="password"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" size="lg" type="submit">
            {submitLabel}
          </Button>
        </form>
        <p className="text-sm leading-6 text-muted-foreground">
          {footerLabel}{" "}
          <Link className="font-semibold text-primary" href={footerHref}>
            {footerLinkText}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
