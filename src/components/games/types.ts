export type GameId =
  | "battleship"
  | "connect4"
  | "maze"
  | "memory"
  | "tictactoe";

export type MatchOutcome = "win" | "loss" | "draw";

export interface GameComponentProps {
  showBrain: boolean;
  isTabActive: boolean;
  onQuip: (text: string) => void;
  onMatchComplete: (outcome: MatchOutcome) => void;
}
