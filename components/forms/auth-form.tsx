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
  footerHref: string;
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
    <Card className="w-full max-w-lg border-white/80 bg-white/95">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5" method="post">
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
        <p className="mt-6 text-sm text-muted-foreground">
          {footerLabel}{" "}
          <Link className="font-medium text-primary" href={footerHref}>
            {footerLinkText}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
