import Link from "next/link";
import {
  ArrowRight,
  BellDot,
  BriefcaseBusiness,
  CheckCircle2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";

import { MarketingMotion } from "@/components/marketing/marketing-motion";

const navItems = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#signals", label: "Signals" },
  { href: "#workflow", label: "Workflow" },
  { href: "#faq", label: "FAQ" }
] as const;

const proofCards = [
  {
    title: "Preference-aware matching",
    body: "Rank jobs by role, keywords, budgets, contract type, and industries you actually want."
  },
  {
    title: "Explainable scoring",
    body: "See the top reasons, warning signals, and score breakdown before spending time on a lead."
  },
  {
    title: "Manual final apply",
    body: "Upmatch helps you evaluate and prepare. The final application always stays on Upwork."
  }
] as const;

const workflow = [
  {
    icon: ShieldCheck,
    title: "Connect safely",
    body: "Bring in your Upwork context through a compliance-first flow built around deliberate user action."
  },
  {
    icon: SlidersHorizontal,
    title: "Define fit",
    body: "Set your preferred roles, keywords, excluded work, contract type, and budget floors once."
  },
  {
    icon: BellDot,
    title: "Review ranked jobs",
    body: "Open a calmer workspace where stronger-fit opportunities rise first and weak ones are easier to dismiss."
  }
] as const;

const faqs = [
  {
    question: "Does Upmatch auto-apply to jobs?",
    answer: "No. Upmatch helps you review jobs and prepare guidance, but the final application remains manual on Upwork."
  },
  {
    question: "What does the score actually mean?",
    answer: "The score reflects how a job aligns with your profile and saved preferences, plus warnings and missing signals."
  },
  {
    question: "Who is this for?",
    answer: "Freelancers who want a more disciplined job review process instead of constantly scanning the feed."
  }
] as const;

function BrandMark() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.05]">
      <div className="h-4 w-4 rounded-full border-2 border-white" />
      <div className="absolute h-1.5 w-1.5 rounded-full bg-white" />
    </div>
  );
}

function MockWorkspace() {
  return (
    <MarketingMotion
      className="relative mx-auto w-full max-w-[22rem] rounded-[2rem] border border-white/10 bg-[#0f1014] p-4 shadow-[0_32px_120px_-50px_rgba(0,0,0,0.9)] sm:max-w-none sm:p-5"
      distance={24}
    >
      <div className="absolute inset-x-10 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_70%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Today</p>
            <p className="mt-1 text-sm font-medium text-white">Ranked opportunity review</p>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Active
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/[0.05] to-transparent p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[11px] font-medium text-sky-200">
              Score 92
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-zinc-300">
              Saved keywords matched
            </span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white sm:text-xl">
            Senior React dashboard rebuild for B2B SaaS analytics team
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Budget clears your floor. Stack aligns with React, TypeScript, analytics, and product
            UI work.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Top reason</p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Strong overlap with your preferred roles, target keywords, and budget requirements.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Warning</p>
            <p className="mt-3 text-sm leading-6 text-amber-100">
              Brief is light on scope detail. Worth clarifying before investing too much time.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {["Connect status", "Preferences", "Proposal guidance"].map((item) => (
            <div
              key={item}
              className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </MarketingMotion>
  );
}

export function MarketingHomepage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#09090b] font-sans text-white selection:bg-white/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:88px_88px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-40 -mx-4 border-b border-white/10 bg-black/60 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex h-18 min-h-[4.5rem] max-w-7xl flex-wrap items-center justify-between gap-3 py-3 sm:h-20 sm:flex-nowrap sm:py-0">
            <Link href="/" className="flex items-center gap-3">
              <BrandMark />
              <span className="text-lg font-semibold tracking-tight">Upmatch</span>
            </Link>

            <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto pb-1 text-sm text-zinc-400 md:order-none md:w-auto md:justify-center md:overflow-visible md:pb-0">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="whitespace-nowrap hover:text-white">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white sm:px-4"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        <section className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <MarketingMotion className="max-w-3xl" mode="appear">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-zinc-400">
                Compliance-first Upwork job intelligence
              </div>
              <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.07em] text-white sm:text-5xl md:text-6xl lg:text-[4.75rem] lg:leading-[0.94]">
                Stop living in the Upwork feed.
                <span className="block text-zinc-500">Review better-fit jobs in a calmer workspace.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
                Upmatch helps freelancers connect their Upwork context, define what a good
                opportunity looks like, and review ranked jobs with clear reasons and warnings
                before applying manually.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white px-5 py-3 text-sm font-medium text-black"
                >
                  Start with Upmatch
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {proofCards.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
                  </div>
                ))}
              </div>
            </MarketingMotion>

            <MockWorkspace />
          </div>
        </section>

        <section id="how-it-works" className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
              One workspace for connection, ranking, and review.
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
              Upmatch is built to reduce noise, not to replace judgment. The product helps you
              inspect better opportunities faster while keeping the final action in your hands.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {workflow.map((item, index) => {
              const Icon = item.icon;

              return (
                <MarketingMotion
                  key={item.title}
                  className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                  delay={index * 0.05}
                  distance={22}
                  amount={0.35}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-[15px]">
                    {item.body}
                  </p>
                </MarketingMotion>
              );
            })}
          </div>
        </section>

        <section id="signals" className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Signals that matter</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Filter with your real standards.
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">
                Upmatch scores jobs against the criteria you actually use when deciding whether a
                lead deserves time.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Preferred role labels and keywords",
                "Minimum hourly and fixed-price thresholds",
                "Industry preferences and excluded work",
                "Warnings, missing signals, and proposal guidance"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <p className="mt-4 text-sm leading-6 text-zinc-300 sm:text-[15px]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="py-16 sm:py-20 lg:py-24">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Why it feels different</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
                Less scrolling. Better judgment.
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
                Upmatch is not trying to spray applications. It is trying to give serious
                freelancers a cleaner operating view of what is worth attention right now.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {[
                {
                  icon: BriefcaseBusiness,
                  title: "Ranked opportunities",
                  body: "See higher-fit jobs first instead of treating the feed as your primary interface."
                },
                {
                  icon: Sparkles,
                  title: "Proposal assistance",
                  body: "Generate advisory guidance and proof points without crossing into automated submission."
                },
                {
                  icon: ShieldCheck,
                  title: "Clear product boundary",
                  body: "The system supports evaluation and preparation, while the final decision and apply step remain yours."
                }
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5"
                  >
                    <Icon className="h-5 w-5 text-white" />
                    <p className="mt-4 text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">FAQ</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Straight answers about the workflow.
              </h2>
            </div>

            <div className="mt-10 grid gap-4">
              {faqs.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                >
                  <h3 className="text-lg font-medium text-white">{item.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-[15px]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
