import {
  ArrowRight,
  BookOpen,
  Clock,
  Coffee,
  Compass,
  HeartHandshake,
  MessageSquareHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MascotImage } from "./MascotImage";

interface HomeHeroProps {
  onStartChatting: (initialPrompt?: string) => void;
  onExploreWhy: () => void;
}

const QUICK_STARTERS = [
  {
    label: "Plan a 45-min study sprint",
    prompt: "Help me plan a focused 45-minute study session with Mitch.",
  },
  {
    label: "Feeling overwhelmed",
    prompt:
      "I'm feeling overwhelmed with everything on my plate today. Can we break it down?",
  },
  {
    label: "Fun Eiffel Tower facts",
    prompt: "Tell me some cool, surprising facts about the Eiffel Tower!",
  },
];

const CAPABILITIES = [
  {
    title: "45-Min Study Plans",
    description:
      "Turn looming assignments into clear, achievable focus blocks with realistic breaks.",
    prompt: "Help me build a 45-minute study plan for an exam tomorrow.",
    icon: BookOpen,
  },
  {
    title: "Talk Through Stress",
    description:
      "Unpack a hectic day calmly with a peer who listens without hype or judgment.",
    prompt: "I had a stressful day and want help sorting out what to tackle first.",
    icon: HeartHandshake,
  },
  {
    title: "Trivia, Trips & Workouts",
    description:
      "Ask about landmarks, weekend itineraries, or a 10-minute desk-break stretch routine.",
    prompt: "Give me a quick 10-minute desk workout and stretch routine.",
    icon: Compass,
  },
  {
    title: "Strict Platonic Guardrails",
    description:
      "Honest about being software, respectful of boundaries, and supportive of offline friends.",
    prompt: "How do you help users keep healthy screen-time boundaries?",
    icon: ShieldCheck,
  },
];

const SESSION_MILESTONES = [
  {
    time: "00:00",
    title: "Focused Check-In",
    detail:
      "Set a clear study goal, ask a curiosity question, or talk through what is on your mind.",
    icon: MessageSquareHeart,
  },
  {
    time: "10:00",
    title: "Mindful Break Prompt",
    detail:
      "At 10 minutes, Mitch pauses the clock and asks if you want to step away for a short walk.",
    icon: Coffee,
  },
  {
    time: "30:00",
    title: "Automatic Wrap-Up",
    detail:
      "Sessions stop at 30 minutes with an encouraging closing message and quick mood reflection.",
    icon: Clock,
  },
];

export function HomeHero({ onStartChatting, onExploreWhy }: HomeHeroProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-2 pb-24 sm:px-8 md:pb-12">
      {/* 1. Full Editorial Hero Split */}
      <section className="grid grid-cols-1 items-center gap-8 py-4 lg:grid-cols-12 lg:gap-8 lg:py-10">
        {/* Left: Bold Headline, Lead Copy, CTAs & Quick Starters */}
        <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
          {/* Mobile-only top robot greeting so Mitch is visible right at the top on phones */}
          <div className="mb-3 flex flex-col items-center lg:hidden">
            <MascotImage
              variant="waving"
              alt="Mitch robot smiling and waving"
              className="h-36 w-36 sm:h-44 sm:w-44"
            />
          </div>

          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0D8B8B] dark:text-[#2AC5C5]">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Ethical Platonic AI Peer &amp; Study Companion</span>
          </div>

          <h1
            className="font-display mt-2.5 font-extrabold tracking-tight text-[#111F21] dark:text-white leading-[1.03]"
            style={{
              fontSize: "clamp(2.55rem, 5.2vw, 4.75rem)",
              textWrap: "balance",
            }}
          >
            Hi! I&apos;m Mitch.
            <br />
            <span className="text-[#0D8B8B] dark:text-[#23B8B8]">
              Your AI Companion.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-base sm:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
            Ready to talk about your day, organize a 45-minute study sprint, or explore random trivia? Mitch helps you stay focused, calm, and connected to real life—always platonic, never addictive.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:mt-8 lg:justify-start">
            <button
              type="button"
              onClick={() => onStartChatting()}
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-[#0D8B8B] px-7 py-3 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0A7373] dark:bg-[#119E9E] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2"
            >
              <span>Start Chatting</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onExploreWhy}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0D8B8B] hover:text-[#0D8B8B] dark:border-slate-700 dark:bg-[#152427]/90 dark:text-slate-100 dark:hover:border-teal-400 dark:hover:text-teal-300 whitespace-nowrap cursor-pointer"
            >
              Why Choose Mitch
            </button>
          </div>

          {/* Instant Starter Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:mt-7 lg:justify-start">
            <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Try asking:
            </span>
            {QUICK_STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => onStartChatting(starter.prompt)}
                className="inline-flex min-h-[34px] items-center rounded-full border border-slate-200 bg-white/95 px-3.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-[#0D8B8B] hover:text-[#0D8B8B] dark:border-teal-900/70 dark:bg-[#16272A] dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300 whitespace-nowrap cursor-pointer"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Rich Visual Stage featuring Conversation Preview + Desktop Waving Mitch */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-[#F3F8F8]/95 p-5 sm:p-7 shadow-sm dark:border-[#1E3A3D] dark:bg-[#152528]/95">
            {/* Subtle geometric striped circle accent */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute top-4 right-5 h-12 w-12 sm:h-14 sm:w-14 text-[#0D8B8B]/30 dark:text-[#23B8B8]/25"
              viewBox="0 0 56 56"
              fill="none"
            >
              <defs>
                <pattern
                  id="stage-stripes"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="2"
                    x2="6"
                    y2="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </pattern>
              </defs>
              <circle cx="28" cy="28" r="26" fill="url(#stage-stripes)" />
            </svg>

            {/* Sample Dialogue Stack */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#0D8B8B] dark:text-teal-300">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>Platonic Assistant Mode</span>
                </span>
                <span className="font-mono tabular-nums">04:18 / 30:00</span>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#0D8B8B] px-4 py-2.5 text-xs sm:text-sm text-white shadow-xs dark:bg-[#119E9E]">
                  I have two exams tomorrow and zero focus right now.
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-xs sm:text-sm leading-relaxed text-slate-800 shadow-xs dark:bg-[#1D3135] dark:text-slate-100">
                  Let&apos;s pick one topic for a 45-minute sprint first—and take a quick walk when our 10-minute check-in pops up!
                </div>
              </div>
            </div>

            {/* Desktop Waving Mitch anchoring bottom-right of showcase card (hidden on mobile since Mitch greets at top) */}
            <div className="mt-4 flex items-end justify-between gap-4 pt-2">
              <div className="space-y-1 pb-1 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-display text-sm font-bold text-[#111F21] dark:text-white">
                  Honest, supportive, grounded.
                </p>
                <p>No romance hooks. Built-in break reminders.</p>
              </div>
              <div className="hidden lg:block shrink-0">
                <MascotImage
                  variant="waving"
                  alt="Mitch robot smiling and waving"
                  className="h-52 w-52 -mb-7 -mr-2"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Capabilities + Sitting Winking Mitch Spotlight */}
      <section className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:mt-12 lg:grid-cols-12">
        {/* Left Spotlight Card with Sitting Winking Mitch */}
        <div className="flex flex-col justify-between rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-[#F3F8F8]/95 p-6 sm:p-7 dark:border-[#1E3A3D] dark:bg-[#152528]/95 lg:col-span-5">
          <div className="flex items-start justify-between gap-4 lg:block">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#0D8B8B] dark:text-teal-300">
                Designed for Real-Life Balance
              </p>
              <h2 className="font-display mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111F21] dark:text-white">
                Smart like Gemini, mindful like a real friend.
              </h2>
            </div>
            <div className="lg:hidden shrink-0">
              <MascotImage
                variant="sitting"
                alt="Mitch robot sitting cross-legged and winking"
                className="h-28 w-20 sm:h-32 sm:w-24"
              />
            </div>
          </div>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Ask random facts, organize your week, or brainstorm a trip. Unlike retention-driven chatbots, Mitch never pretends to be a romantic partner and nudges you back offline.
          </p>

          <div className="mt-6 flex items-end justify-between gap-4">
            <button
              type="button"
              onClick={() => onStartChatting()}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#0D8B8B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A7373] dark:bg-[#119E9E] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer"
            >
              <span>Open Chat</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <div className="hidden lg:block shrink-0">
              <MascotImage
                variant="sitting"
                alt="Mitch robot sitting cross-legged and winking"
                className="h-48 w-36 -mb-7"
              />
            </div>
          </div>
        </div>

        {/* Right 2x2 Interactive Capability Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          {CAPABILITIES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => onStartChatting(item.prompt)}
                className="group flex flex-col justify-between rounded-[24px] sm:rounded-[26px] border border-slate-200/90 bg-white/95 p-5 sm:p-6 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0D8B8B]/70 dark:border-[#1E3A3D] dark:bg-[#142225]/95 dark:hover:border-teal-500/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B]"
              >
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#0D8B8B] dark:bg-teal-950/80 dark:text-teal-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display mt-4 text-lg font-bold text-[#111F21] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>

                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
                  <span>Try this in chat</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. How Every Session Paces Screen Time */}
      <section className="mt-10 rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-white/90 p-6 sm:p-8 dark:border-[#1E3A3D] dark:bg-[#142225]/90 lg:mt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#0D8B8B] dark:text-teal-300">
              Healthy Session Rhythm
            </p>
            <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight text-[#111F21] dark:text-white">
              Clear time boundaries built into every chat
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Timer starts automatically when you enter Chat with Mitch.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {SESSION_MILESTONES.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.time}
                className="rounded-2xl border border-slate-200/80 bg-[#F8FAFA] p-5 dark:border-[#1E3A3D] dark:bg-[#111F21]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#0D8B8B] dark:text-teal-300 tabular-nums">
                    {step.time}
                  </span>
                  <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="font-display mt-3 text-base font-bold text-[#111F21] dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {step.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Bottom CTA + Grounded Footer */}
      <section className="mt-10 flex flex-col items-center justify-between gap-6 rounded-[28px] sm:rounded-[32px] bg-[#0D8B8B] px-6 py-8 text-white sm:flex-row sm:px-10 dark:bg-[#0E7676] lg:mt-12">
        <div className="text-center sm:text-left">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to plan your day with Mitch?
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-teal-50/90">
            Jump into a focused 10-to-30 minute session anytime—no judgment, no endless hooks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onStartChatting()}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#0A6E6E] shadow-xs transition-transform hover:-translate-y-0.5 hover:bg-teal-50 whitespace-nowrap cursor-pointer"
        >
          <span>Start Chatting</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </section>

      <footer className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row dark:border-[#1E3A3D] dark:text-slate-400">
        <span>Mitch · Ethical Platonic AI Peer &amp; Study Companion</span>
        <span>Rangsit University · Created by Kuro &amp; Bokakae</span>
      </footer>
    </div>
  );
}
