import { ArrowRight, BookOpen, GraduationCap, Shield, Sparkles } from "lucide-react";
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

export function AboutMitch({ onStartChatting }: AboutMitchProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-8 pb-24 sm:px-6 md:py-12">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span>Rangsit University · College of Digital Innovation Technology</span>
          </div>

          <h1
            className="font-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl"
            style={{ textWrap: "balance" }}
          >
            Meet Mitch: a study companion designed with healthy boundaries
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Mitch was created at Rangsit University&apos;s College of Digital Innovation Technology to explore how conversational AI can support student focus and emotional clarity without encouraging unhealthy attachment.
          </p>

          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Instead of keeping you chatting indefinitely, Mitch helps you break down tasks, take a breath when deadlines pile up, and step away after 10 to 30 minutes to care for your wellbeing offline.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartChatting}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0D8B8B] dark:bg-[#119E9E] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0A7373] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2"
            >
              <span>Chat with Mitch</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>

        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <MascotImage
            variant="about-sitting"
            alt="Mitch robot mascot sitting happily in front of a teal rounded square"
            className="h-auto w-full max-w-[350px] sm:max-w-[400px]"
          />
        </div>
      </div>

      {/* Three Principles */}
      <div className="mt-12 grid grid-cols-1 gap-5 border-t border-slate-200 dark:border-slate-800 pt-10 md:grid-cols-3">
        {PRINCIPLES.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Icon className="h-4 w-4 text-[#0D8B8B] dark:text-teal-300 shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[11px] text-slate-400 dark:text-slate-500">
        Created by Kuro &amp; Bokakae
      </p>
    </section>
  );
}
