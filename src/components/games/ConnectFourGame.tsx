import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { BANTER_QUIPS, pickQuip } from "./banter";
import type { GameComponentProps } from "./types";

const ROWS = 6;
const COLS = 7;
const COL_ORDER = [3, 2, 4, 1, 5, 0, 6]; // Center-first move ordering for Alpha-Beta

type Cell = 0 | 1 | 2; // 0 = empty, 1 = Player, 2 = Mitch
type Difficulty = "casual" | "smart";

function createBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
}

function getAvailableRow(board: Cell[][], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function findWinner(
  board: Cell[][]
): { winner: Cell; line: Array<[number, number]> } | null {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c];
      if (player === 0) continue;

      for (const [dr, dc] of dirs) {
        const line: Array<[number, number]> = [[r, c]];
        let ok = true;
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (
            nr < 0 ||
            nr >= ROWS ||
            nc < 0 ||
            nc >= COLS ||
            board[nr][nc] !== player
          ) {
            ok = false;
            break;
          }
          line.push([nr, nc]);
        }
        if (ok) return { winner: player, line };
      }
    }
  }
  return null;
}

function isBoardFull(board: Cell[][]): boolean {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) return false;
  }
  return true;
}

function scoreWindow(window: Cell[], aiPlayer: Cell): number {
  const humanPlayer: Cell = aiPlayer === 2 ? 1 : 2;
  let aiCount = 0;
  let humanCount = 0;
  let emptyCount = 0;

  for (const v of window) {
    if (v === aiPlayer) aiCount++;
    else if (v === humanPlayer) humanCount++;
    else emptyCount++;
  }

  if (aiCount === 4) return 10000;
  if (humanCount === 4) return -10000;
  if (aiCount === 3 && emptyCount === 1) return 18;
  if (aiCount === 2 && emptyCount === 2) return 4;
  if (humanCount === 3 && emptyCount === 1) return -26;
  if (humanCount === 2 && emptyCount === 2) return -4;
  return 0;
}

function evaluateBoard(board: Cell[][]): number {
  let score = 0;

  // Center column preference
  const centerCol = Math.floor(COLS / 2);
  let centerCount = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === 2) centerCount++;
  }
  score += centerCount * 6;

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow(
        [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]],
        2
      );
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      score += scoreWindow(
        [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]],
        2
      );
    }
  }
  // Positive diagonal
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow(
        [
          board[r][c],
          board[r + 1][c + 1],
          board[r + 2][c + 2],
          board[r + 3][c + 3],
        ],
        2
      );
    }
  }
  // Negative diagonal
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow(
        [
          board[r][c],
          board[r - 1][c + 1],
          board[r - 2][c + 2],
          board[r - 3][c + 3],
        ],
        2
      );
    }
  }

  return score;
}

function minimax(
  board: Cell[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): { col: number; score: number } {
  const validCols = COL_ORDER.filter((c) => getAvailableRow(board, c) !== -1);
  const winInfo = findWinner(board);

  if (winInfo) {
    if (winInfo.winner === 2) return { col: -1, score: 100000 + depth * 100 };
    return { col: -1, score: -100000 - depth * 100 };
  }
  if (validCols.length === 0) {
    return { col: -1, score: 0 };
  }
  if (depth === 0) {
    return { col: -1, score: evaluateBoard(board) };
  }

  if (maximizing) {
    let bestScore = -Infinity;
    let bestCol = validCols[0];

    for (const col of validCols) {
      const row = getAvailableRow(board, col);
      board[row][col] = 2;
      const { score } = minimax(board, depth - 1, alpha, beta, false);
      board[row][col] = 0;

      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: bestScore };
  } else {
    let bestScore = Infinity;
    let bestCol = validCols[0];

    for (const col of validCols) {
      const row = getAvailableRow(board, col);
      board[row][col] = 1;
      const { score } = minimax(board, depth - 1, alpha, beta, true);
      board[row][col] = 0;

      if (score < bestScore) {
        bestScore = score;
        bestCol = col;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: bestScore };
  }
}

function evaluateAllColumns(
  board: Cell[][],
  depth: number
): Array<number | null> {
  const scores: Array<number | null> = Array(COLS).fill(null);
  for (let c = 0; c < COLS; c++) {
    const r = getAvailableRow(board, c);
    if (r === -1) continue;
    const clone = board.map((row) => [...row]);
    clone[r][c] = 2;
    const winNow = findWinner(clone);
    if (winNow?.winner === 2) {
      scores[c] = 999;
    } else {
      const { score } = minimax(clone, depth - 1, -Infinity, Infinity, false);
      scores[c] = Math.max(-999, Math.min(999, Math.round(score / 100) || score));
    }
  }
  return scores;
}

export function ConnectFourGame({
  showBrain,
  onQuip,
  onMatchComplete,
}: GameComponentProps) {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [difficulty, setDifficulty] = useState<Difficulty>("smart");
  const [turn, setTurn] = useState<"player" | "mitch">("player");
  const [isFinished, setIsFinished] = useState(false);
  const [winLine, setWinLine] = useState<Array<[number, number]>>([]);
  const [winner, setWinner] = useState<Cell | "draw" | null>(null);
  const [lastDrop, setLastDrop] = useState<{ row: number; col: number } | null>(
    null
  );

  const columnScores = useMemo(() => {
    if (!showBrain || isFinished) return Array<number | null>(COLS).fill(null);
    return evaluateAllColumns(board, difficulty === "smart" ? 4 : 2);
  }, [board, showBrain, isFinished, difficulty]);

  const bestBrainCol = useMemo(() => {
    let bestC = -1;
    let bestVal = -Infinity;
    columnScores.forEach((s, idx) => {
      if (s !== null && s > bestVal) {
        bestVal = s;
        bestC = idx;
      }
    });
    return bestC;
  }, [columnScores]);

  const handleReset = useCallback(() => {
    setBoard(createBoard());
    setTurn("player");
    setIsFinished(false);
    setWinLine([]);
    setWinner(null);
    setLastDrop(null);
    onQuip("Fresh 7×6 Connect Four board! Drop your first disc anywhere.");
  }, [onQuip]);

  // Mitch AI turn effect
  useEffect(() => {
    if (turn !== "mitch" || isFinished) return;
    const timer = window.setTimeout(() => {
      const clone = board.map((r) => [...r]);
      const validCols = COL_ORDER.filter((c) => getAvailableRow(clone, c) !== -1);
      if (validCols.length === 0) return;

      let chosenCol = validCols[0];
      if (difficulty === "casual" && Math.random() < 0.35) {
        chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
      } else {
        const depth = difficulty === "smart" ? 5 : 2;
        const { col } = minimax(clone, depth, -Infinity, Infinity, true);
        if (col !== -1) chosenCol = col;
      }

      const targetRow = getAvailableRow(clone, chosenCol);
      if (targetRow === -1) return;
      clone[targetRow][chosenCol] = 2;

      setBoard(clone);
      setLastDrop({ row: targetRow, col: chosenCol });

      const winInfo = findWinner(clone);
      if (winInfo) {
        setWinLine(winInfo.line);
        setWinner(2);
        setIsFinished(true);
        onQuip(pickQuip(BANTER_QUIPS.mitchWin));
        onMatchComplete("loss");
        return;
      }

      if (isBoardFull(clone)) {
        setWinner("draw");
        setIsFinished(true);
        onQuip(pickQuip(BANTER_QUIPS.draw));
        onMatchComplete("draw");
        return;
      }

      setTurn("player");
      onQuip(pickQuip(BANTER_QUIPS.connect4Move));
    }, 360);

    return () => window.clearTimeout(timer);
  }, [turn, isFinished, board, difficulty, onMatchComplete, onQuip]);

  const handleDropInCol = (col: number) => {
    if (turn !== "player" || isFinished) return;
    const row = getAvailableRow(board, col);
    if (row === -1) return;

    const next = board.map((r) => [...r]);
    next[row][col] = 1;
    setBoard(next);
    setLastDrop({ row, col });

    const winInfo = findWinner(next);
    if (winInfo) {
      setWinLine(winInfo.line);
      setWinner(1);
      setIsFinished(true);
      onQuip(pickQuip(BANTER_QUIPS.playerWin));
      onMatchComplete("win");
      return;
    }

    if (isBoardFull(next)) {
      setWinner("draw");
      setIsFinished(true);
      onQuip(pickQuip(BANTER_QUIPS.draw));
      onMatchComplete("draw");
      return;
    }

    setTurn("mitch");
  };

  const isWinningCell = (r: number, c: number) =>
    winLine.some(([wr, wc]) => wr === r && wc === c);

  return (
    <div className="space-y-5">
      {/* Controls & Difficulty Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-[#F4F8F8] px-4 py-3 dark:border-[#244447] dark:bg-[#111F21]">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-[#0D8B8B] inline-block" />
            <span className="text-[#111F21] dark:text-white">You</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">vs</span>
          <div className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-[#111F21] dark:text-white">Mitch</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500">·</span>
          <span className="text-slate-600 dark:text-slate-300">
            {isFinished
              ? winner === 1
                ? "You won!"
                : winner === 2
                ? "Mitch won!"
                : "Draw game!"
              : turn === "player"
              ? "Your turn — click any column"
              : "Mitch is calculating..."}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 dark:border-[#244447] dark:bg-[#17272B]">
            {(["casual", "smart"] as Difficulty[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDifficulty(mode)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  difficulty === mode
                    ? "bg-[#0D8B8B] text-white dark:bg-[#119E9E]"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {mode === "smart" ? "Smart (Alpha-Beta)" : "Casual"}
              </button>
            ))}
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

      {/* Board Container */}
      <div className="mx-auto max-w-[500px]">
        {/* Show Mitch's Brain Column Evaluation Scores */}
        {showBrain && (
          <div className="mb-2 grid grid-cols-7 gap-2 px-3">
            {columnScores.map((score, c) => (
              <div
                key={c}
                className={`rounded-lg py-1 text-center font-mono text-[11px] font-bold transition-colors ${
                  score === null
                    ? "bg-slate-100 text-slate-400 dark:bg-[#1A2C30] dark:text-slate-500"
                    : c === bestBrainCol
                    ? "bg-amber-400/90 text-slate-950 shadow-2xs"
                    : "bg-teal-50 text-[#0A6E6E] dark:bg-teal-950/70 dark:text-teal-200"
                }`}
                title={
                  score === null
                    ? `Column ${c + 1} is full`
                    : `Minimax score for Mitch in column ${c + 1}: ${score}`
                }
              >
                {score === null ? "Full" : score > 0 ? `+${score}` : score}
              </div>
            ))}
          </div>
        )}

        {/* 7x6 Board */}
        <div className="rounded-3xl border border-teal-700/30 bg-[#0A6E6E] p-3 sm:p-4 shadow-md dark:border-teal-500/30 dark:bg-[#0D4A4E]">
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (__, c) => {
                const val = board[r][c];
                const winning = isWinningCell(r, c);
                const isJustDropped =
                  lastDrop?.row === r && lastDrop?.col === c;
                const colPlayable =
                  !isFinished && turn === "player" && getAvailableRow(board, c) !== -1;

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!colPlayable}
                    onClick={() => handleDropInCol(c)}
                    aria-label={`Drop disc in column ${c + 1}`}
                    className={`aspect-square rounded-full flex items-center justify-center transition-transform ${
                      colPlayable ? "cursor-pointer hover:scale-[1.03]" : "cursor-default"
                    } ${
                      val === 0
                        ? "bg-white/95 dark:bg-[#111F21] shadow-inner"
                        : val === 1
                        ? `bg-[#14B8B8] shadow-sm ${isJustDropped ? "animate-disc-drop" : ""}`
                        : `bg-amber-400 shadow-sm ${isJustDropped ? "animate-disc-drop" : ""}`
                    } ${winning ? "ring-4 ring-white dark:ring-teal-200" : ""}`}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
