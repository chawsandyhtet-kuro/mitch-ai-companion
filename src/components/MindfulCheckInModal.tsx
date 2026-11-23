import { useEffect } from "react";
import { Coffee, Droplets, Eye, Footprints, X } from "lucide-react";

interface MindfulCheckInModalProps {
  isOpen: boolean;
  formattedTime: string;
  onEndForWalk: () => void;
  onContinueChatting: () => void;
}

export function MindfulCheckInModal({
  isOpen,
  formattedTime,
  onEndForWalk,
  onContinueChatting,
}: MindfulCheckInModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onContinueChatting();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onContinueChatting]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 dark:bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mindful-checkin-title"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7 dark:border-slate-700 dark:bg-[#131E23]">
        <button
          type="button"
          onClick={onContinueChatting}
          aria-label="Close check-in dialog"
          className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
          <Coffee className="h-4 w-4 shrink-0" />
          <span>10-Minute Check-In</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formattedTime}</span>
        </div>

        <h2
          id="mindful-checkin-title"
          className="font-display mt-2.5 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl"
        >
          Do you want to continue?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          You&apos;re probably getting a little tired of staring at the screen and talking to me—why not go for a short walk, stretch your legs, or grab a glass of water?
        </p>

        <ul className="mt-5 space-y-3 border-y border-slate-100 dark:border-slate-800 py-4 text-sm text-slate-700 dark:text-slate-200">
          <li className="flex items-start gap-3">
            <Footprints className="mt-0.5 h-4 w-4 shrink-0 text-[#0D8B8B] dark:text-teal-300" />
            <span>Step outside or walk around your room for a few minutes to reset.</span>
          </li>
          <li className="flex items-start gap-3">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-[#0D8B8B] dark:text-teal-300" />
            <span>Look at something 20 feet away for 20 seconds to relax your eyes.</span>
          </li>
          <li className="flex items-start gap-3">
            <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-[#0D8B8B] dark:text-teal-300" />
            <span>Drink some water—your session automatically wraps up at 30:00.</span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onEndForWalk}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1B2930] dark:text-slate-200 dark:hover:bg-[#22333B] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B]"
          >
            Go for a Walk (End Chat)
          </button>
          <button
            type="button"
            onClick={onContinueChatting}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0D8B8B] dark:bg-[#119E9E] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A7373] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2"
          >
            Continue Chatting
          </button>
        </div>
      </div>
    </div>
  );
}
