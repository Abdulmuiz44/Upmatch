import Link from "next/link";

import { UpmatchLogo } from "@/components/brand/upmatch-logo";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#product-preview", label: "Product" },
  { href: "#compliance", label: "Compliance" }
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07090d]/80 backdrop-blur-xl">
      <PageShell className="flex h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <UpmatchLogo theme="dark" />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/55 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-white/80 hover:bg-white/10 hover:text-white"
            )}
            href="/login"
          >
            Log in
          </Link>
          <Link
            className={cn(
              buttonVariants({ size: "sm" }),
              "border-white/10 bg-white text-black hover:bg-white/90"
            )}
            href="/signup"
          >
            Sign up
          </Link>
        </div>
      </PageShell>
    </header>
  );
}
