import { useCallback, useEffect, useState } from "react";
import {
  Anchor,
  Coffee,
  Compass,
  Flame,
  Leaf,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
} from "lucide-react";
import { BANTER_QUIPS, pickQuip } from "./banter";
import type { GameComponentProps } from "./types";

interface CardDef {
  pairId: string;
  label: string;
  icon: typeof Sun;
  colorClass: string;
}

const CARD_PAIRS: CardDef[] = [
  {
    pairId: "sun",
    label: "Sun",
    icon: Sun,
    colorClass: "text-amber-500 dark:text-amber-300",
  },
  {
    pairId: "moon",
    label: "Moon",
    icon: Moon,
    colorClass: "text-indigo-500 dark:text-indigo-300",
  },
  {
    pairId: "leaf",
    label: "Leaf",
    icon: Leaf,
    colorClass: "text-emerald-600 dark:text-emerald-300",
  },
  {
    pairId: "coffee",
    label: "Coffee",
    icon: Coffee,
    colorClass: "text-amber-700 dark:text-amber-400",
  },
  {
    pairId: "anchor",
    label: "Anchor",
    icon: Anchor,
    colorClass: "text-[#0D8B8B] dark:text-teal-300",
  },
  {
    pairId: "compass",
    label: "Compass",
    icon: Compass,
    colorClass: "text-sky-600 dark:text-sky-300",
  },
  {
    pairId: "flame",
    label: "Spark",
    icon: Flame,
    colorClass: "text-rose-500 dark:text-rose-300",
  },
  {
    pairId: "sparkles",
    label: "Stars",
    icon: Sparkles,
    colorClass: "text-violet-500 dark:text-violet-300",
  },
];

interface BoardCard extends CardDef {
  uid: number;
  matchedBy: "player" | "mitch" | null;
}

function createShuffledDeck(): BoardCard[] {
  const doubled = [...CARD_PAIRS, ...CARD_PAIRS].map((def, idx) => ({
    ...def,
    uid: idx,
    matchedBy: null as "player" | "mitch" | null,
  }));

  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled;
}

export function MemoryGame({
  showBrain,
  onQuip,
  onMatchComplete,
}: GameComponentProps) {
  const [cards, setCards] = useState<BoardCard[]>(createShuffledDeck);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [turn, setTurn] = useState<"player" | "mitch">("player");
  const [isBusy, setIsBusy] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [playerPairs, setPlayerPairs] = useState(0);
  const [mitchPairs, setMitchPairs] = useState(0);

  // Mitch's probabilistic memory bank: index -> pairId (85% recall on seen cards for fun fair matches)
  const [mitchMemory, setMitchMemory] = useState<Record<number, string>>({});

  const rememberCards = useCallback((indices: number[], deck: BoardCard[]) => {
    setMitchMemory((prev) => {
      const next = { ...prev };
      for (const idx of indices) {
        if (Math.random() < 0.88) {
          next[idx] = deck[idx].pairId;
        }
      }
      return next;
    });
  }, []);

  const checkMatchEnd = useCallback(
    (nextCards: BoardCard[], nextPlayerPairs: number, nextMitchPairs: number) => {
      const allMatched = nextCards.every((c) => c.matchedBy !== null);
      if (!allMatched) return false;

      setIsFinished(true);
      if (nextPlayerPairs > nextMitchPairs) {
        onQuip(pickQuip(BANTER_QUIPS.playerWin));
        onMatchComplete("win");
      } else if (nextMitchPairs > nextPlayerPairs) {
        onQuip(pickQuip(BANTER_QUIPS.mitchWin));
        onMatchComplete("loss");
      } else {
        onQuip(pickQuip(BANTER_QUIPS.draw));
        onMatchComplete("draw");
      }
      return true;
    },
    [onMatchComplete, onQuip]
  );

  const handleReset = useCallback(() => {
    setCards(createShuffledDeck());
    setFlippedIndices([]);
    setTurn("player");
    setIsBusy(false);
    setIsFinished(false);
    setPlayerPairs(0);
    setMitchPairs(0);
    setMitchMemory({});
    onQuip(pickQuip(BANTER_QUIPS.memoryStart));
  }, [onQuip]);

  // Mitch AI turn
  useEffect(() => {
    if (turn !== "mitch" || isFinished || isBusy) return;

    const availableIndices = cards
      .map((c, idx) => (c.matchedBy === null ? idx : -1))
      .filter((idx) => idx !== -1);

    if (availableIndices.length < 2) return;

    const startTimer = window.setTimeout(() => {
      setIsBusy(true);

      // Look for any known matching pair in Mitch's memory
      let firstIdx = -1;
      let secondIdx = -1;
      const seenByPair = new Map<string, number[]>();

      for (const idx of availableIndices) {
        const knownPairId = mitchMemory[idx];
        if (knownPairId) {
          const list = seenByPair.get(knownPairId) ?? [];
          list.push(idx);
          seenByPair.set(knownPairId, list);
          if (list.length >= 2) {
            firstIdx = list[0];
            secondIdx = list[1];
            break;
          }
        }
      }

      // If no known pair yet, pick an unseen card first, then check if its pair is known
      if (firstIdx === -1) {
        const unseen = availableIndices.filter((idx) => !mitchMemory[idx]);
        const pool = unseen.length > 0 ? unseen : availableIndices;
        firstIdx = pool[Math.floor(Math.random() * pool.length)];

        const firstPairId = cards[firstIdx].pairId;
        const knownPartner = availableIndices.find(
          (idx) => idx !== firstIdx && mitchMemory[idx] === firstPairId
        );

        if (knownPartner !== undefined) {
          secondIdx = knownPartner;
        } else {
          const remaining = availableIndices.filter((idx) => idx !== firstIdx);
          const remainingUnseen = remaining.filter((idx) => !mitchMemory[idx]);
          const secondPool =
            remainingUnseen.length > 0 ? remainingUnseen : remaining;
          secondIdx =
            secondPool[Math.floor(Math.random() * secondPool.length)];
        }
      }

      setFlippedIndices([firstIdx]);

      window.setTimeout(() => {
        setFlippedIndices([firstIdx, secondIdx]);
        rememberCards([firstIdx, secondIdx], cards);

        window.setTimeout(() => {
          const isMatch = cards[firstIdx].pairId === cards[secondIdx].pairId;
          if (isMatch) {
            const nextCards = cards.map((c, idx) =>
              idx === firstIdx || idx === secondIdx
                ? { ...c, matchedBy: "mitch" as const }
                : c
            );
            const nextMitchScore = mitchPairs + 1;
            setCards(nextCards);
            setMitchPairs(nextMitchScore);
            setFlippedIndices([]);
            setIsBusy(false);

            const ended = checkMatchEnd(nextCards, playerPairs, nextMitchScore);
            if (!ended) {
              onQuip(pickQuip(BANTER_QUIPS.memoryMitchMatch));
              setTurn("player");
            }
          } else {
            setFlippedIndices([]);
            setIsBusy(false);
            setTurn("player");
            onQuip(pickQuip(BANTER_QUIPS.memoryMiss));
          }
        }, 720);
      }, 420);
    }, 450);

    return () => window.clearTimeout(startTimer);
  }, [
    turn,
    isFinished,
    isBusy,
    cards,
    mitchMemory,
    mitchPairs,
    playerPairs,
    rememberCards,
    checkMatchEnd,
    onQuip,
  ]);

  const handleCardClick = (idx: number) => {
    if (turn !== "player" || isBusy || isFinished) return;
    if (cards[idx].matchedBy !== null) return;
    if (flippedIndices.includes(idx)) return;

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length < 2) return;

    setIsBusy(true);
    const [a, b] = nextFlipped;
    rememberCards([a, b], cards);

    window.setTimeout(() => {
      const isMatch = cards[a].pairId === cards[b].pairId;
      if (isMatch) {
        const nextCards = cards.map((c, cardIdx) =>
          cardIdx === a || cardIdx === b
            ? { ...c, matchedBy: "player" as const }
            : c
        );
        const nextPlayerScore = playerPairs + 1;
        setCards(nextCards);
        setPlayerPairs(nextPlayerScore);
        setFlippedIndices([]);
        setIsBusy(false);

        const ended = checkMatchEnd(nextCards, nextPlayerScore, mitchPairs);
        if (!ended) {
          onQuip(pickQuip(BANTER_QUIPS.memoryPlayerMatch));
          setTurn("mitch");
        }
      } else {
        setFlippedIndices([]);
        setIsBusy(false);
        setTurn("mitch");
        onQuip(pickQuip(BANTER_QUIPS.memoryMiss));
      }
    }, 700);
  };

  return (
    <div className="space-y-5">
      {/* Top Score & Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-[#F4F8F8] px-4 py-3 dark:border-[#244447] dark:bg-[#111F21]">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-slate-200 dark:bg-[#17272B] dark:border-[#244447]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0D8B8B] inline-block" />
            <span className="text-[#111F21] dark:text-white">
              You: {playerPairs}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-slate-200 dark:bg-[#17272B] dark:border-[#244447]">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-[#111F21] dark:text-white">
              Mitch: {mitchPairs}
            </span>
          </span>
          <span className="text-slate-600 dark:text-slate-300">
            {isFinished
              ? playerPairs > mitchPairs
                ? "You won!"
                : mitchPairs > playerPairs
                ? "Mitch won!"
                : "Tie match!"
              : turn === "player"
              ? "Your turn — flip 2 cards"
              : "Mitch is flipping..."}
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#0D8B8B] dark:border-[#244447] dark:bg-[#17272B] dark:text-slate-200 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>New Deck</span>
        </button>
      </div>

      {/* 4x4 Responsive Card Grid */}
      <div className="mx-auto max-w-[400px]">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 rounded-3xl border border-slate-200/90 bg-[#F4F8F8] p-3.5 sm:p-4 dark:border-[#1E3A3D] dark:bg-[#111F21]">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            const isFlipped = flippedIndices.includes(idx);
            const isMatched = card.matchedBy !== null;
            const faceUp = isFlipped || isMatched;
            const rememberedLabel = mitchMemory[idx];
            const clickable =
              turn === "player" && !isBusy && !isFinished && !faceUp;

            return (
              <button
                key={card.uid}
                type="button"
                disabled={!clickable}
                onClick={() => handleCardClick(idx)}
                aria-label={faceUp ? card.label : `Hidden card ${idx + 1}`}
                className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all duration-200 ${
                  isMatched
                    ? card.matchedBy === "player"
                      ? "border-[#0D8B8B] bg-teal-50/90 dark:border-teal-400/60 dark:bg-teal-950/60"
                      : "border-amber-400 bg-amber-50/90 dark:border-amber-500/60 dark:bg-amber-950/50"
                    : faceUp
                    ? "border-[#0D8B8B]/60 bg-white shadow-xs dark:border-teal-500/60 dark:bg-[#1B2F34]"
                    : "border-slate-200/90 bg-white hover:border-[#0D8B8B]/60 hover:-translate-y-0.5 dark:border-[#244447] dark:bg-[#16272B] dark:hover:border-teal-400/60"
                } ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                {faceUp ? (
                  <>
                    <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${card.colorClass}`} />
                    <span className="mt-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {card.label}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-display text-lg font-extrabold text-slate-300 dark:text-slate-600">
                      ?
                    </span>
                    {showBrain && rememberedLabel && (
                      <span
                        title={`Mitch remembers: ${rememberedLabel}`}
                        className="mt-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                      >
                        {rememberedLabel}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {showBrain && (
          <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
            Labels on face-down cards reveal what Mitch currently remembers in his memory bank.
          </p>
        )}
      </div>
    </div>
  );
}
