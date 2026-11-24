import { useCallback, useEffect, useRef, useState } from "react";
import {
  Anchor,
  Brain,
  CircleDot,
  Compass,
  Grid3X3,
  HeartHandshake,
  Home,
  Layers,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { MascotImage } from "./MascotImage";
import { BattleshipGame } from "./games/BattleshipGame";
import { ConnectFourGame } from "./games/ConnectFourGame";
import { MazeRaceGame } from "./games/MazeRaceGame";
import { MemoryGame } from "./games/MemoryGame";
import { TicTacToeGame } from "./games/TicTacToeGame";
import { BANTER_QUIPS, pickQuip } from "./games/banter";
import type { GameId, MatchOutcome } from "./games/types";

interface PlayWorkspaceProps {
  isActive: boolean;
  onGoHome: () => void;
  onGoToChat: () => void;
}

const GAMES: Array<{
  id: GameId;
  name: string;
  algoBadge: string;
  icon: typeof Anchor;
}> = [
  {
    id: "battleship",
    name: "Battleship",
    algoBadge: "Probability Grid",
    icon: Anchor,
  },
  {
    id: "connect4",
    name: "Connect Four",
    algoBadge: "Alpha-Beta",
    icon: CircleDot,
  },
  {
    id: "maze",
    name: "Maze Escape",
    algoBadge: "A* Search",
    icon: Compass,
  },
  {
    id: "memory",
    name: "Memory Match",
    algoBadge: "Memory Recall",
    icon: Layers,
  },
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    algoBadge: "Minimax",
    icon: Grid3X3,
  },
];

const TEN_MINUTES_SECONDS = 600;
const MATCH_NUDGE_THRESHOLD = 2;

function getResultContent(outcome: MatchOutcome, gameName: string) {
  if (outcome === "win") {
    return {
      badge: "You Won",
      badgeStyle:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200",
      title: `Nice win in ${gameName}!`,
      body: "That was sharp thinking—want to jump right into another round or head over to chat with Mitch?",
    };
  }
  if (outcome === "loss") {
    return {
      badge: "You Lost",
      badgeStyle:
        "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
      title: `Mitch won ${gameName} this round!`,
      body: "Fun match! Ready for a quick rematch, or want to take a breather and talk about your day?",
    };
  }
  return {
    badge: "Draw",
    badgeStyle:
      "bg-teal-50 text-[#0A6E6E] dark:bg-teal-950/60 dark:text-teal-200",
    title: `It's a draw in ${gameName}!`,
    body: "Dead even from start to finish! Want to break the tie with another game or talk with Mitch?",
  };
}

export function PlayWorkspace({
  isActive,
  onGoHome,
  onGoToChat,
}: PlayWorkspaceProps) {
  const [activeGame, setActiveGame] = useState<GameId>("battleship");
  const [matchInstanceKey, setMatchInstanceKey] = useState(0);
  const [showBrain, setShowBrain] = useState<boolean>(false);
  const [quip, setQuip] = useState<string>(() =>
    pickQuip(BANTER_QUIPS.welcome)
  );

  // Per-match Result Modal ("Win" / "Lose" / "Draw" + "Play Again" / "Let's Talk")
  const [matchResult, setMatchResult] = useState<{
    outcome: MatchOutcome;
    gameName: string;
  } | null>(null);

  // Silent boundary check state (NEVER displayed in the UI)
  const [isNudgeOpen, setIsNudgeOpen] = useState(false);
  const silentMatchesRef = useRef(0);
  const silentSecondsRef = useRef(0);
  const pendingNudgeAfterResultRef = useRef(false);

  // Silently accumulate active seconds in Play with Mitch without displaying any clock
  useEffect(() => {
    if (!isActive || isNudgeOpen) return;
    const id = window.setInterval(() => {
      silentSecondsRef.current += 1;
      if (silentSecondsRef.current >= TEN_MINUTES_SECONDS) {
        if (matchResult) {
          pendingNudgeAfterResultRef.current = true;
        } else {
          setIsNudgeOpen(true);
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [isActive, isNudgeOpen, matchResult]);

  const handleQuip = useCallback((text: string) => {
    setQuip(text);
  }, []);

  const currentGameMeta =
    GAMES.find((g) => g.id === activeGame) ?? GAMES[0];

  const handleMatchComplete = useCallback(
    (outcome: MatchOutcome) => {
      silentMatchesRef.current += 1;
      if (silentMatchesRef.current >= MATCH_NUDGE_THRESHOLD) {
        pendingNudgeAfterResultRef.current = true;
      }
      window.setTimeout(() => {
        setMatchResult({
          outcome,
          gameName: currentGameMeta.name,
        });
      }, 380);
    },
    [currentGameMeta.name]
  );

  const handleSelectGame = (gameId: GameId) => {
    setActiveGame(gameId);
    setMatchResult(null);
    switch (gameId) {
      case "battleship":
        setQuip(pickQuip(BANTER_QUIPS.battleshipSetup));
        break;
      case "connect4":
        setQuip("7×6 Connect Four! Try Smart mode to test Alpha-Beta Pruning.");
        break;
      case "maze":
        setQuip(pickQuip(BANTER_QUIPS.mazeStart));
        break;
      case "memory":
        setQuip(pickQuip(BANTER_QUIPS.memoryStart));
        break;
      case "tictactoe":
        setQuip("Quick 3×3 warmup! Toggle Friendly vs. Unbeatable Minimax anytime.");
        break;
    }
  };

  const handlePlayAgain = () => {
    setMatchResult(null);
    setMatchInstanceKey((prev) => prev + 1);
    if (pendingNudgeAfterResultRef.current) {
      pendingNudgeAfterResultRef.current = false;
      setIsNudgeOpen(true);
    }
  };

  const handleLetsTalk = () => {
    setMatchResult(null);
    pendingNudgeAfterResultRef.current = false;
    onGoToChat();
  };

  const handleKeepHangingOut = () => {
    silentMatchesRef.current = 0;
    silentSecondsRef.current = 0;
    pendingNudgeAfterResultRef.current = false;
    setIsNudgeOpen(false);
    setQuip("Sounds good! Let's enjoy another relaxed round whenever you're ready.");
  };

  const handleStepAwayHome = () => {
    silentMatchesRef.current = 0;
    silentSecondsRef.current = 0;
    pendingNudgeAfterResultRef.current = false;
    setIsNudgeOpen(false);
    onGoHome();
  };

  const resultCopy = matchResult
    ? getResultContent(matchResult.outcome, matchResult.gameName)
    : null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-4 pb-28 sm:px-8 md:pb-12">
      {/* Top Game-Switcher Bar + "Show Mitch's Brain" Toggle */}
      <div className="rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-[#F3F8F8]/95 p-4 sm:p-6 dark:border-[#1E3A3D] dark:bg-[#152528]/95">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* 5-Game Switcher Pills (2-col clean grid on mobile, inline wrap on desktop) */}
          <div
            role="tablist"
            aria-label="Choose a strategy game"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
          >
            {GAMES.map((game) => {
              const Icon = game.icon;
              const selected = activeGame === game.id;
              return (
                <button
                  key={game.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleSelectGame(game.id)}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-all cursor-pointer ${
                    selected
                      ? "border-[#0D8B8B] bg-[#0D8B8B] text-white shadow-xs dark:border-[#119E9E] dark:bg-[#119E9E]"
                      : "border-slate-200/90 bg-white text-slate-700 hover:border-[#0D8B8B]/60 hover:text-[#0D8B8B] dark:border-[#244447] dark:bg-[#111F21] dark:text-slate-200 dark:hover:border-teal-400"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <span className="block truncate text-xs sm:text-sm font-bold leading-tight">
                      {game.name}
                    </span>
                    <span
                      className={`block truncate text-[10px] leading-tight ${
                        selected
                          ? "text-teal-50/90"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {game.algoBadge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* "Show Mitch's Brain" Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={showBrain}
            onClick={() => setShowBrain((prev) => !prev)}
            className={`inline-flex min-h-[44px] w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              showBrain
                ? "border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-500/50 dark:bg-amber-950/50 dark:text-amber-200"
                : "border-slate-300 bg-white text-slate-700 hover:border-[#0D8B8B] dark:border-[#244447] dark:bg-[#111F21] dark:text-slate-200"
            }`}
          >
            <Brain
              className={`h-4 w-4 shrink-0 ${
                showBrain
                  ? "text-amber-600 dark:text-amber-300"
                  : "text-[#0D8B8B] dark:text-teal-300"
              }`}
            />
            <span>Show Mitch&apos;s Brain: {showBrain ? "On" : "Off"}</span>
          </button>
        </div>

        {/* Mitch Avatar + Compact Friendly Peer Banter Speech Bubble */}
        <div className="mt-4 flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 dark:border-[#244447] dark:bg-[#111F21]/95">
          <MascotImage
            variant="waving"
            alt="Mitch robot cheering and chatting during your game"
            className="h-12 w-12 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-wide text-[#0D8B8B] dark:text-teal-300">
              Mitch · Friendly AI Peer
            </span>
            <p className="text-xs sm:text-sm leading-snug text-slate-700 dark:text-slate-200">
              &ldquo;{quip}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Active Game Board Stage */}
      <div className="mt-5 rounded-[28px] sm:rounded-[32px] border border-slate-200/90 bg-white/95 p-3.5 sm:p-7 shadow-xs dark:border-[#1E3A3D] dark:bg-[#142225]/95">
        {activeGame === "battleship" && (
          <BattleshipGame
            key={`battleship-${matchInstanceKey}`}
            showBrain={showBrain}
            isTabActive={isActive && !isNudgeOpen && !matchResult}
            onQuip={handleQuip}
            onMatchComplete={handleMatchComplete}
          />
        )}
        {activeGame === "connect4" && (
          <ConnectFourGame
            key={`connect4-${matchInstanceKey}`}
            showBrain={showBrain}
            isTabActive={isActive && !isNudgeOpen && !matchResult}
            onQuip={handleQuip}
            onMatchComplete={handleMatchComplete}
          />
        )}
        {activeGame === "maze" && (
          <MazeRaceGame
            key={`maze-${matchInstanceKey}`}
            showBrain={showBrain}
            isTabActive={isActive && !isNudgeOpen && !matchResult}
            onQuip={handleQuip}
            onMatchComplete={handleMatchComplete}
          />
        )}
        {activeGame === "memory" && (
          <MemoryGame
            key={`memory-${matchInstanceKey}`}
            showBrain={showBrain}
            isTabActive={isActive && !isNudgeOpen && !matchResult}
            onQuip={handleQuip}
            onMatchComplete={handleMatchComplete}
          />
        )}
        {activeGame === "tictactoe" && (
          <TicTacToeGame
            key={`tictactoe-${matchInstanceKey}`}
            showBrain={showBrain}
            isTabActive={isActive && !isNudgeOpen && !matchResult}
            onQuip={handleQuip}
            onMatchComplete={handleMatchComplete}
          />
        )}
      </div>

      {/* Quiet Footer with Subtle Demo: Trigger Nudge Link */}
      <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 pt-5 text-xs text-slate-600 sm:flex-row dark:border-[#1E3A3D] dark:text-slate-300">
        <span>
          Mitch · 100% Local Strategy Arcade · Created by Kuro &amp; Bokakae
        </span>
        <button
          type="button"
          onClick={() => setIsNudgeOpen(true)}
          className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-[#0D8B8B] hover:underline dark:text-slate-500 dark:hover:text-teal-300 cursor-pointer"
        >
          Demo: Trigger Nudge
        </button>
      </footer>

      {/* Post-Match Result Popup Modal (Win / Lose / Draw + Play Again / Let's Talk) */}
      {matchResult && resultCopy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 dark:bg-black/70 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="match-result-title"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-7 dark:border-slate-700 dark:bg-[#131E23]">
            <button
              type="button"
              onClick={() => setMatchResult(null)}
              aria-label="Close match result"
              title="Inspect final board"
              className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-[#0D8B8B] hover:text-[#0D8B8B] dark:border-slate-700 dark:bg-[#1B2930] dark:text-slate-400 dark:hover:border-teal-400 dark:hover:text-teal-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto flex justify-center">
              <MascotImage
                variant="waving"
                alt="Mitch waving after your match"
                className="h-24 w-24"
              />
            </div>

            <div
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${resultCopy.badgeStyle}`}
            >
              {matchResult.outcome === "win" ? (
                <Trophy className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{resultCopy.badge}</span>
            </div>

            <h2
              id="match-result-title"
              className="font-display mt-3 text-xl font-extrabold tracking-tight text-[#111F21] dark:text-white"
            >
              {resultCopy.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {resultCopy.body}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleLetsTalk}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#0D8B8B] hover:text-[#0D8B8B] dark:border-slate-700 dark:bg-[#1B2930] dark:text-slate-200 dark:hover:border-teal-400 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span>Let&apos;s Talk</span>
              </button>
              <button
                type="button"
                onClick={handlePlayAgain}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#0D8B8B] dark:bg-[#119E9E] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A7373] dark:hover:bg-[#0D8B8B] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warm, Gentle Non-Blocking Mindful Break Modal */}
      {isNudgeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/65 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="play-nudge-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-7 dark:border-slate-700 dark:bg-[#131E23]">
            <div className="mx-auto flex justify-center">
              <MascotImage
                variant="waving"
                alt="Mitch waving warmly"
                className="h-24 w-24"
              />
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0A6E6E] dark:bg-teal-950/60 dark:text-teal-200">
              <HeartHandshake className="h-3.5 w-3.5 shrink-0" />
              <span>Gentle Check-In</span>
            </div>

            <h2
              id="play-nudge-title"
              className="font-display mt-3 text-xl font-extrabold tracking-tight text-[#111F21] dark:text-white"
            >
              That was a solid session!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Remember to stretch, grab some water, or check in with a friend IRL when you&apos;re ready.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleKeepHangingOut}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1B2930] dark:text-slate-200 dark:hover:bg-[#22333B] cursor-pointer"
              >
                Keep Hanging Out
              </button>
              <button
                type="button"
                onClick={handleStepAwayHome}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#0D8B8B] dark:bg-[#119E9E] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A7373] dark:hover:bg-[#0D8B8B] cursor-pointer"
              >
                <Home className="h-4 w-4 shrink-0" />
                <span>Step Away (Go Home)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
