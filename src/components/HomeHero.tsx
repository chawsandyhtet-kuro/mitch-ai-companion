import { ArrowRight, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { MascotImage } from "./MascotImage";

interface HomeHeroProps {
  onStartChatting: (initialPrompt?: string) => void;
}

const HIGHLIGHTS = [
  {
    title: "Study & Everyday Peer",
    detail: "Plan 45-min focus sprints, trivia, workouts, or talk about your day.",
    prompt: "Help me plan a focused 45-minute study session with Mitch.",
    icon: BookOpen,
  },
  {
    title: "10m Check-In & 30m Limit",
    detail: "Gentle 10-minute pause prompt and 30-minute wrap-up protect screen balance.",
    prompt: "Give me a quick 10-minute break activity before I get back to work.",
    icon: Clock,
  },
  {
    title: "Strictly Platonic",
    detail: "Healthy, honest AI boundaries designed to support real-world friendships.",
    prompt: "What are some healthy ways to manage exam stress this week?",
    icon: ShieldCheck,
  },
];

export function HomeHero({ onStartChatting }: HomeHeroProps) {
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col justify-between overflow-hidden px-4 pt-4 pb-24 sm:px-8 md:pb-8 lg:min-h-[calc(100vh-5rem)] lg:py-0">
      {/* Main Hero Center + Interactive Highlights */}
      <div className="relative z-20 mx-auto flex w-full max-w-3xl flex-col items-center pt-4 text-center sm:pt-8 lg:pt-10">
        <h1
          className="font-display font-extrabold tracking-tight text-[#111F21] dark:text-white leading-[1.06]"
          style={{
            fontSize: "clamp(2.35rem, 4.5vw, 4.1rem)",
            textWrap: "balance",
          }}
        >
          Hi! I&apos;m Mitch.
          <br />
          Your AI Companion.
        </h1>

        <p className="mt-3.5 text-lg sm:text-xl text-slate-700 dark:text-slate-200">
          Ready to talk about your day?
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => onStartChatting()}
            className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-[#0D8B8B] px-9 py-3 text-base font-medium text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0A7373] dark:bg-[#0F9A9A] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2"
          >
            <span>Start Chatting</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>

        {/* Compact 3-Column Feature Strip so the center stage feels rich and balanced */}
        <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-9">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => onStartChatting(item.prompt)}
                className="group flex flex-col items-start rounded-2xl border border-slate-200/90 bg-white/90 p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0D8B8B]/60 dark:border-teal-900/60 dark:bg-[#17292C]/90 dark:hover:border-teal-500/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B]"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.detail}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Robot Pair (< lg) */}
      <div className="mt-8 flex items-end justify-between gap-4 px-2 lg:hidden">
        <MascotImage
          variant="sitting"
          alt="Mitch robot sitting cross-legged and winking"
          className="h-44 w-36 sm:h-56 sm:w-48"
        />
        <MascotImage
          variant="waving"
          alt="Mitch robot smiling and waving"
          className="h-52 w-44 sm:h-64 sm:w-56"
        />
      </div>

      {/* Desktop Bottom-Left & Bottom-Right Robots + Striped Teal Circle Accent (>= lg) */}
      <div className="pointer-events-none relative hidden lg:block lg:h-[270px] xl:h-[310px] w-full">
        {/* Striped teal circle accent next to waving robot's hand */}
        <svg
          aria-hidden="true"
          className="absolute right-[265px] xl:right-[315px] bottom-[210px] xl:bottom-[250px] h-12 w-12 text-[#0D8B8B]"
          viewBox="0 0 48 48"
          fill="none"
        >
          <defs>
            <pattern id="hero-stripe-accent" width="5" height="5" patternUnits="userSpaceOnUse">
              <line x1="0" y1="2" x2="5" y2="2" stroke="currentColor" strokeWidth="1.8" />
            </pattern>
          </defs>
          <circle cx="24" cy="24" r="22" fill="url(#hero-stripe-accent)" />
        </svg>

        <div className="absolute bottom-0 left-2 xl:left-6">
          <MascotImage
            variant="sitting"
            alt="Mitch robot sitting cross-legged and winking"
            className="h-[260px] w-[225px] xl:h-[305px] xl:w-[265px]"
          />
        </div>

        <div className="absolute right-0 bottom-0">
          <MascotImage
            variant="waving"
            alt="Mitch robot smiling and waving"
            className="h-[310px] w-[285px] xl:h-[365px] xl:w-[340px]"
          />
        </div>
      </div>
    </section>
  );
}
