import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  HeartOff,
  ShieldCheck,
  XCircle,
} from "lucide-react";

interface WhyChooseMitchProps {
  onStartChatting: () => void;
}

const PILLARS = [
  {
    number: "01",
    title: "Transparent Platonic Role",
    description:
      "Mitch clearly identifies as an AI study peer from the first message and politely declines romantic, flirtatious, or explicit roleplay.",
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
    title: "Gentle 10m Check-In & 30m Cap",
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
    <section className="mx-auto w-full max-w-5xl px-4 pt-8 pb-24 sm:px-6 md:py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-wide text-[#0D8B8B] dark:text-teal-300">
          Ethical Design Comparison
        </p>
        <h1
          className="font-display mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl"
          style={{ textWrap: "balance" }}
        >
          Built to support your day, never to replace your life
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Many companion chatbots blur personal boundaries to increase daily engagement. Mitch takes the opposite path: clear expectations, honest timing, and real-world balance.
        </p>
      </div>

      {/* 4 Core Pillars */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article
              key={pillar.number}
              className="rounded-3xl border border-slate-200 bg-white p-6 transition-colors hover:border-teal-300 dark:border-slate-800 dark:bg-[#131E23] dark:hover:border-teal-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                  {pillar.number}
                </span>
                <Icon className="h-5 w-5 text-[#0D8B8B] dark:text-teal-300" />
              </div>
              <h2 className="font-display mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                {pillar.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {pillar.description}
              </p>
            </article>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#131E23]">
        <div className="border-b border-slate-200 bg-[#CDD5DD]/45 px-6 py-4 dark:border-slate-800 dark:bg-[#0F181C]">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            Mitch vs. Engagement-Driven Companion Bots
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-6 py-3.5">Design Dimension</th>
                <th className="px-6 py-3.5 text-[#0D8B8B] dark:text-teal-300">
                  Mitch (Ethical Peer)
                </th>
                <th className="px-6 py-3.5">Addictive / Romantic Bots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.dimension} className="align-top">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {row.dimension}
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0D8B8B] dark:text-teal-400" />
                      <span>{row.mitch}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <div className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                      <span>{row.other}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex justify-start">
        <button
          type="button"
          onClick={onStartChatting}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0D8B8B] dark:bg-[#119E9E] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A7373] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2"
        >
          <span>Try a Study Session with Mitch</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </section>
  );
}
