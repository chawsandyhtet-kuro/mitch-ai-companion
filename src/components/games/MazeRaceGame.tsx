import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Flag,
  RefreshCw,
} from "lucide-react";
import { BANTER_QUIPS, pickQuip } from "./banter";
import type { GameComponentProps } from "./types";

const SIZE = 15;
const START = { r: 1, c: 1 };
const EXIT = { r: SIZE - 2, c: SIZE - 2 }; // (13, 13)

type CellPos = { r: number; c: number };

function posKey(r: number, c: number): string {
  return `${r},${c}`;
}

function generateSolvableMaze(): number[][] {
  // 1 = wall, 0 = open path
  const grid = Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(1));

  const carve = (r: number, c: number) => {
    grid[r][c] = 0;
    const dirs = [
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < SIZE - 1 && nc > 0 && nc < SIZE - 1 && grid[nr][nc] === 1) {
        grid[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  };

  carve(START.r, START.c);
  grid[EXIT.r][EXIT.c] = 0;

  // Add a few extra loops so A* has real route choices to evaluate
  let extraOpenings = 0;
  for (let tries = 0; tries < 60 && extraOpenings < 6; tries++) {
    const r = 1 + Math.floor(Math.random() * (SIZE - 2));
    const c = 1 + Math.floor(Math.random() * (SIZE - 2));
    if (grid[r][c] !== 1) continue;
    const horizontalBridge = grid[r][c - 1] === 0 && grid[r][c + 1] === 0 && grid[r - 1][c] === 1 && grid[r + 1][c] === 1;
    const verticalBridge = grid[r - 1][c] === 0 && grid[r + 1][c] === 0 && grid[r][c - 1] === 1 && grid[r][c + 1] === 1;
    if (horizontalBridge || verticalBridge) {
      grid[r][c] = 0;
      extraOpenings++;
    }
  }

  return grid;
}

/**
 * Real A* (A-Star) Search with Manhattan distance heuristic.
 * Returns both explored nodes (closed set) and the optimal shortest path.
 */
function runAStar(
  maze: number[][],
  from: CellPos,
  goal: CellPos
): { path: CellPos[]; explored: Set<string> } {
  const startKey = posKey(from.r, from.c);
  const goalKey = posKey(goal.r, goal.c);

  const openSet = new Set<string>([startKey]);
  const explored = new Set<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const fScore = new Map<string, number>([
    [startKey, Math.abs(from.r - goal.r) + Math.abs(from.c - goal.c)],
  ]);

  const parseKey = (k: string): CellPos => {
    const [r, c] = k.split(",").map(Number);
    return { r, c };
  };

  while (openSet.size > 0) {
    let currentKey = "";
    let lowestF = Infinity;
    for (const k of openSet) {
      const f = fScore.get(k) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentKey = k;
      }
    }

    if (currentKey === goalKey) {
      const path: CellPos[] = [];
      let curr: string | undefined = currentKey;
      while (curr) {
        path.unshift(parseKey(curr));
        curr = cameFrom.get(curr);
      }
      return { path, explored };
    }

    openSet.delete(currentKey);
    explored.add(currentKey);
    const curr = parseKey(currentKey);

    const neighbors = [
      { r: curr.r - 1, c: curr.c },
      { r: curr.r + 1, c: curr.c },
      { r: curr.r, c: curr.c - 1 },
      { r: curr.r, c: curr.c + 1 },
    ];

    for (const n of neighbors) {
      if (n.r < 0 || n.r >= SIZE || n.c < 0 || n.c >= SIZE) continue;
      if (maze[n.r][n.c] === 1) continue;

      const nk = posKey(n.r, n.c);
      if (explored.has(nk)) continue;

      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, currentKey);
        gScore.set(nk, tentativeG);
        const h = Math.abs(n.r - goal.r) + Math.abs(n.c - goal.c);
        fScore.set(nk, tentativeG + h);
        openSet.add(nk);
      }
    }
  }

  return { path: [from], explored };
}

export function MazeRaceGame({
  showBrain,
  isTabActive,
  onQuip,
  onMatchComplete,
}: GameComponentProps) {
  const [maze, setMaze] = useState<number[][]>(() => generateSolvableMaze());
  const [playerPos, setPlayerPos] = useState<CellPos>(START);
  const [mitchPos, setMitchPos] = useState<CellPos>(START);
  const [raceStatus, setRaceStatus] = useState<"ready" | "racing" | "finished">(
    "ready"
  );
  const [winner, setWinner] = useState<"player" | "mitch" | null>(null);
  const [closeBanterSent, setCloseBanterSent] = useState(false);

  const aStarData = useMemo(
    () => runAStar(maze, mitchPos, EXIT),
    [maze, mitchPos]
  );

  const plannedPathSet = useMemo(() => {
    const s = new Set<string>();
    for (const p of aStarData.path) {
      s.add(posKey(p.r, p.c));
    }
    return s;
  }, [aStarData.path]);

  const handleNewMaze = useCallback(() => {
    setMaze(generateSolvableMaze());
    setPlayerPos(START);
    setMitchPos(START);
    setRaceStatus("ready");
    setWinner(null);
    setCloseBanterSent(false);
    onQuip(pickQuip(BANTER_QUIPS.mazeStart));
  }, [onQuip]);

  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (raceStatus === "finished") return;

      const nr = playerPos.r + dr;
      const nc = playerPos.c + dc;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return;
      if (maze[nr][nc] === 1) return;

      if (raceStatus === "ready") {
        setRaceStatus("racing");
      }

      const nextPos = { r: nr, c: nc };
      setPlayerPos(nextPos);

      if (nr === EXIT.r && nc === EXIT.c) {
        setRaceStatus("finished");
        setWinner("player");
        onQuip(pickQuip(BANTER_QUIPS.playerWin));
        onMatchComplete("win");
        return;
      }

      const playerDist = Math.abs(nr - EXIT.r) + Math.abs(nc - EXIT.c);
      const mitchDist = Math.abs(mitchPos.r - EXIT.r) + Math.abs(mitchPos.c - EXIT.c);
      if (!closeBanterSent && playerDist <= 4 && mitchDist <= 4) {
        setCloseBanterSent(true);
        onQuip(pickQuip(BANTER_QUIPS.mazeCloseFinish));
      }
    },
    [raceStatus, playerPos, maze, mitchPos, closeBanterSent, onMatchComplete, onQuip]
  );

  // Keyboard Arrow Keys & WASD support
  useEffect(() => {
    if (!isTabActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          movePlayer(1, 0);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          movePlayer(0, 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTabActive, movePlayer]);

  // Mitch A* step interval during race
  useEffect(() => {
    if (!isTabActive || raceStatus !== "racing") return;

    const id = window.setInterval(() => {
      setMitchPos((prev) => {
        const { path } = runAStar(maze, prev, EXIT);
        if (path.length <= 1) return prev;
        const nextStep = path[1];

        if (nextStep.r === EXIT.r && nextStep.c === EXIT.c) {
          setRaceStatus("finished");
          setWinner("mitch");
          onQuip(pickQuip(BANTER_QUIPS.mitchWin));
          onMatchComplete("loss");
        }
        return nextStep;
      });
    }, 350);

    return () => window.clearInterval(id);
  }, [isTabActive, raceStatus, maze, onMatchComplete, onQuip]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-[#F4F8F8] px-4 py-3 dark:border-[#244447] dark:bg-[#111F21]">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 text-[#0D8B8B] dark:text-teal-300">
            <span className="h-3 w-3 rounded-full bg-[#0D8B8B] inline-block" />
            You
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
            <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
            Mitch (A*)
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300">
            <Flag className="h-3.5 w-3.5" />
            Exit
          </span>
          <span className="text-slate-400 dark:text-slate-500">·</span>
          <span className="text-slate-600 dark:text-slate-300">
            {raceStatus === "ready"
              ? "Move with Arrow keys, WASD, or D-pad to start!"
              : raceStatus === "racing"
              ? "Race in progress!"
              : winner === "player"
              ? "You reached the exit first!"
              : "Mitch reached the exit first!"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNewMaze}
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#0D8B8B] dark:border-[#244447] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>New Maze</span>
        </button>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        {/* 15x15 Maze Grid */}
        <div className="flex justify-center lg:col-span-8">
          <div className="w-full max-w-[440px] rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-sm dark:border-[#1E3A3D] dark:bg-[#111F21]">
            <div className="grid grid-cols-15 gap-0.5 sm:gap-1">
              {maze.map((row, r) =>
                row.map((cell, c) => {
                  const key = posKey(r, c);
                  const isPlayer = playerPos.r === r && playerPos.c === c;
                  const isMitch = mitchPos.r === r && mitchPos.c === c;
                  const isExit = EXIT.r === r && EXIT.c === c;
                  const isPath = showBrain && plannedPathSet.has(key);
                  const isExplored = showBrain && aStarData.explored.has(key);

                  let bg =
                    cell === 1
                      ? "bg-slate-800 dark:bg-[#1D3539]"
                      : "bg-slate-100 dark:bg-[#0D181A]";

                  if (cell === 0) {
                    if (isPath) {
                      bg = "bg-amber-200/80 dark:bg-amber-500/35";
                    } else if (isExplored) {
                      bg = "bg-teal-100/80 dark:bg-teal-900/45";
                    }
                    if (isExit) {
                      bg = "bg-emerald-500 text-white";
                    }
                  }

                  return (
                    <div
                      key={key}
                      className={`aspect-square rounded-[4px] flex items-center justify-center transition-colors ${bg}`}
                    >
                      {isPlayer && isMitch ? (
                        <div className="h-3/4 w-3/4 rounded-full bg-gradient-to-tr from-[#0D8B8B] to-amber-400 ring-1 ring-white" />
                      ) : isPlayer ? (
                        <div
                          title="You"
                          className="h-3/4 w-3/4 rounded-full bg-[#0D8B8B] shadow-2xs ring-1 ring-white"
                        />
                      ) : isMitch ? (
                        <div
                          title="Mitch (A*)"
                          className="h-3/4 w-3/4 rounded-full bg-amber-400 shadow-2xs ring-1 ring-slate-900/20"
                        />
                      ) : isExit ? (
                        <Flag className="h-3 w-3" />
                      ) : isPath ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600/80 dark:bg-amber-300" />
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: On-Screen D-Pad + Brain Legend */}
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-200/90 bg-[#F4F8F8] p-5 dark:border-[#244447] dark:bg-[#111F21] lg:col-span-4">
          <div className="text-center">
            <h3 className="font-display text-sm font-bold text-[#111F21] dark:text-white">
              Controls (Arrows / WASD)
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Tap the D-pad or use your keyboard
            </p>
          </div>

          {/* Crisp D-Pad */}
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button
              type="button"
              onClick={() => movePlayer(-1, 0)}
              aria-label="Move Up"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:border-[#0D8B8B] hover:text-[#0D8B8B] active:scale-95 dark:border-[#2B4F53] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            <div />

            <button
              type="button"
              onClick={() => movePlayer(0, -1)}
              aria-label="Move Left"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:border-[#0D8B8B] hover:text-[#0D8B8B] active:scale-95 dark:border-[#2B4F53] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(1, 0)}
              aria-label="Move Down"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:border-[#0D8B8B] hover:text-[#0D8B8B] active:scale-95 dark:border-[#2B4F53] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => movePlayer(0, 1)}
              aria-label="Move Right"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:border-[#0D8B8B] hover:text-[#0D8B8B] active:scale-95 dark:border-[#2B4F53] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {showBrain && (
            <div className="w-full rounded-2xl border border-teal-200/80 bg-white p-3.5 text-xs space-y-1.5 dark:border-teal-800/50 dark:bg-[#16272B]">
              <div className="font-bold text-[#0D8B8B] dark:text-teal-300">
                A* Search Brain Visualizer
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-3 w-3 rounded-xs bg-amber-200 border border-amber-400 inline-block" />
                <span>Shortest planned path ({aStarData.path.length - 1} steps left)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-3 w-3 rounded-xs bg-teal-100 border border-teal-400 inline-block" />
                <span>Explored A* nodes ({aStarData.explored.size} visited)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
