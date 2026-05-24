import type { MarkerColors, Player, PlayerNamesByMode } from "./types";

export const PLAYERS = ["circle", "cross"] as const satisfies readonly Player[];

export const MAX_PLAYER_NAME_LENGTH = 8;
export const AI_MOVE_DELAY = 450;
export const LONG_PRESS_DELAY = 550;
export const SETTINGS_KEY = "2ba29fe8-c4fa-4487-a79b-13db4c6d5f79";

export const DEFAULT_MARKER_COLORS = {
  circle: "#4f46e5",
  cross: "#ec4899",
} satisfies MarkerColors;

export const DEFAULT_PLAYER_NAMES_BY_MODE = {
  "user-user": {
    circle: "player 1",
    cross: "player 2",
  },
  "user-ai": {
    circle: "player 1",
    cross: "ai 1",
  },
  "ai-ai": {
    circle: "ai 1",
    cross: "ai 2",
  },
} satisfies PlayerNamesByMode;

export const DEFAULT_PLAYER_NAMES = DEFAULT_PLAYER_NAMES_BY_MODE["user-user"];

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
