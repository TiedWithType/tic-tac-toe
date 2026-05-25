export type Player = "circle" | "cross";
export type GameMode = "user-user" | "user-ai" | "ai-ai";
export type AiDifficulty = "easy" | "normal" | "hard";
export type BoardValue = Player | null;
export type Starter = Player | "random";
export type MatchTarget = 1 | 3 | 5;

export type Score = Record<Player, number>;
export type PlayerNames = Record<Player, string>;
export type PlayerNamesByMode = Record<GameMode, PlayerNames>;
export type MarkerColors = Record<Player, string>;

export type RoundRecord = {
  round: number;
  mode: GameMode;
  difficulty: AiDifficulty;
  starter: Player;
  matchTarget: MatchTarget;
  winner: Player | "draw";
};

export type AppConfig = {
  appName: string;
  version: {
    major: number;
    minor: number;
    patch: number;
    release: string;
    codename: string;
  };
  defaultPlayers: PlayerNamesByMode;
};

export type GameState = {
  board: BoardValue[];
  current: Player;
  roundStarter: Player;
  gameOver: boolean;
  gameStarted: boolean;
  roundWinner: Player | "draw" | null;
  winningCombination: number[] | null;
  gameMode: GameMode;
  aiDifficulty: AiDifficulty;
  starter: Starter;
  matchTarget: MatchTarget;
  matchWinner: Player | null;
  muted: boolean;
  markerColors: MarkerColors;
  score: Score;
  playerNames: PlayerNames;
  history: RoundRecord[];
};

export type SettingsSnapshot = Partial<{
  settingsSchemaVersion: number;
  playerNames: Partial<PlayerNames>;
  playerNamesByMode: Partial<Record<GameMode, Partial<PlayerNames>>>;
  markerColors: Partial<MarkerColors>;
  gameMode: GameMode;
  aiDifficulty: AiDifficulty;
  starter: Starter;
  matchTarget: MatchTarget;
  muted: boolean;
}>;
