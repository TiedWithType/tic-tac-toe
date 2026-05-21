import type { MarkerColors, Player } from "./types";

export const PLAYERS = ["circle", "cross"] as const satisfies readonly Player[];

export const MAX_PLAYER_NAME_LENGTH = 8;
export const AI_MOVE_DELAY = 450;
export const LONG_PRESS_DELAY = 550;
export const SETTINGS_KEY = "tic-tac-toe-settings-v1";

export const DEFAULT_MARKER_COLORS = {
  circle: "#2196f3",
  cross: "#f44336",
} satisfies MarkerColors;

export const DEFAULT_PLAYER_NAMES = {
  circle: "player 1",
  cross: "player 2",
} satisfies Record<Player, string>;

export const WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
