import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { BANTER_QUIPS, pickQuip } from "./banter";
import type { GameComponentProps } from "./types";

type Mark = "X" | "O" | null;
type TttMode = "friendly" | "unbeatable";

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkTttWinner(board: Mark[]): { winner: "X" | "O"; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as "X" | "O", line };
    }
  }
  return null;
}

function minimaxTtt(board: Mark[], isMitchTurn: boolean): number {
  const win = checkTttWinner(board);
  if (win) return win.winner === "O" ? 1 : -1;
  if (board.every((cell) => cell !== null)) return 0;

  if (isMitchTurn) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        best = Math.max(best, minimaxTtt(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "X";
        best = Math.min(best, minimaxTtt(board, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function evaluateSquareScores(board: Mark[]): Array<number | null> {
  return board.map((cell, idx) => {
    if (cell !== null) return null;
    const copy = [...board];
    copy[idx] = "O";
    return minimaxTtt(copy, false);
  });
}

export function TicTacToeGame({
  showBrain,
  onQuip,
  onMatchComplete,
}: GameComponentProps) {
  const [board, setBoard] = useState<Mark[]>(() => Array<Mark>(9).fill(null));
  const [mode, setMode] = useState<TttMode>("unbeatable");
  const [turn, setTurn] = useState<"player" | "mitch">("player");
  const [winnerInfo, setWinnerInfo] = useState<{
    result: "X" | "O" | "draw";
    line: number[];
  } | null>(null);

  const squareScores = useMemo(() => {
    if (!showBrain || winnerInfo) return Array<number | null>(9).fill(null);
    return evaluateSquareScores(board);
  }, [board, showBrain, winnerInfo]);

  const handleReset = useCallback(() => {
    setBoard(Array<Mark>(9).fill(null));
    setTurn("player");
    setWinnerInfo(null);
    onQuip(
      mode === "unbeatable"
        ? pickQuip(BANTER_QUIPS.tttUnbeatable)
        : "Friendly Mode active! Grab any square to start."
    );
  }, [mode, onQuip]);

  // Mitch turn
  useEffect(() => {
    if (turn !== "mitch" || winnerInfo) return;

    const timer = window.setTimeout(() => {
      const emptyIndices = board
        .map((v, idx) => (v === null ? idx : -1))
        .filter((idx) => idx !== -1);

      if (emptyIndices.length === 0) return;

      let chosenIdx = emptyIndices[0];
      if (mode === "friendly" && Math.random() < 0.45) {
        chosenIdx =
          emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        onQuip(pickQuip(BANTER_QUIPS.tttFriendlyMistake));
      } else {
        let bestScore = -Infinity;
        let bestMoves: number[] = [];
        for (const idx of emptyIndices) {
          const copy = [...board];
          copy[idx] = "O";
          const score = minimaxTtt(copy, false);
          if (score > bestScore) {
            bestScore = score;
            bestMoves = [idx];
          } else if (score === bestScore) {
            bestMoves.push(idx);
          }
        }
        chosenIdx = bestMoves[Math.floor(Math.random() * bestMoves.length)];
      }

      const next = [...board];
      next[chosenIdx] = "O";
      setBoard(next);

      const win = checkTttWinner(next);
      if (win) {
        setWinnerInfo({ result: "O", line: win.line });
        onQuip(pickQuip(BANTER_QUIPS.mitchWin));
        onMatchComplete("loss");
        return;
      }

      if (next.every((c) => c !== null)) {
        setWinnerInfo({ result: "draw", line: [] });
        onQuip(pickQuip(BANTER_QUIPS.draw));
        onMatchComplete("draw");
        return;
      }

      setTurn("player");
    }, 320);

    return () => window.clearTimeout(timer);
  }, [turn, winnerInfo, board, mode, onMatchComplete, onQuip]);

  const handleCellClick = (idx: number) => {
    if (turn !== "player" || winnerInfo || board[idx] !== null) return;

    const next = [...board];
    next[idx] = "X";
    setBoard(next);

    const win = checkTttWinner(next);
    if (win) {
      setWinnerInfo({ result: "X", line: win.line });
      onQuip(pickQuip(BANTER_QUIPS.playerWin));
      onMatchComplete("win");
      return;
    }

    if (next.every((c) => c !== null)) {
      setWinnerInfo({ result: "draw", line: [] });
      onQuip(pickQuip(BANTER_QUIPS.draw));
      onMatchComplete("draw");
      return;
    }

    setTurn("mitch");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-[#F4F8F8] px-4 py-3 dark:border-[#244447] dark:bg-[#111F21]">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="text-[#0D8B8B] dark:text-teal-300">You: X</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-amber-600 dark:text-amber-300">Mitch: O</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-slate-600 dark:text-slate-300">
            {winnerInfo
              ? winnerInfo.result === "X"
                ? "You won!"
                : winnerInfo.result === "O"
                ? "Mitch won!"
                : "Draw!"
              : turn === "player"
              ? "Your turn"
              : "Mitch is picking..."}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 dark:border-[#244447] dark:bg-[#17272B]">
            <button
              type="button"
              onClick={() => setMode("friendly")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                mode === "friendly"
                  ? "bg-[#0D8B8B] text-white dark:bg-[#119E9E]"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Friendly Mitch
            </button>
            <button
              type="button"
              onClick={() => setMode("unbeatable")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                mode === "unbeatable"
                  ? "bg-[#0D8B8B] text-white dark:bg-[#119E9E]"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Unbeatable Minimax
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#0D8B8B] dark:border-[#244447] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[330px]">
        <div className="grid grid-cols-3 gap-3 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-[#1E3A3D] dark:bg-[#111F21]">
          {board.map((cell, idx) => {
            const isWinCell = winnerInfo?.line.includes(idx) ?? false;
            const brainVal = squareScores[idx];
            const disabled = Boolean(winnerInfo) || turn !== "player" || cell !== null;

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => handleCellClick(idx)}
                aria-label={`Square ${idx + 1}`}
                className={`relative aspect-square rounded-2xl border flex items-center justify-center font-display text-4xl font-extrabold transition-all ${
                  isWinCell
                    ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/70 dark:bg-emerald-950/40"
                    : "border-slate-200/90 bg-[#F4F8F8] hover:border-[#0D8B8B]/60 dark:border-[#244447] dark:bg-[#16272B]"
                } ${disabled ? "cursor-default" : "cursor-pointer"}`}
              >
                {cell === "X" && (
                  <span className="text-[#0D8B8B] dark:text-teal-300">X</span>
                )}
                {cell === "O" && (
                  <span className="text-amber-500 dark:text-amber-300">O</span>
                )}
                {cell === null && showBrain && brainVal !== null && (
                  <span
                    className={`font-mono text-sm font-bold px-2 py-0.5 rounded-full ${
                      brainVal > 0
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                        : brainVal === 0
                        ? "bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-teal-100 text-[#0A6E6E] dark:bg-teal-950/70 dark:text-teal-300"
                    }`}
                  >
                    {brainVal > 0 ? `+${brainVal}` : brainVal}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {showBrain && (
          <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            Scores show Mitch&apos;s Minimax outcome if Mitch plays there: +1 (Mitch win), 0 (Draw), -1 (Your win).
          </p>
        )}
      </div>
    </div>
  );
}
