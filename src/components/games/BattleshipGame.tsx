import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Crosshair,
  Eraser,
  Play,
  RotateCcw,
  RotateCw,
  Shuffle,
} from "lucide-react";
import { BANTER_QUIPS, pickQuip } from "./banter";
import type { GameComponentProps } from "./types";

const GRID_SIZE = 10;
const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

interface ShipSpec {
  id: string;
  name: string;
  code: string;
  length: number;
}

const FLEET_SPECS: ShipSpec[] = [
  { id: "carrier", name: "Carrier", code: "C", length: 5 },
  { id: "battleship", name: "Battleship", code: "B", length: 4 },
  { id: "cruiser", name: "Cruiser", code: "R", length: 3 },
  { id: "submarine", name: "Submarine", code: "S", length: 3 },
  { id: "destroyer", name: "Destroyer", code: "D", length: 2 },
];

type Orientation = "H" | "V";

interface PlacedShip {
  id: string;
  name: string;
  code: string;
  length: number;
  cells: Array<{ r: number; c: number }>;
  hits: number;
}

type ShotState = "none" | "miss" | "hit" | "sunk";

function createEmptyGrid<T>(fill: T): T[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => fill)
  );
}

function getShipCells(
  r: number,
  c: number,
  length: number,
  orientation: Orientation
): Array<{ r: number; c: number }> | null {
  const cells: Array<{ r: number; c: number }> = [];
  for (let i = 0; i < length; i++) {
    const nr = orientation === "V" ? r + i : r;
    const nc = orientation === "H" ? c + i : c;
    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) {
      return null;
    }
    cells.push({ r: nr, c: nc });
  }
  return cells;
}

function canPlaceShip(
  ships: PlacedShip[],
  cells: Array<{ r: number; c: number }>,
  ignoreShipId?: string
): boolean {
  const occupied = new Set<string>();
  for (const s of ships) {
    if (s.id === ignoreShipId) continue;
    for (const cell of s.cells) {
      occupied.add(`${cell.r},${cell.c}`);
    }
  }
  return cells.every((cell) => !occupied.has(`${cell.r},${cell.c}`));
}

function getShipOrientation(ship: PlacedShip): Orientation {
  if (ship.cells.length > 1 && ship.cells[1].r > ship.cells[0].r) {
    return "V";
  }
  return "H";
}

/**
 * Tries to rotate a placed ship in-place around its anchor; if it hits the right/bottom
 * boundary, slides it back along the new axis so edge-placed ships rotate smoothly!
 */
function findRotatedCells(
  ship: PlacedShip,
  allShips: PlacedShip[],
  nextOri: Orientation
): Array<{ r: number; c: number }> | null {
  const anchor = ship.cells[0];
  const direct = getShipCells(anchor.r, anchor.c, ship.length, nextOri);
  if (direct && canPlaceShip(allShips, direct, ship.id)) {
    return direct;
  }

  // Slide back if overflowing grid edge
  const maxAnchorR = nextOri === "V" ? GRID_SIZE - ship.length : anchor.r;
  const maxAnchorC = nextOri === "H" ? GRID_SIZE - ship.length : anchor.c;
  const clampedR = Math.min(anchor.r, maxAnchorR);
  const clampedC = Math.min(anchor.c, maxAnchorC);

  const slid = getShipCells(clampedR, clampedC, ship.length, nextOri);
  if (slid && canPlaceShip(allShips, slid, ship.id)) {
    return slid;
  }

  return null;
}

function generateRandomFleet(): PlacedShip[] {
  const fleet: PlacedShip[] = [];
  for (const spec of FLEET_SPECS) {
    let placed = false;
    let guard = 0;
    while (!placed && guard < 400) {
      guard++;
      const orientation: Orientation = Math.random() < 0.5 ? "H" : "V";
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      const cells = getShipCells(r, c, spec.length, orientation);
      if (cells && canPlaceShip(fleet, cells)) {
        fleet.push({
          id: spec.id,
          name: spec.name,
          code: spec.code,
          length: spec.length,
          cells,
          hits: 0,
        });
        placed = true;
      }
    }
  }
  return fleet;
}

/**
 * Computes Mitch's live 10x10 Probability Density Heatmap across all remaining
 * unsunk ships of the player, switching cleanly between Hunt Mode and Target Mode.
 */
function computeProbabilityDensityGrid(
  shotsOnPlayer: ShotState[][],
  playerShips: PlacedShip[]
): { heatmap: number[][]; maxScore: number; mode: "Hunt" | "Target" } {
  const heatmap = createEmptyGrid<number>(0);

  const activeHitSet = new Set<string>();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (shotsOnPlayer[r][c] === "hit") {
        activeHitSet.add(`${r},${c}`);
      }
    }
  }

  const isTargetMode = activeHitSet.size > 0;
  const remainingLengths = playerShips
    .filter((s) => s.hits < s.length)
    .map((s) => s.length);

  for (const len of remainingLengths) {
    for (const orientation of ["H", "V"] as Orientation[]) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const cells = getShipCells(r, c, len, orientation);
          if (!cells) continue;

          let blocked = false;
          let hitsCovered = 0;
          for (const cell of cells) {
            const state = shotsOnPlayer[cell.r][cell.c];
            if (state === "miss" || state === "sunk") {
              blocked = true;
              break;
            }
            if (state === "hit") {
              hitsCovered++;
            }
          }
          if (blocked) continue;

          if (isTargetMode) {
            if (hitsCovered === 0) continue;
            const weight = 18 * hitsCovered * hitsCovered;
            for (const cell of cells) {
              if (shotsOnPlayer[cell.r][cell.c] === "none") {
                heatmap[cell.r][cell.c] += weight;
              }
            }
          } else {
            for (const cell of cells) {
              if (shotsOnPlayer[cell.r][cell.c] === "none") {
                heatmap[cell.r][cell.c] += 1;
              }
            }
          }
        }
      }
    }
  }

  if (isTargetMode) {
    let anyTargetScore = false;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (heatmap[r][c] > 0) {
          anyTargetScore = true;
          break;
        }
      }
      if (anyTargetScore) break;
    }

    if (!anyTargetScore) {
      for (const hitKey of activeHitSet) {
        const [hr, hc] = hitKey.split(",").map(Number);
        const dirs = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ];
        for (const [dr, dc] of dirs) {
          const nr = hr + dr;
          const nc = hc + dc;
          if (
            nr >= 0 &&
            nr < GRID_SIZE &&
            nc >= 0 &&
            nc < GRID_SIZE &&
            shotsOnPlayer[nr][nc] === "none"
          ) {
            heatmap[nr][nc] += 15;
          }
        }
      }
    }
  }

  let maxScore = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (heatmap[r][c] > maxScore) {
        maxScore = heatmap[r][c];
      }
    }
  }

  return {
    heatmap,
    maxScore,
    mode: isTargetMode ? "Target" : "Hunt",
  };
}

export function BattleshipGame({
  showBrain,
  onQuip,
  onMatchComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<"setup" | "battle" | "finished">("setup");
  const [orientation, setOrientation] = useState<Orientation>("H");
  const [playerShips, setPlayerShips] = useState<PlacedShip[]>(() =>
    generateRandomFleet()
  );
  const [mitchShips, setMitchShips] = useState<PlacedShip[]>(() =>
    generateRandomFleet()
  );
  const [selectedShipId, setSelectedShipId] = useState<string>("carrier");
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(
    null
  );
  const [setupHint, setSetupHint] = useState<string>(
    "Tap any ship below or on your grid, click Rotate, and tap a cell to move it."
  );

  const [shotsOnMitch, setShotsOnMitch] = useState<ShotState[][]>(() =>
    createEmptyGrid<ShotState>("none")
  );
  const [shotsOnPlayer, setShotsOnPlayer] = useState<ShotState[][]>(() =>
    createEmptyGrid<ShotState>("none")
  );
  const [isMitchThinking, setIsMitchThinking] = useState(false);
  const [winner, setWinner] = useState<"player" | "mitch" | null>(null);
  const [lastPlayerShot, setLastPlayerShot] = useState<string | null>(null);
  const [lastMitchShot, setLastMitchShot] = useState<string | null>(null);

  const selectedSpec =
    FLEET_SPECS.find((s) => s.id === selectedShipId) ?? FLEET_SPECS[0];

  const handleSelectShipPill = (spec: ShipSpec) => {
    setSelectedShipId(spec.id);
    const placed = playerShips.find((s) => s.id === spec.id);
    if (placed) {
      const ori = getShipOrientation(placed);
      setOrientation(ori);
      setSetupHint(
        `${spec.name} (${spec.length}) selected — click Rotate or tap a grid cell to move it.`
      );
    } else {
      setSetupHint(
        `Tap any open cell on Your Fleet to place ${spec.name} (${spec.length}) ${
          orientation === "H" ? "Horizontally" : "Vertically"
        }.`
      );
    }
  };

  /**
   * Immediately rotates the selected ship on the board if already placed,
   * and toggles placement orientation for unplaced/next placement.
   */
  const handleRotate = useCallback(() => {
    const existing = playerShips.find((s) => s.id === selectedShipId);
    if (existing) {
      const currentOri = getShipOrientation(existing);
      const nextOri: Orientation = currentOri === "H" ? "V" : "H";
      const rotated = findRotatedCells(existing, playerShips, nextOri);

      if (rotated) {
        setPlayerShips((prev) =>
          prev.map((s) => (s.id === existing.id ? { ...s, cells: rotated } : s))
        );
        setOrientation(nextOri);
        setSetupHint(
          `Rotated ${existing.name} to ${
            nextOri === "H" ? "Horizontal" : "Vertical"
          }!`
        );
      } else {
        setOrientation(nextOri);
        setSetupHint(
          `Another ship blocks rotating ${existing.name} there — tap an open cell to place it ${
            nextOri === "H" ? "Horizontally" : "Vertically"
          }.`
        );
      }
    } else {
      setOrientation((prev) => {
        const nextOri = prev === "H" ? "V" : "H";
        setSetupHint(
          `Orientation set to ${
            nextOri === "H" ? "Horizontal" : "Vertical"
          } — tap Your Fleet to place ${selectedSpec.name}.`
        );
        return nextOri;
      });
    }
  }, [playerShips, selectedShipId, selectedSpec.name]);

  // Allow pressing R during setup to rotate immediately
  useEffect(() => {
    if (phase !== "setup") return;
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRotate();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, handleRotate]);

  const playerShipCellMap = useMemo(() => {
    const map = new Map<string, PlacedShip>();
    for (const s of playerShips) {
      for (const cell of s.cells) {
        map.set(`${cell.r},${cell.c}`, s);
      }
    }
    return map;
  }, [playerShips]);

  const mitchShipCellMap = useMemo(() => {
    const map = new Map<string, PlacedShip>();
    for (const s of mitchShips) {
      for (const cell of s.cells) {
        map.set(`${cell.r},${cell.c}`, s);
      }
    }
    return map;
  }, [mitchShips]);

  const densityResult = useMemo(
    () => computeProbabilityDensityGrid(shotsOnPlayer, playerShips),
    [shotsOnPlayer, playerShips]
  );

  const previewCells = useMemo(() => {
    if (phase !== "setup" || !hoverCell) return null;
    const cells = getShipCells(
      hoverCell.r,
      hoverCell.c,
      selectedSpec.length,
      orientation
    );
    if (!cells) return { cells: [] as Array<{ r: number; c: number }>, valid: false };
    const valid = canPlaceShip(playerShips, cells, selectedSpec.id);
    return { cells, valid };
  }, [phase, hoverCell, selectedSpec, orientation, playerShips]);

  const handleSetupCellClick = (r: number, c: number) => {
    if (phase !== "setup") return;

    const existing = playerShipCellMap.get(`${r},${c}`);

    // If user clicked a DIFFERENT ship on the grid, select it right away!
    if (existing && existing.id !== selectedShipId) {
      const ori = getShipOrientation(existing);
      setSelectedShipId(existing.id);
      setOrientation(ori);
      setSetupHint(
        `${existing.name} (${existing.length}) selected — click Rotate or tap a new cell to move it.`
      );
      return;
    }

    // If user clicked the CURRENTLY SELECTED ship on the grid, rotate it in place!
    if (existing && existing.id === selectedShipId) {
      handleRotate();
      return;
    }

    // Otherwise, move/place the selected ship starting at (r, c)
    const cells = getShipCells(r, c, selectedSpec.length, orientation);
    if (!cells) {
      setSetupHint(
        `${selectedSpec.name} (${selectedSpec.length}) goes off the edge there — try closer to the center or click Rotate.`
      );
      return;
    }
    if (!canPlaceShip(playerShips, cells, selectedSpec.id)) {
      setSetupHint(
        `${selectedSpec.name} overlaps another ship there — pick a clear spot on the grid.`
      );
      return;
    }

    const updatedFleet = [
      ...playerShips.filter((s) => s.id !== selectedSpec.id),
      {
        id: selectedSpec.id,
        name: selectedSpec.name,
        code: selectedSpec.code,
        length: selectedSpec.length,
        cells,
        hits: 0,
      },
    ];
    setPlayerShips(updatedFleet);

    // Advance selection to next unplaced ship (or next in list)
    const unplaced = FLEET_SPECS.find(
      (spec) => !updatedFleet.some((s) => s.id === spec.id)
    );
    if (unplaced) {
      setSelectedShipId(unplaced.id);
      setSetupHint(
        `Placed ${selectedSpec.name}! Now click Your Fleet to place ${unplaced.name} (${unplaced.length}).`
      );
    } else {
      setSetupHint(
        `Placed ${selectedSpec.name}! All 5 ships ready — adjust more or hit Start Battle.`
      );
    }
  };

  const handleAutoPlaceFleet = () => {
    const randomized = generateRandomFleet();
    setPlayerShips(randomized);
    const active = randomized.find((s) => s.id === selectedShipId);
    if (active) {
      setOrientation(getShipOrientation(active));
    }
    setSetupHint("All 5 ships placed! Click any ship to tweak or press Start Battle.");
    onQuip("Fleet shuffled! Click any ship to reposition or Start Battle whenever you're ready.");
  };

  const handleClearFleet = () => {
    setPlayerShips([]);
    setSelectedShipId(FLEET_SPECS[0].id);
    setOrientation("H");
    setSetupHint(
      `Board cleared! Tap Your Fleet to place ${FLEET_SPECS[0].name} (${FLEET_SPECS[0].length}), or use Auto-Place.`
    );
  };

  const handleStartBattle = () => {
    if (playerShips.length < FLEET_SPECS.length) {
      setSetupHint(
        `Place all 5 ships first (${playerShips.length}/5 placed), or click Auto-Place Fleet!`
      );
      return;
    }
    setPhase("battle");
    setShotsOnMitch(createEmptyGrid<ShotState>("none"));
    setShotsOnPlayer(createEmptyGrid<ShotState>("none"));
    setWinner(null);
    setLastPlayerShot(null);
    setLastMitchShot(null);
    onQuip("All 5 ships anchored! Fire the opening volley on my waters.");
  };

  const handleNewMatch = useCallback(() => {
    setPhase("setup");
    setPlayerShips(generateRandomFleet());
    setMitchShips(generateRandomFleet());
    setShotsOnMitch(createEmptyGrid<ShotState>("none"));
    setShotsOnPlayer(createEmptyGrid<ShotState>("none"));
    setIsMitchThinking(false);
    setWinner(null);
    setLastPlayerShot(null);
    setLastMitchShot(null);
    setSetupHint(
      "Tap any ship below or on your grid, click Rotate, and tap a cell to move it."
    );
    onQuip(pickQuip(BANTER_QUIPS.battleshipSetup));
  }, [onQuip]);

  const executeMitchTurn = useCallback(
    (currentShotsOnPlayer: ShotState[][], currentPlayerShips: PlacedShip[]) => {
      const { heatmap } = computeProbabilityDensityGrid(
        currentShotsOnPlayer,
        currentPlayerShips
      );

      let bestVal = -1;
      let candidates: Array<{ r: number; c: number }> = [];

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (currentShotsOnPlayer[r][c] !== "none") continue;
          const score = heatmap[r][c];
          if (score > bestVal) {
            bestVal = score;
            candidates = [{ r, c }];
          } else if (score === bestVal) {
            candidates.push({ r, c });
          }
        }
      }

      if (candidates.length === 0) return;
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const coordLabel = `${COL_LABELS[target.c]}${target.r + 1}`;

      const nextShots = currentShotsOnPlayer.map((row) => [...row]);
      let hitShip: PlacedShip | null = null;
      const updatedShips = currentPlayerShips.map((ship) => {
        const isHit = ship.cells.some(
          (cell) => cell.r === target.r && cell.c === target.c
        );
        if (!isHit) return ship;
        const nextHits = ship.hits + 1;
        hitShip = { ...ship, hits: nextHits };
        return hitShip;
      });

      if (hitShip) {
        const sunkShip = hitShip as PlacedShip;
        if (sunkShip.hits >= sunkShip.length) {
          for (const cell of sunkShip.cells) {
            nextShots[cell.r][cell.c] = "sunk";
          }
          setLastMitchShot(`${coordLabel} — Sunk ${sunkShip.name}!`);
        } else {
          nextShots[target.r][target.c] = "hit";
          setLastMitchShot(`${coordLabel} — Hit!`);
        }
      } else {
        nextShots[target.r][target.c] = "miss";
        setLastMitchShot(`${coordLabel} — Miss`);
      }

      setShotsOnPlayer(nextShots);
      setPlayerShips(updatedShips);
      setIsMitchThinking(false);

      const allPlayerSunk = updatedShips.every((s) => s.hits >= s.length);
      if (allPlayerSunk) {
        setWinner("mitch");
        setPhase("finished");
        onQuip(pickQuip(BANTER_QUIPS.mitchWin));
        onMatchComplete("loss");
        return;
      }

      if (hitShip) {
        const sunkShip = hitShip as PlacedShip;
        if (sunkShip.hits >= sunkShip.length) {
          onQuip(pickQuip(BANTER_QUIPS.battleshipSunkPlayerShip));
        } else {
          onQuip(pickQuip(BANTER_QUIPS.battleshipHitPlayer));
        }
      } else {
        onQuip(pickQuip(BANTER_QUIPS.battleshipMissPlayer));
      }
    },
    [onMatchComplete, onQuip]
  );

  const handleFireAtMitch = (r: number, c: number) => {
    if (phase !== "battle" || isMitchThinking) return;
    if (shotsOnMitch[r][c] !== "none") return;

    const coordLabel = `${COL_LABELS[c]}${r + 1}`;
    const nextShots = shotsOnMitch.map((row) => [...row]);
    let hitShip: PlacedShip | null = null;

    const updatedMitchShips = mitchShips.map((ship) => {
      const isHit = ship.cells.some((cell) => cell.r === r && cell.c === c);
      if (!isHit) return ship;
      const nextHits = ship.hits + 1;
      hitShip = { ...ship, hits: nextHits };
      return hitShip;
    });

    if (hitShip) {
      const sunkShip = hitShip as PlacedShip;
      if (sunkShip.hits >= sunkShip.length) {
        for (const cell of sunkShip.cells) {
          nextShots[cell.r][cell.c] = "sunk";
        }
        setLastPlayerShot(`${coordLabel} — Sunk ${sunkShip.name}!`);
      } else {
        nextShots[r][c] = "hit";
        setLastPlayerShot(`${coordLabel} — Hit!`);
      }
    } else {
      nextShots[r][c] = "miss";
      setLastPlayerShot(`${coordLabel} — Miss`);
    }

    setShotsOnMitch(nextShots);
    setMitchShips(updatedMitchShips);

    const allMitchSunk = updatedMitchShips.every((s) => s.hits >= s.length);
    if (allMitchSunk) {
      setWinner("player");
      setPhase("finished");
      onQuip(pickQuip(BANTER_QUIPS.playerWin));
      onMatchComplete("win");
      return;
    }

    if (hitShip) {
      const sunkShip = hitShip as PlacedShip;
      if (sunkShip.hits >= sunkShip.length) {
        onQuip(pickQuip(BANTER_QUIPS.battleshipSunkMitchShip));
      } else {
        onQuip(pickQuip(BANTER_QUIPS.battleshipPlayerHitMitch));
      }
    }

    setIsMitchThinking(true);
    window.setTimeout(() => {
      executeMitchTurn(shotsOnPlayer, playerShips);
    }, 420);
  };

  const getHeatCellClasses = (score: number, maxScore: number) => {
    if (score <= 0 || maxScore <= 0) return "";
    const ratio = score / maxScore;
    if (ratio >= 0.78) {
      return "bg-rose-500/80 text-white dark:bg-rose-500/75";
    }
    if (ratio >= 0.5) {
      return "bg-amber-400/80 text-slate-950 dark:bg-amber-500/70 dark:text-slate-950";
    }
    if (ratio >= 0.25) {
      return "bg-teal-400/65 text-slate-900 dark:bg-teal-500/55 dark:text-white";
    }
    return "bg-teal-200/55 text-slate-800 dark:bg-teal-900/55 dark:text-teal-100";
  };

  const playerSunkCount = playerShips.filter((s) => s.hits >= s.length).length;
  const mitchSunkCount = mitchShips.filter((s) => s.hits >= s.length).length;
  const allPlaced = playerShips.length === FLEET_SPECS.length;

  return (
    <div className="space-y-5">
      {/* Control Strip */}
      <div className="rounded-2xl border border-slate-200/90 bg-[#F4F8F8] px-4 py-3.5 dark:border-[#244447] dark:bg-[#111F21]">
        {phase === "setup" ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* 5 Ship Selector Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {FLEET_SPECS.map((spec) => {
                  const active = selectedShipId === spec.id;
                  const isPlaced = playerShips.some((s) => s.id === spec.id);
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => handleSelectShipPill(spec)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? "bg-[#0D8B8B] text-white shadow-2xs dark:bg-[#119E9E]"
                          : isPlaced
                          ? "border border-slate-300 bg-white text-slate-700 hover:border-[#0D8B8B] dark:border-[#2B4F53] dark:bg-[#17272B] dark:text-slate-200"
                          : "border border-dashed border-amber-400 bg-amber-50/70 text-amber-800 hover:border-[#0D8B8B] dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-200"
                      }`}
                    >
                      <span>
                        {spec.name} ({spec.length})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Clear / Rotate Ship / Auto-Place / Start Battle */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border-2 border-[#0D8B8B]/60 bg-teal-50/80 px-4 py-1.5 text-xs font-bold text-[#0A6E6E] transition-colors hover:bg-[#0D8B8B] hover:text-white dark:border-teal-500/50 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:bg-[#119E9E] cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Rotate {selectedSpec.name} (
                    {orientation === "H" ? "Horizontal" : "Vertical"})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoPlaceFleet}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0D8B8B] dark:border-[#244447] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
                >
                  <Shuffle className="h-3.5 w-3.5 shrink-0" />
                  <span>Auto-Place</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearFleet}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-[#244447] dark:bg-[#17272B] dark:text-slate-300 cursor-pointer"
                >
                  <Eraser className="h-3.5 w-3.5 shrink-0" />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartBattle}
                  disabled={!allPlaced}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#0D8B8B] px-5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#0A7373] dark:bg-[#119E9E] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {allPlaced
                      ? "Start Battle"
                      : `Place Ships (${playerShips.length}/5)`}
                  </span>
                </button>
              </div>
            </div>

            <p className="text-xs font-medium text-[#0A6E6E] dark:text-teal-300">
              {setupHint}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-[#0D8B8B] dark:text-teal-300">
                <Anchor className="h-4 w-4" />
                <span>Your Fleet: {5 - playerSunkCount}/5 afloat</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
                <Crosshair className="h-4 w-4" />
                <span>Mitch&apos;s Fleet: {5 - mitchSunkCount}/5 afloat</span>
              </span>
              {showBrain && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="rounded-full bg-teal-100/80 px-2.5 py-0.5 text-[11px] font-bold text-[#0A6E6E] dark:bg-teal-950 dark:text-teal-200">
                    AI Mode: {densityResult.mode}
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleNewMatch}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0D8B8B] dark:border-[#244447] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New Match</span>
            </button>
          </div>
        )}
      </div>

      {/* Two 10x10 Boards */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Player's Own Fleet Board */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 dark:border-[#1E3A3D] dark:bg-[#111F21]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-[#111F21] dark:text-white">
                Your Fleet{" "}
                {phase === "setup" ? "(Tap ship to select/rotate, tap grid to place)" : ""}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lastMitchShot
                  ? `Mitch's last shot: ${lastMitchShot}`
                  : "5 ships · 10×10 grid"}
              </p>
            </div>
            {showBrain && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                Heatmap Overlay ON
              </span>
            )}
          </div>

          <div
            className="mx-auto max-w-[400px]"
            onMouseLeave={() => setHoverCell(null)}
          >
            <div className="grid grid-cols-11 gap-1 text-center text-[10px] font-mono text-slate-400 mb-1">
              <div />
              {COL_LABELS.map((col) => (
                <div key={col}>{col}</div>
              ))}
            </div>

            <div className="space-y-1">
              {Array.from({ length: GRID_SIZE }, (_, r) => (
                <div key={r} className="grid grid-cols-11 gap-1 items-center">
                  <div className="text-center text-[10px] font-mono text-slate-400">
                    {r + 1}
                  </div>
                  {Array.from({ length: GRID_SIZE }, (__, c) => {
                    const ship = playerShipCellMap.get(`${r},${c}`);
                    const shot = shotsOnPlayer[r][c];
                    const heatScore = densityResult.heatmap[r][c];
                    const isPreview =
                      previewCells?.cells.some(
                        (cell) => cell.r === r && cell.c === c
                      ) ?? false;

                    let cellBg =
                      "bg-slate-100 hover:bg-slate-200/80 dark:bg-[#172A2E] dark:hover:bg-[#1E363B]";
                    if (ship) {
                      cellBg =
                        ship.id === selectedShipId && phase === "setup"
                          ? "bg-[#0D8B8B] text-white ring-2 ring-teal-300/80 dark:ring-teal-400/60"
                          : "bg-slate-600 text-white dark:bg-slate-500";
                    }
                    if (phase === "setup" && isPreview) {
                      cellBg = previewCells?.valid
                        ? "bg-teal-400/80 text-white"
                        : "bg-rose-400/80 text-white";
                    }

                    if (shot === "sunk") {
                      cellBg = "bg-rose-600 text-white";
                    } else if (shot === "hit") {
                      cellBg = "bg-amber-500 text-white";
                    } else if (shot === "miss") {
                      cellBg =
                        "bg-slate-300/75 text-slate-500 dark:bg-slate-800 dark:text-slate-500";
                    } else if (showBrain && phase !== "setup" && heatScore > 0) {
                      cellBg = getHeatCellClasses(
                        heatScore,
                        densityResult.maxScore
                      );
                    }

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        disabled={phase !== "setup"}
                        onMouseEnter={() =>
                          phase === "setup" && setHoverCell({ r, c })
                        }
                        onClick={() => handleSetupCellClick(r, c)}
                        className={`aspect-square rounded-md text-[9px] sm:text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                          phase === "setup" ? "cursor-pointer" : "cursor-default"
                        } ${cellBg}`}
                        title={
                          phase === "setup" && ship
                            ? `${ship.name} (${ship.length}) — Click to ${
                                ship.id === selectedShipId ? "rotate" : "select"
                              }`
                            : showBrain && shot === "none" && phase !== "setup"
                            ? `${COL_LABELS[c]}${r + 1}: Probability weight ${heatScore}`
                            : `${COL_LABELS[c]}${r + 1}`
                        }
                      >
                        {shot === "sunk"
                          ? "✕"
                          : shot === "hit"
                          ? "●"
                          : shot === "miss"
                          ? "·"
                          : showBrain && phase !== "setup" && heatScore > 0
                          ? heatScore
                          : phase === "setup" && ship
                          ? ship.code
                          : ""}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mitch's Waters (Target Grid) */}
        <div
          className={`rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 dark:border-[#1E3A3D] dark:bg-[#111F21] transition-opacity ${
            phase === "setup" ? "opacity-75" : "opacity-100"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-[#111F21] dark:text-white">
                Mitch&apos;s Waters{" "}
                {phase === "battle"
                  ? "(Click to fire!)"
                  : phase === "setup"
                  ? "(Ready after Start Battle)"
                  : ""}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lastPlayerShot
                  ? `Your last shot: ${lastPlayerShot}`
                  : phase === "setup"
                  ? "Arrange Your Fleet first, then click Start Battle"
                  : isMitchThinking
                  ? "Mitch is scanning probability grid..."
                  : winner === "player"
                  ? "All 5 of Mitch's ships sunk!"
                  : "Pick any unvisited coordinate"}
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-[400px]">
            <div className="grid grid-cols-11 gap-1 text-center text-[10px] font-mono text-slate-400 mb-1">
              <div />
              {COL_LABELS.map((col) => (
                <div key={col}>{col}</div>
              ))}
            </div>

            <div className="space-y-1">
              {Array.from({ length: GRID_SIZE }, (_, r) => (
                <div key={r} className="grid grid-cols-11 gap-1 items-center">
                  <div className="text-center text-[10px] font-mono text-slate-400">
                    {r + 1}
                  </div>
                  {Array.from({ length: GRID_SIZE }, (__, c) => {
                    const shot = shotsOnMitch[r][c];
                    const revealedShip =
                      phase === "finished"
                        ? mitchShipCellMap.get(`${r},${c}`)
                        : null;

                    let cellBg =
                      "bg-teal-50/70 hover:bg-teal-100 dark:bg-[#15292D] dark:hover:bg-[#1C383D]";
                    if (revealedShip && shot === "none") {
                      cellBg = "bg-slate-400/70 dark:bg-slate-600/70";
                    }
                    if (shot === "sunk") {
                      cellBg = "bg-rose-600 text-white";
                    } else if (shot === "hit") {
                      cellBg = "bg-[#0D8B8B] text-white";
                    } else if (shot === "miss") {
                      cellBg =
                        "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500";
                    }

                    const disabled =
                      phase !== "battle" || shot !== "none" || isMitchThinking;

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleFireAtMitch(r, c)}
                        className={`aspect-square rounded-md text-xs font-bold flex items-center justify-center transition-colors ${
                          disabled ? "cursor-default" : "cursor-crosshair"
                        } ${cellBg}`}
                        aria-label={`Fire at ${COL_LABELS[c]}${r + 1}`}
                      >
                        {shot === "sunk"
                          ? "✕"
                          : shot === "hit"
                          ? "●"
                          : shot === "miss"
                          ? "·"
                          : ""}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ship Status Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {mitchShips.map((ship) => {
          const isSunk = ship.hits >= ship.length;
          return (
            <div
              key={ship.id}
              className={`rounded-2xl border px-3 py-2 text-xs transition-colors ${
                isSunk
                  ? "border-rose-200 bg-rose-50/70 text-rose-700 line-through dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-300"
                  : "border-slate-200/90 bg-white text-slate-700 dark:border-[#244447] dark:bg-[#111F21] dark:text-slate-300"
              }`}
            >
              <span className="font-semibold">Mitch&apos;s {ship.name}</span>
              <span className="ml-1.5 font-mono text-[11px] opacity-75">
                ({ship.length})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
