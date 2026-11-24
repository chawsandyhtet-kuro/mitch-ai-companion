import { useEffect, useRef, useState } from "react";
import {
  GripVertical,
  Minus,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { AMBIENT_TRACKS } from "../utils/ambientMusic";

interface FloatingMusicPlayerProps {
  isPlaying: boolean;
  trackIndex: number;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
}

export function FloatingMusicPlayer({
  isPlaying,
  trackIndex,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
}: FloatingMusicPlayerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });

  // Clamp offset inside viewport on window resize or expand/minimize toggle
  const clampOffset = (nextX: number, nextY: number) => {
    if (typeof window === "undefined" || !containerRef.current) {
      return { x: nextX, y: nextY };
    }
    const rect = containerRef.current.getBoundingClientRect();
    // Compute current base position without transform offset
    const baseLeft = rect.left - offset.x;
    const baseTop = rect.top - offset.y;

    const minX = 8 - baseLeft;
    const maxX = window.innerWidth - rect.width - 8 - baseLeft;
    const minY = 8 - baseTop;
    const maxY = window.innerHeight - rect.height - 8 - baseTop;

    return {
      x: Math.max(minX, Math.min(maxX, nextX)),
      y: Math.max(minY, Math.min(maxY, nextY)),
    };
  };

  useEffect(() => {
    const handleResize = () => {
      setOffset((prev) => clampOffset(prev.x, prev.y));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMinimized]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state.active) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      if (Math.hypot(dx, dy) > 4) {
        state.moved = true;
      }

      const clamped = clampOffset(state.origX + dx, state.origY + dy);
      setOffset(clamped);
    };

    const handlePointerUp = () => {
      if (!dragStateRef.current.active) return;
      dragStateRef.current.active = false;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const startDrag = (e: React.PointerEvent) => {
    // Only drag on primary mouse button or touch/pen
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const currentTrack =
    AMBIENT_TRACKS[trackIndex % AMBIENT_TRACKS.length] ?? AMBIENT_TRACKS[0];

  return (
    <div
      ref={containerRef}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
      }}
      className={`fixed bottom-16 right-3 md:bottom-5 md:right-5 z-50 max-w-[calc(100vw-24px)] select-none ${
        isDragging ? "cursor-grabbing" : ""
      }`}
    >
      {isMinimized ? (
        <button
          type="button"
          onPointerDown={startDrag}
          onClick={() => {
            if (!dragStateRef.current.moved) {
              setIsMinimized(false);
            }
          }}
          aria-label="Open ambient music mini player"
          title={`${currentTrack.name} — Tap to open or drag to move`}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/75 text-[#0D8B8B] shadow-lg backdrop-blur-md transition-colors hover:border-[#0D8B8B]/60 hover:bg-white/90 dark:border-[#244447]/80 dark:bg-[#132225]/75 dark:text-teal-300 dark:hover:border-teal-400/60 touch-none cursor-grab active:cursor-grabbing"
        >
          <Music className="h-4.5 w-4.5 shrink-0" />
          {isPlaying && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#0D8B8B] dark:bg-teal-400 animate-pulse"
            />
          )}
        </button>
      ) : (
        <div
          aria-label="Ambient background music mini player"
          className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/75 px-2.5 py-1.5 text-slate-800 shadow-lg backdrop-blur-md transition-colors dark:border-[#244447]/80 dark:bg-[#132225]/75 dark:text-slate-100"
        >
          {/* Drag Handle */}
          <div
            onPointerDown={startDrag}
            title="Drag anywhere on screen"
            className="flex items-center justify-center pl-0.5 pr-1 py-1 text-slate-400 hover:text-[#0D8B8B] dark:text-slate-500 dark:hover:text-teal-300 touch-none cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0" />
          </div>

          {/* Previous Track */}
          <button
            type="button"
            onClick={onPrevTrack}
            aria-label="Previous ambient track"
            title="Previous song"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-[#0D8B8B] dark:text-slate-300 dark:hover:bg-[#1E3538] dark:hover:text-teal-300 cursor-pointer"
          >
            <SkipBack className="h-3.5 w-3.5 shrink-0" />
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause ambient music" : "Play ambient music"}
            title={isPlaying ? "Pause music" : "Play soft ambient music"}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer ${
              isPlaying
                ? "bg-[#0D8B8B] text-white hover:bg-[#0A7373] dark:bg-[#119E9E] dark:hover:bg-[#0D8B8B]"
                : "bg-slate-200/80 text-slate-700 hover:bg-[#0D8B8B] hover:text-white dark:bg-[#1E3538] dark:text-slate-200 dark:hover:bg-[#119E9E]"
            }`}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Play className="h-3.5 w-3.5 shrink-0 translate-x-[0.5px]" />
            )}
          </button>

          {/* Next Track */}
          <button
            type="button"
            onClick={onNextTrack}
            aria-label="Next ambient track"
            title="Next song"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-[#0D8B8B] dark:text-slate-300 dark:hover:bg-[#1E3538] dark:hover:text-teal-300 cursor-pointer"
          >
            <SkipForward className="h-3.5 w-3.5 shrink-0" />
          </button>

          {/* Track Name (also draggable!) */}
          <div
            onPointerDown={startDrag}
            title={`${currentTrack.name} (${currentTrack.subtitle}) — Drag to move`}
            className="max-w-[130px] sm:max-w-[155px] px-1.5 touch-none cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  isPlaying
                    ? "bg-[#0D8B8B] dark:bg-teal-400 animate-pulse"
                    : "bg-slate-400/70 dark:bg-slate-500"
                }`}
              />
              <span className="truncate text-[11px] font-semibold tracking-tight text-[#111F21] dark:text-slate-100">
                {currentTrack.name}
              </span>
            </div>
          </div>

          {/* Minimize Button (–) */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize music player"
            title="Minimize to music note icon"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#1E3538] dark:hover:text-white cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}
