import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Clock,
  Coffee,
  LogOut,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ChatMessage } from "../types";
import { MascotImage } from "./MascotImage";
import { MindfulCheckInModal } from "./MindfulCheckInModal";
import { SessionRatingModal } from "./SessionRatingModal";

interface ChatWorkspaceProps {
  isActive: boolean;
  queuedPrompt?: string | null;
  onConsumeQueuedPrompt?: () => void;
  onGoToPlay?: () => void;
}

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: "mitch-welcome",
  role: "assistant",
  content:
    "Hey! I'm Mitch, your platonic AI peer and study companion. Ask me anything—whether it's facts about the Eiffel Tower, planning a 45-minute study block, or talking through your day. What's on your mind?",
  timestamp: "Session start",
};

const STARTER_PROMPTS: Array<{ label: string; prompt: string }> = [
  {
    label: "Plan 45-min study session",
    prompt: "Help me plan a focused 45-minute study session with Mitch.",
  },
  {
    label: "Feeling overwhelmed",
    prompt:
      "I'm feeling overwhelmed with everything on my plate today. Can we break it down?",
  },
  {
    label: "Plan a fun trip",
    prompt: "Help me plan a relaxing, budget-friendly weekend day trip!",
  },
  {
    label: "Fun Eiffel Tower facts",
    prompt: "Tell me some cool, surprising facts about the Eiffel Tower!",
  },
];

const TEN_MIN_SECONDS = 600; // 10:00 pause & check-in
const THIRTY_MIN_SECONDS = 1800; // 30:00 force-stop

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function ChatWorkspace({
  isActive,
  queuedPrompt,
  onConsumeQueuedPrompt,
  onGoToPlay,
}: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasTenMinTriggered, setHasTenMinTriggered] = useState(false);
  const [isTenMinModalOpen, setIsTenMinModalOpen] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [reachedThirtyMinCap, setReachedThirtyMinCap] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  // Timer starts when user opens Chat tab and pauses during check-in or after session end
  useEffect(() => {
    if (!isActive || isTenMinModalOpen || isSessionEnded) return;
    const timerId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [isActive, isTenMinModalOpen, isSessionEnded]);

  // 10-minute pause & check-in
  useEffect(() => {
    if (
      elapsedSeconds >= TEN_MIN_SECONDS &&
      !hasTenMinTriggered &&
      !isSessionEnded
    ) {
      setHasTenMinTriggered(true);
      setIsTenMinModalOpen(true);
    }
  }, [elapsedSeconds, hasTenMinTriggered, isSessionEnded]);

  // 30-minute force stop
  useEffect(() => {
    if (elapsedSeconds >= THIRTY_MIN_SECONDS && !isSessionEnded) {
      triggerThirtyMinuteStop(THIRTY_MIN_SECONDS);
    }
  }, [elapsedSeconds, isSessionEnded]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const triggerThirtyMinuteStop = (secondsValue: number) => {
    setElapsedSeconds(secondsValue);
    setIsTenMinModalOpen(false);
    setIsSessionEnded(true);
    setReachedThirtyMinCap(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `mitch-30m-${Date.now()}`,
        role: "assistant",
        content:
          "We talked for 30 minutes—that's awesome! Taking a break after half an hour keeps your eyes and mind fresh. Go stretch, grab some water, or catch up with friends offline, and come back whenever you're ready for a new session!",
        timestamp: formatDuration(secondsValue),
      },
    ]);
    setIsRatingModalOpen(true);
  };

  const handleEndSessionNow = () => {
    setIsTenMinModalOpen(false);
    setIsSessionEnded(true);
    setIsRatingModalOpen(true);
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading || isSessionEnded) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: formatDuration(elapsedSeconds),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputValue("");
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const apiMessages = updatedHistory
        .filter((m) => m.id !== INITIAL_ASSISTANT_MESSAGE.id)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      });

      const rawText = await response.text();
      let data: {
        reply?: string;
        boundaryTriggered?: boolean;
        error?: string;
      } = {};

      try {
        data = rawText ? (JSON.parse(rawText) as typeof data) : {};
      } catch {
        throw new Error(
          "Mitch's server is still warming up or returned an unexpected response. Please try sending again in a moment."
        );
      }

      if (!response.ok || !data.reply) {
        throw new Error(
          data.error || "Unable to get a response from Mitch right now."
        );
      }

      const assistantMsg: ChatMessage = {
        id: `mitch-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        boundaryTriggered: Boolean(data.boundaryTriggered),
        timestamp: formatDuration(elapsedSeconds),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Network error while contacting Mitch.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (queuedPrompt && queuedPrompt.trim()) {
      const prompt = queuedPrompt;
      onConsumeQueuedPrompt?.();
      void sendMessage(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedPrompt]);

  const handleResetSession = () => {
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
    setElapsedSeconds(0);
    setHasTenMinTriggered(false);
    setIsTenMinModalOpen(false);
    setIsSessionEnded(false);
    setReachedThirtyMinCap(false);
    setIsRatingModalOpen(false);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(inputValue);
  };

  const formattedClock = formatDuration(elapsedSeconds);
  const progressPercent = Math.min(
    100,
    Math.round((elapsedSeconds / THIRTY_MIN_SECONDS) * 100)
  );

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 pt-3 pb-28 sm:px-8 md:py-6">
      {/* Top Session Header Bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200/90 bg-[#F3F8F8]/95 px-4 py-3 sm:px-6 dark:border-[#1E3A3D] dark:bg-[#152528]/95">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#0D8B8B]/12 text-[#0D8B8B] dark:bg-teal-950 dark:text-teal-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#111F21] dark:text-white">
              AI Companion (Platonic Assistant)
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Focused peer chat · 10m break check-in · 30m limit
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            title="Active session duration (10m check-in, 30m limit)"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:border-[#244447] dark:bg-[#111F21] dark:text-slate-200"
          >
            <Clock className="h-3.5 w-3.5 text-[#0D8B8B] dark:text-teal-300 shrink-0" />
            <span className="font-mono tabular-nums font-semibold">
              {formattedClock}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              / 30:00
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTenMinModalOpen(true)}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#0D8B8B] hover:text-[#0D8B8B] dark:border-[#244447] dark:bg-[#111F21] dark:text-slate-200 dark:hover:border-teal-400 whitespace-nowrap cursor-pointer"
          >
            <Coffee className="h-3.5 w-3.5 text-[#0D8B8B] dark:text-teal-300 shrink-0" />
            <span>Demo 10m</span>
          </button>

          <button
            type="button"
            onClick={() => triggerThirtyMinuteStop(THIRTY_MIN_SECONDS)}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#0D8B8B] hover:text-[#0D8B8B] dark:border-[#244447] dark:bg-[#111F21] dark:text-slate-200 dark:hover:border-teal-400 whitespace-nowrap cursor-pointer"
          >
            <span>Demo 30m</span>
          </button>

          {!isSessionEnded ? (
            <button
              type="button"
              onClick={handleEndSessionNow}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full bg-[#0D8B8B] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0A7373] dark:bg-[#119E9E] dark:hover:bg-[#0D8B8B] whitespace-nowrap cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>End Chat</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetSession}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full bg-[#0D8B8B] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0A7373] whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 12-Col Bento Split */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Left: Chat Workspace Container */}
        <div className="flex flex-col gap-3.5 lg:col-span-8">
          <div className="flex flex-1 flex-col overflow-hidden rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-[#E6ECEF]/85 dark:border-[#1E3A3D] dark:bg-[#152226] shadow-sm transition-colors duration-200">
            {isSessionEnded && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300/60 bg-white/80 px-5 py-3 dark:border-[#244447] dark:bg-[#192B30]">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {reachedThirtyMinCap
                    ? "30-minute session limit reached. Take a well-deserved break!"
                    : "Session ended. Ready to start fresh whenever you'd like."}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRatingModalOpen(true)}
                    className="inline-flex min-h-[34px] items-center rounded-full border border-slate-300 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap cursor-pointer"
                  >
                    Rate Session
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSession}
                    className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full bg-[#0D8B8B] px-3.5 py-1 text-xs font-semibold text-white hover:bg-[#0A7373] whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    <span>New Session</span>
                  </button>
                </div>
              </div>
            )}

            <div className="h-[380px] sm:h-[430px] flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? "rounded-br-sm bg-[#0D8B8B] text-white dark:bg-[#119E9E]"
                          : "rounded-bl-sm bg-white text-slate-900 dark:bg-[#203238] dark:text-slate-100"
                      }`}
                    >
                      {!isUser && msg.boundaryTriggered && (
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200">
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300" />
                          <span>Platonic Boundary Kept</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`mt-1.5 text-[11px] font-mono tabular-nums ${
                          isUser
                            ? "text-teal-100 text-right"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {isUser ? "You" : "Mitch"} · {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-slate-600 shadow-xs dark:bg-[#203238] dark:text-slate-300">
                    Mitch is thinking...
                  </div>
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/60 dark:text-rose-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-300" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div ref={scrollEndRef} />
            </div>

            {/* Bottom Composer Bar inside the Bento Frame */}
            <div className="border-t border-slate-300/60 bg-white/70 p-3 sm:p-4 dark:border-[#1E3A3D] dark:bg-[#121D21]/90 space-y-3">
              {/* Starter Prompts */}
              <div className="flex flex-wrap items-center gap-2">
                {STARTER_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={isLoading || isSessionEnded}
                    onClick={() => void sendMessage(item.prompt)}
                    className="inline-flex min-h-[34px] items-center rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-[#0D8B8B] hover:text-[#0D8B8B] dark:border-[#244447] dark:bg-[#17272B] dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Pill Composer */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1.5 pl-4 sm:pl-5 shadow-xs dark:border-[#244447] dark:bg-[#17272B]"
              >
                <label htmlFor="mitch-chat-input" className="sr-only">
                  Message Mitch
                </label>
                <input
                  id="mitch-chat-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isSessionEnded
                      ? "Session ended — click New Session to chat again"
                      : "Want to talk about how your day went?"
                  }
                  disabled={isLoading || isSessionEnded}
                  className="min-h-[40px] flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isLoading || isSessionEnded || !inputValue.trim()}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-[#0D8B8B] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0A7373] dark:bg-[#119E9E] dark:hover:bg-[#0D8B8B] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2"
                >
                  <span>Send</span>
                  <Send className="h-4 w-4 shrink-0" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Companion Sidebar Card (Visible across desktop & responsive bottom card on mobile) */}
        <aside className="flex flex-col justify-between overflow-hidden rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-[#F3F8F8]/95 p-6 dark:border-[#1E3A3D] dark:bg-[#152528]/95 lg:col-span-4">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0D8B8B] dark:text-teal-300">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Session Companion</span>
            </div>

            <div>
              <h2 className="font-display text-xl font-extrabold tracking-tight text-[#111F21] dark:text-white">
                Mitch is ready when you are.
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Ask general trivia, map out a 45-minute study block, plan a trip, or sort out a stressful afternoon.
              </p>
            </div>

            {/* Session Pacing Progress Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-[#244447] dark:bg-[#111F21]">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span>Healthy Session Pace</span>
                <span className="font-mono text-[#0D8B8B] dark:text-teal-300 tabular-nums">
                  {formattedClock} / 30:00
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-[#0D8B8B] dark:bg-[#23B8B8] transition-all duration-500"
                  style={{ width: `${Math.max(4, progressPercent)}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="rounded-xl bg-[#F4F8F8] px-2.5 py-2 dark:bg-[#16272B]">
                  <span className="block font-semibold text-slate-700 dark:text-slate-200">
                    10:00 Break
                  </span>
                  <span>Gentle walk prompt</span>
                </div>
                <div className="rounded-xl bg-[#F4F8F8] px-2.5 py-2 dark:bg-[#16272B]">
                  <span className="block font-semibold text-slate-700 dark:text-slate-200">
                    30:00 Limit
                  </span>
                  <span>Wrap-up &amp; rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Happy Waving Mitch Mascot Anchoring Bottom-Right */}
          <div className="mt-5 flex items-end justify-end -mb-6 -mr-6 pt-2">
            <MascotImage
              variant="chat-happy"
              alt="Happy Mitch robot mascot smiling and waving"
              className="h-64 w-44 sm:h-72 sm:w-48 lg:h-[310px] lg:w-[215px]"
            />
          </div>
        </aside>
      </div>

      <MindfulCheckInModal
        isOpen={isTenMinModalOpen}
        formattedTime={formattedClock}
        onEndForWalk={handleEndSessionNow}
        onContinueChatting={() => setIsTenMinModalOpen(false)}
      />

      <SessionRatingModal
        isOpen={isRatingModalOpen}
        elapsedSeconds={elapsedSeconds}
        formattedTime={formattedClock}
        reachedThirtyMinCap={reachedThirtyMinCap}
        onStartNewSession={handleResetSession}
        onGoToPlay={onGoToPlay}
        onClose={() => setIsRatingModalOpen(false)}
      />
    </section>
  );
}
