export type Player = "circle" | "cross";
export type GameMode = "user-user" | "user-ai" | "ai-ai";
export type AiDifficulty = "easy" | "normal" | "hard";
export type BoardValue = Player | null;
export type Starter = Player | "random";
export type MatchMode = "casual" | "best-of-5" | "first-to-5";
export type MatchWinner = Player | "draw";
export type MatchState =
  | {
      status: "playing";
    }
  | {
      status: "complete";
      winner: MatchWinner;
    };

export type Score = Record<Player, number>;
export type PlayerNames = Record<Player, string>;
export type PlayerNamesByMode = Record<GameMode, PlayerNames>;
export type MarkerColors = Record<Player, string>;

export type RoundRecord = {
  round: number;
  mode: GameMode;
  difficulty: AiDifficulty;
  starter: Player;
  matchMode: MatchMode;
  winner: Player | "draw";
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
  matchMode: MatchMode;
  match: MatchState;
  muted: boolean;
  markerColors: MarkerColors;
  score: Score;
  playerNames: PlayerNames;
  playerNamesByMode: Partial<Record<GameMode, Partial<PlayerNames>>>;
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
  matchMode: MatchMode;
  matchTarget: 1 | 3 | 5;
  muted: boolean;
}>;
