import { saveOnboardingPreferences } from "@/app/dashboard/onboarding/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card>
      <CardHeader>
        <CardTitle>Preference onboarding</CardTitle>
        <CardDescription>
          Define the inputs that future job retrieval and ranking will use.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveOnboardingPreferences} className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferredRoles">Preferred role labels</Label>
            <Textarea
              defaultValue={preference?.preferredRoles.join(", ")}
              id="preferredRoles"
              name="preferredRoles"
              placeholder="React engineer, TypeScript frontend lead, AI product designer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractType">Contract type preference</Label>
            <Select defaultValue={preference?.contractType ?? "BOTH"} id="contractType" name="contractType">
              <option value="BOTH">Both</option>
              <option value="HOURLY">Hourly only</option>
              <option value="FIXED_PRICE">Fixed price only</option>
            </Select>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="preferredKeywords">Preferred keywords</Label>
            <Textarea
              defaultValue={preference?.preferredKeywords.join(", ")}
              id="preferredKeywords"
              name="preferredKeywords"
              placeholder="Next.js, React, dashboard, analytics, TypeScript"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excludedKeywords">Excluded keywords</Label>
            <Textarea
              defaultValue={preference?.excludedKeywords.join(", ")}
              id="excludedKeywords"
              name="excludedKeywords"
              placeholder="commission-only, cold calling, adult, crypto spam"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredIndustries">Preferred industries</Label>
            <Textarea
              defaultValue={preference?.preferredIndustries.join(", ")}
              id="preferredIndustries"
              name="preferredIndustries"
              placeholder="B2B SaaS, developer tools, healthcare, fintech"
            />
          </div>
          <div className="flex items-end">
            <Button size="lg" type="submit">
              Save onboarding preferences
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
