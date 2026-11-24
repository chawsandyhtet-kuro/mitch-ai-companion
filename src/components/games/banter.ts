export const BANTER_QUIPS = {
  welcome: [
    "Ready for a quick brain stretch? Pick any game above—zero timers, zero pressure.",
    "Always fun playing a round or two with you! Toggle 'Show Mitch's Brain' anytime to peek at my logic.",
    "Let's keep it light and strategic. Want to start with Memory Match or a quick Tic-Tac-Toe warmup?",
  ],
  battleshipSetup: [
    "Place your 5 ships—or tap Auto-Place Fleet to jump straight into the naval match!",
    "My probability grid is warmed up and ready whenever your fleet is anchored.",
  ],
  battleshipHitPlayer: [
    "Ooh, direct hit! My Probability Density Grid narrows down nearby cells now.",
    "Found part of a hull—switching from Hunt Mode into Target Mode!",
  ],
  battleshipMissPlayer: [
    "Splash! Nothing there. Updating my probability heatmap across the open grid.",
    "Missed that wave—crossing those ship placements off my probability matrix.",
  ],
  battleshipPlayerHitMitch: [
    "Nice shot! You clipped one of my ships—good eye!",
    "Whoa, direct hit on my fleet! You're reading my layout well.",
  ],
  battleshipSunkMitchShip: [
    "Down goes one of mine! Well played—my fleet is feeling the pressure.",
    "Sunk! That was clean targeting right there.",
  ],
  battleshipSunkPlayerShip: [
    "Sunk that ship! Now my heatmap resets back to Hunt Mode for the rest.",
    "Got it! Let's see where the rest of your fleet is hiding.",
  ],
  connect4Move: [
    "Center columns give the most 4-in-a-row diagonals—let's see what you set up!",
    "Checking Alpha-Beta branches... your move!",
    "That's a sneaky setup—glad I scanned four moves ahead!",
  ],
  connect4ThreatBlock: [
    "Phew, spotted that three-in-a-row just in time!",
    "Almost slipped a four-in-a-row past me there—nice pressure!",
  ],
  mazeStart: [
    "On your mark! My A* search already mapped the Manhattan shortest path—let's race!",
    "Arrow keys, WASD, or the D-pad—see you at the finish flag!",
  ],
  mazeCloseFinish: [
    "Whoa, neck and neck near the exit! What a sprint!",
    "That was super close—both of us right at the final turn!",
  ],
  memoryStart: [
    "4×4 Memory Match! Flip any two cards to find matching pairs—most pairs wins!",
    "Let's test our recall! Flip two cards to start collecting pairs.",
  ],
  memoryPlayerMatch: [
    "Sharp memory! Nice pair—you keep the momentum!",
    "Clean match! You spotted that pair right away.",
  ],
  memoryMitchMatch: [
    "Aha, I remembered where that card was hiding!",
    "Matched a pair from my memory bank—your turn!",
  ],
  memoryMiss: [
    "Close! Taking a mental note of where those two cards are.",
    "Not quite a pair—now we both know two more positions on the board!",
  ],
  tttFriendlyMistake: [
    "Playing in Friendly Mode—leaving a tiny opening there, let's see if you spot it!",
  ],
  tttUnbeatable: [
    "Full Minimax active! Every square is scored (+1, 0, -1)—try to force a draw!",
  ],
  playerWin: [
    "Nice win! That was sharp thinking—rematch whenever you want, or try another board.",
    "You got me fair and square! Great read on that match.",
    "Clean victory! Always enjoy seeing how you out-think my algorithm.",
  ],
  mitchWin: [
    "Got that round! Want a rematch, or ready to switch up the game?",
    "That was a fun puzzle—good match! Up for another round?",
    "Took that one, though you kept me calculating hard!",
  ],
  draw: [
    "A dead-even draw! Both sides played super solid defense.",
    "Tie game! Neither of us gave an inch there.",
  ],
} as const;

export function pickQuip(list: readonly string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}
