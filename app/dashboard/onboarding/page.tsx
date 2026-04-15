import { BriefcaseBusiness, CircleDollarSign, Filter, Sparkles } from "lucide-react";

import { saveOnboardingPreferences } from "@/app/dashboard/onboarding/actions";
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth/user";
import { getUserPreferences } from "@/server/services/preferences-service";

export default async function OnboardingPage() {
  const user = await requireUser();
  const preference = await getUserPreferences(user.id);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Preferences"
        title="Shape how Upmatch decides what is worth your attention."
        description="Set the role, keyword, budget, and contract signals that define your ideal opportunity profile."
      />

      <form action={saveOnboardingPreferences} className="grid gap-6">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Role and keyword targeting</CardTitle>
                  <CardDescription>
                    Keep this concise and specific so the ranking engine can stay sharp.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="preferredRoles">Preferred role labels</Label>
                <p className="text-sm text-muted-foreground">
                  Examples: React engineer, product designer, analytics lead.
                </p>
                <Textarea
                  defaultValue={preference?.preferredRoles.join(", ")}
                  id="preferredRoles"
                  name="preferredRoles"
                  placeholder="React engineer, TypeScript frontend lead, AI product designer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredKeywords">Preferred keywords</Label>
                <p className="text-sm text-muted-foreground">
                  Include domain terms, stack terms, and project styles you want more of.
                </p>
                <Textarea
                  defaultValue={preference?.preferredKeywords.join(", ")}
                  id="preferredKeywords"
                  name="preferredKeywords"
                  placeholder="Next.js, React, dashboard, analytics, TypeScript"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excludedKeywords">Excluded keywords</Label>
                <p className="text-sm text-muted-foreground">
                  Filter out roles or patterns that waste your review time.
                </p>
                <Textarea
                  defaultValue={preference?.excludedKeywords.join(", ")}
                  id="excludedKeywords"
                  name="excludedKeywords"
                  placeholder="commission-only, cold calling, adult, crypto spam"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Budget and contract fit</CardTitle>
                    <CardDescription>
                      Use minimums that reflect the floor for work worth reviewing.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minimumHourlyRateUsd">Minimum hourly rate (USD)</Label>
                  <Input
                    defaultValue={preference?.minimumHourlyRateUsd?.toString() ?? ""}
                    id="minimumHourlyRateUsd"
                    min="0"
                    name="minimumHourlyRateUsd"
                    placeholder="75"
                    step="1"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumFixedBudgetUsd">Minimum fixed budget (USD)</Label>
                  <Input
                    defaultValue={preference?.minimumFixedBudgetUsd?.toString() ?? ""}
                    id="minimumFixedBudgetUsd"
                    min="0"
                    name="minimumFixedBudgetUsd"
                    placeholder="1500"
                    step="1"
                    type="number"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="contractType">Contract type preference</Label>
                  <Select
                    defaultValue={preference?.contractType ?? "BOTH"}
                    id="contractType"
                    name="contractType"
                  >
                    <option value="BOTH">Both</option>
                    <option value="HOURLY">Hourly only</option>
                    <option value="FIXED_PRICE">Fixed price only</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                    <Filter className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Industry focus</CardTitle>
                    <CardDescription>
                      Add a few sectors or buyer contexts that consistently fit your work.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="preferredIndustries">Preferred industries</Label>
                <Textarea
                  defaultValue={preference?.preferredIndustries.join(", ")}
                  id="preferredIndustries"
                  name="preferredIndustries"
                  placeholder="B2B SaaS, developer tools, healthcare, fintech"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="app-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-primary" />
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              These signals directly influence job ingestion and ranking. Keep them focused so the
              product stays selective rather than broad.
            </p>
          </div>
          <Button size="lg" type="submit">
            Save preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
