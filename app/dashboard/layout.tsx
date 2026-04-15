import type { ReactNode } from "react";

import { headers } from "next/headers";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { PageShell } from "@/components/layout/page-shell";
import { requireUser } from "@/lib/auth/user";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") ?? "/dashboard";

  return (
    <main className="pb-8 pt-4 sm:pt-6">
      <PageShell>
        <div className="grid gap-4 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-6">
          <DashboardSidebar currentPath={currentPath} />
          <div className="space-y-4 lg:space-y-6">
            <DashboardTopbar user={user} />
            {children}
          </div>
        </div>
      </PageShell>
    </main>
  );
}
