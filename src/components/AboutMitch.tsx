import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { MascotImage } from "./MascotImage";

interface AboutMitchProps {
  onStartChatting: () => void;
}

const PRINCIPLES = [
  {
    title: "Academic & Peer Focus",
    detail:
      "Helps structure study blocks, clarify tough topics, and talk through daily academic pressure without judgment.",
    icon: BookOpen,
  },
  {
    title: "Clear Ethical Guardrails",
    detail:
      "Designed from the ground up to stay strictly platonic, transparent about being software, and respectful of human relationships.",
    icon: Shield,
  },
  {
    title: "Healthy Digital Habits",
    detail:
      "Encourages regular screen breaks, hydration, and offline connection with classmates, friends, and mentors.",
    icon: Sparkles,
  },
];

const CREATORS = [
  {
    name: "Kuro",
    role: "Co-Creator · Product & Experience Design",
    bio: "Focused on crafting a warm, approachable interface and mindful conversation pacing that keeps Mitch helpful without visual clutter.",
  },
  {
    name: "Bokakae",
    role: "Co-Creator · Ethical AI & Boundaries Architecture",
    bio: "Focused on platonic guardrail design, transparent session limits, and keeping student wellbeing ahead of engagement metrics.",
  },
];

export function AboutMitch({ onStartChatting }: AboutMitchProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-28 sm:px-8 md:pb-12">
      {/* 1. Editorial Hero Split with Custom About Illustration */}
      <section className="grid grid-cols-1 items-center gap-8 py-6 lg:grid-cols-12 lg:py-8">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0D8B8B] dark:text-[#2AC5C5]">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span>Rangsit University · College of Digital Innovation Technology</span>
          </div>

          <h1
            className="font-display mt-3 font-extrabold tracking-tight text-[#111F21] dark:text-white leading-[1.05]"
            style={{
              fontSize: "clamp(2.25rem, 4.4vw, 3.75rem)",
              textWrap: "balance",
            }}
          >
            Meet Mitch: a study companion
            <br />
            <span className="text-[#0D8B8B] dark:text-[#23B8B8]">
              designed with healthy boundaries.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Mitch was created by <strong className="font-bold text-[#111F21] dark:text-white">Kuro &amp; Bokakae</strong> at Rangsit University&apos;s College of Digital Innovation Technology to explore how conversational AI can support student focus and emotional clarity without encouraging unhealthy attachment.
          </p>

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Instead of keeping you chatting indefinitely, Mitch helps you break down tasks, take a breath when deadlines pile up, and step away after 10 to 30 minutes to care for your wellbeing offline.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartChatting}
              className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#0D8B8B] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0A7373] dark:bg-[#119E9E] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2"
            >
              <span>Chat with Mitch</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-[#F3F8F8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#111F21] dark:border-[#1E3A3D] dark:bg-[#152528] dark:text-white">
              <Users className="h-4 w-4 text-[#0D8B8B] dark:text-teal-300 shrink-0" />
              <span>Created by Kuro &amp; Bokakae</span>
            </div>
          </div>
        </div>

        {/* Custom Sitting Happy Robot with Teal Rounded Square */}
        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <MascotImage
            variant="about-sitting"
            alt="Mitch robot mascot sitting happily in front of a teal rounded square"
            className="h-auto w-full max-w-[330px] sm:max-w-[390px] lg:max-w-[420px]"
          />
        </div>
      </section>

      {/* 2. Prominent Creators Section */}
      <section className="mt-6 rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-[#F3F8F8]/95 p-6 sm:p-8 dark:border-[#1E3A3D] dark:bg-[#152528]/95 lg:mt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#0D8B8B] dark:text-teal-300">
              <Users className="h-4 w-4 shrink-0" />
              <span>The Team Behind Mitch</span>
            </div>
            <h2 className="font-display mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111F21] dark:text-white">
              Created by Kuro &amp; Bokakae
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            Rangsit University · College of Digital Innovation Technology
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {CREATORS.map((creator) => (
            <div
              key={creator.name}
              className="rounded-[24px] border border-slate-200/90 bg-white p-6 dark:border-[#244447] dark:bg-[#111F21]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0D8B8B] font-display text-lg font-extrabold text-white dark:bg-[#119E9E]">
                  {creator.name[0]}
                </div>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-[#111F21] dark:text-white">
                    {creator.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
                    {creator.role}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {creator.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Three Core Principles Bento Cards */}
      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-10">
        {PRINCIPLES.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="flex flex-col justify-between rounded-[26px] border border-slate-200/90 bg-white/95 p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0D8B8B]/60 dark:border-[#1E3A3D] dark:bg-[#142225]/95 dark:hover:border-teal-500/60"
            >
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-[#0D8B8B] dark:bg-teal-950/80 dark:text-teal-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-display mt-4 text-lg font-bold text-[#111F21] dark:text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.detail}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {/* 4. Mission Spotlight Card */}
      <section className="mt-8 grid grid-cols-1 gap-6 rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-[#F3F8F8]/95 p-6 sm:p-8 dark:border-[#1E3A3D] dark:bg-[#152528]/95 md:grid-cols-12 md:items-center lg:mt-10">
        <div className="md:col-span-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
            <Compass className="h-4 w-4 shrink-0" />
            <span>Why This Project Matters</span>
          </div>
          <h2 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-[#111F21] dark:text-white">
            Technology should give time back to your real life
          </h2>
          <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Whether you need a 45-minute study breakdown, a quick answer about world history, or a calm sounding board during finals week, Mitch aims to help you finish your session feeling clearer and ready to reconnect offline.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:col-span-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-[#244447] dark:bg-[#111F21]">
            <span className="font-mono text-lg font-bold text-[#0D8B8B] dark:text-teal-300">
              10:00
            </span>
            <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">
              Pause check-in for fresh air
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-[#244447] dark:bg-[#111F21]">
            <span className="font-mono text-lg font-bold text-[#0D8B8B] dark:text-teal-300">
              30:00
            </span>
            <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">
              Wrap-up &amp; mood check
            </span>
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA + Creators Footer */}
      <section className="mt-8 flex flex-col items-center justify-between gap-6 rounded-[28px] sm:rounded-[32px] bg-[#0D8B8B] px-6 py-8 text-white sm:flex-row sm:px-10 dark:bg-[#0E7676] lg:mt-10">
        <div className="text-center sm:text-left">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to start a calm, focused chat?
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-teal-50/90">
            Try planning your next study block or asking Mitch anything curious today.
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
        <span>Rangsit University · College of Digital Innovation Technology</span>
        <span className="font-semibold text-[#111F21] dark:text-white">
          Created by Kuro &amp; Bokakae
        </span>
      </footer>
    </div>
  );
}
