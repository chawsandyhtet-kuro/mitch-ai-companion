import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  HeartOff,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { MascotImage } from "./MascotImage";

interface WhyChooseMitchProps {
  onStartChatting: () => void;
}

const PILLARS = [
  {
    number: "01",
    title: "Transparent Platonic Role",
    description:
      "Mitch clearly identifies as an AI study peer from the first message and politely redirects romantic, flirtatious, or explicit requests.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Live Session Timer",
    description:
      "An always-visible MM:SS clock tracks your active conversation length so time spent online never slips past unnoticed.",
    icon: Clock,
  },
  {
    number: "03",
    title: "10m Check-In & 30m Cap",
    description:
      "At 10 minutes, Mitch asks if you'd like to pause for a walk; at 30 minutes, the session wraps up automatically to protect offline balance.",
    icon: Coffee,
  },
  {
    number: "04",
    title: "Zero Manipulation",
    description:
      "No guilt-tripping notifications, no sycophantic flattery, and no emotional dependency hooks designed to keep you scrolling.",
    icon: HeartOff,
  },
];

const COMPARISON_ROWS = [
  {
    dimension: "Relationship Boundaries",
    mitch: "Strictly platonic peer & study companion",
    other: "Simulates romance or emotional exclusivity",
  },
  {
    dimension: "Screen-Time Transparency",
    mitch: "Visible MM:SS session duration clock",
    other: "Hidden clocks and endless retention loops",
  },
  {
    dimension: "Offline Encouragement",
    mitch: "10-minute check-in & 30-minute session wrap-up",
    other: "Push alerts urging you to come right back",
  },
  {
    dimension: "Conversation Goal",
    mitch: "Supports study clarity, calm reflection & autonomy",
    other: "Maximizes engagement minutes at any cost",
  },
];

export function WhyChooseMitch({ onStartChatting }: WhyChooseMitchProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-28 sm:px-8 md:pb-12">
      {/* 1. Editorial Hero Split */}
      <section className="grid grid-cols-1 items-center gap-8 py-6 lg:grid-cols-12 lg:py-8">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0D8B8B] dark:text-[#2AC5C5]">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Ethical Design Comparison</span>
          </div>

          <h1
            className="font-display mt-3 font-extrabold tracking-tight text-[#111F21] dark:text-white leading-[1.05]"
            style={{
              fontSize: "clamp(2.25rem, 4.4vw, 3.75rem)",
              textWrap: "balance",
            }}
          >
            Built to support your day,
            <br />
            <span className="text-[#0D8B8B] dark:text-[#23B8B8]">
              never to replace your life.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Many companion chatbots blur personal boundaries to increase daily engagement. Mitch takes the opposite path: clear expectations, honest timing, and real-world balance.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={onStartChatting}
              className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#0D8B8B] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0A7373] dark:bg-[#119E9E] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2"
            >
              <span>Try a Study Session with Mitch</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right: Ethical Commitment Spotlight Card */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-[#F3F8F8]/95 p-6 sm:p-7 dark:border-[#1E3A3D] dark:bg-[#152528]/95">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-[#0D8B8B] dark:text-teal-300">
                Mitch&apos;s Core Promise
              </p>
              <h2 className="font-display text-xl font-extrabold text-[#111F21] dark:text-white">
                Healthy AI that cheers for your offline life
              </h2>
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 text-center dark:border-[#244447] dark:bg-[#111F21]">
                  <span className="font-mono text-base font-bold text-[#0D8B8B] dark:text-teal-300">
                    10m
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-600 dark:text-slate-300">
                    Break nudge
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 text-center dark:border-[#244447] dark:bg-[#111F21]">
                  <span className="font-mono text-base font-bold text-[#0D8B8B] dark:text-teal-300">
                    30m
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-600 dark:text-slate-300">
                    Daily cap
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 text-center dark:border-[#244447] dark:bg-[#111F21]">
                  <span className="font-mono text-base font-bold text-[#0D8B8B] dark:text-teal-300">
                    100%
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-600 dark:text-slate-300">
                    Platonic
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="pb-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Built to give clear answers, never emotional traps.
              </p>
              <MascotImage
                variant="sitting"
                alt="Mitch robot sitting cross-legged and winking"
                className="h-36 w-28 sm:h-40 sm:w-32 shrink-0 -mb-7"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 Core Pillars Bento Grid */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-6 lg:grid-cols-4">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article
              key={pillar.number}
              className="flex flex-col justify-between rounded-[26px] border border-slate-200/90 bg-white/95 p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0D8B8B]/60 dark:border-[#1E3A3D] dark:bg-[#142225]/95 dark:hover:border-teal-500/60"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#0D8B8B] dark:bg-teal-950/80 dark:text-teal-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                    {pillar.number}
                  </span>
                </div>
                <h2 className="font-display mt-4 text-lg font-bold text-[#111F21] dark:text-white">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {pillar.description}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {/* 3. Side-by-Side Comparison Bento Card */}
      <section className="mt-8 overflow-hidden rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-white/95 dark:border-[#1E3A3D] dark:bg-[#142225]/95 lg:mt-10">
        <div className="border-b border-slate-200/90 bg-[#F3F8F8] px-6 py-5 dark:border-[#1E3A3D] dark:bg-[#152528]">
          <p className="text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
            Side-by-Side Breakdown
          </p>
          <h2 className="font-display mt-1 text-xl sm:text-2xl font-extrabold text-[#111F21] dark:text-white">
            Mitch vs. Engagement-Driven Companion Bots
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/90 text-xs font-semibold text-slate-500 dark:border-[#1E3A3D] dark:text-slate-400">
                <th className="px-6 py-4">Design Dimension</th>
                <th className="px-6 py-4 text-[#0D8B8B] dark:text-teal-300">
                  Mitch (Ethical Peer)
                </th>
                <th className="px-6 py-4">Addictive / Romantic Bots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E3A3D]/70">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.dimension} className="align-top">
                  <td className="px-6 py-4 font-semibold text-[#111F21] dark:text-white">
                    {row.dimension}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-200">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0D8B8B] dark:text-teal-400" />
                      <span>{row.mitch}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <div className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                      <span>{row.other}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Bottom CTA + Grounded Footer */}
      <section className="mt-8 flex flex-col items-center justify-between gap-6 rounded-[28px] sm:rounded-[32px] bg-[#0D8B8B] px-6 py-8 text-white sm:flex-row sm:px-10 dark:bg-[#0E7676] lg:mt-10">
        <div className="text-center sm:text-left">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Experience ethical AI support yourself
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-teal-50/90">
            Start a quick 10-minute focus session or test Mitch&apos;s platonic guardrails in live chat.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartChatting}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0A6E6E] shadow-xs transition-transform hover:-translate-y-0.5 hover:bg-teal-50 whitespace-nowrap cursor-pointer"
        >
          <span>Chat with Mitch</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </section>

      <footer className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 pt-6 text-xs text-slate-600 sm:flex-row dark:border-[#1E3A3D] dark:text-slate-300">
        <span>Mitch · Ethical Platonic AI Peer &amp; Study Companion · Rangsit University</span>
        <span className="font-semibold text-[#111F21] dark:text-white">
          Created by Kuro &amp; Bokakae
        </span>
      </footer>
    </div>
  );
}
