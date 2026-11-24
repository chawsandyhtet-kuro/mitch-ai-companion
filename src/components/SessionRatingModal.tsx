import { useState } from "react";
import { CheckCircle2, Clock, Gamepad2, Star, X } from "lucide-react";

interface SessionRatingModalProps {
  isOpen: boolean;
  elapsedSeconds: number;
  formattedTime: string;
  reachedThirtyMinCap: boolean;
  onStartNewSession: () => void;
  onGoToPlay?: () => void;
  onClose: () => void;
}

const RATING_OPTIONS = [
  { score: 1, label: "Drained" },
  { score: 2, label: "Meh" },
  { score: 3, label: "Okay" },
  { score: 4, label: "Better" },
  { score: 5, label: "Refreshed" },
];

function getDurationMessage(elapsedSeconds: number, reachedCap: boolean): {
  headline: string;
  body: string;
} {
  if (reachedCap || elapsedSeconds >= 1800) {
    return {
      headline: "We talked for 30 minutes—that's awesome!",
      body: "We talked a lot today, and hitting our 30-minute mark is the best time to rest your eyes, grab some water, and go enjoy the offline world. Come back anytime you want another chat!",
    };
  }
  if (elapsedSeconds >= 600) {
    return {
      headline: "Nice 10+ minute check-in today!",
      body: "We had a good conversation—hope it gave you a helpful boost. Go stretch or take a walk, and come back anytime!",
    };
  }
  return {
    headline: "Quick session wrapped up!",
    body: "Just a short catch-up today—alright, have fun out there and come back anytime you want to talk again!",
  };
}

export function SessionRatingModal({
  isOpen,
  elapsedSeconds,
  formattedTime,
  reachedThirtyMinCap,
  onStartNewSession,
  onGoToPlay,
  onClose,
}: SessionRatingModalProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const { headline, body } = getDurationMessage(elapsedSeconds, reachedThirtyMinCap);

  const handleSelectRating = (score: number) => {
    setSelectedScore(score);
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSelectedScore(null);
    setSubmitted(false);
    onStartNewSession();
  };

  const handleSwitchToPlay = () => {
    setSelectedScore(null);
    setSubmitted(false);
    onClose();
    onGoToPlay?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 dark:bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-rating-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7 dark:border-slate-700 dark:bg-[#131E23]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close rating dialog"
          className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
          <Clock className="h-4 w-4 shrink-0" />
          <span>Session Ended</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formattedTime}</span>
        </div>

        <h2
          id="session-rating-title"
          className="font-display mt-2.5 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl"
        >
          {headline}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {body}
        </p>

        <div className="mt-5 border-y border-slate-100 dark:border-slate-800 py-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            So, how do you feel after our little session?
          </p>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {RATING_OPTIONS.map((opt) => {
              const isSelected = selectedScore === opt.score;
              return (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => handleSelectRating(opt.score)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-1.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "border-[#0D8B8B] bg-teal-50 text-[#0A6E6E] dark:border-teal-400 dark:bg-teal-900/50 dark:text-teal-200"
                      : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-teal-300 hover:bg-white dark:border-slate-700 dark:bg-[#1A272D] dark:text-slate-300 dark:hover:border-teal-600"
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      selectedScore !== null && opt.score <= selectedScore
                        ? "fill-[#0D8B8B] text-[#0D8B8B] dark:fill-teal-300 dark:text-teal-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  <span className="truncate max-w-full">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {submitted && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#0D8B8B] dark:text-teal-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Thanks for checking in! Take care and come back anytime.</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1B2930] dark:text-slate-200 dark:hover:bg-[#22333B] whitespace-nowrap cursor-pointer"
          >
            Close
          </button>
          {onGoToPlay && (
            <button
              type="button"
              onClick={handleSwitchToPlay}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-teal-300 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-[#0A6E6E] transition-colors hover:bg-teal-100 dark:border-teal-500/40 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:bg-teal-900/70 whitespace-nowrap cursor-pointer"
            >
              <Gamepad2 className="h-4 w-4 shrink-0" />
              <span>Play with Mitch</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleResetAndClose}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0D8B8B] dark:bg-[#119E9E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A7373] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer"
          >
            Start Fresh Session
          </button>
        </div>
      </div>
    </div>
  );
}
