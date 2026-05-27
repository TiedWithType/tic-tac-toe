import {
  DEFAULT_MARKER_COLORS,
  DEFAULT_PLAYER_NAMES,
  DEFAULT_PLAYER_NAMES_BY_MODE,
  MAX_PLAYER_NAME_LENGTH,
  PLAYERS,
} from "./constants";
import type {
  AiDifficulty,
  GameMode,
  GameState,
  MarkerColors,
  MatchMode,
  MatchState,
  Player,
  PlayerNames,
  SettingsSnapshot,
  Starter,
} from "./types";
import { GameEngine } from "../game/game.engine";
import { SettingsService } from "../services/settings.service";

export type GameAction =
  | { type: "hydrateSettings"; settings: SettingsSnapshot }
  | { type: "startGame"; mode: GameMode; starter: Player }
  | { type: "makeMove"; index: number; player: Player }
  | { type: "resetRound"; starter: Player }
  | { type: "resetGame"; starter: Player }
  | { type: "setAiDifficulty"; difficulty: AiDifficulty }
  | { type: "setGameMode"; mode: GameMode }
  | { type: "setStarter"; starter: Starter }
  | { type: "setMatchMode"; matchMode: MatchMode }
  | { type: "setMuted"; muted: boolean }
  | { type: "setMarkerColor"; player: Player; color: string }
  | { type: "setPlayerName"; player: Player; name: string };

type Listener = (state: GameState, previousState: GameState, action: GameAction) => void;

export class GameStore {
  private listeners = new Set<Listener>();

  constructor(private state = createInitialGameState()) {}

  getState() {
    return this.state;
  }

  dispatch(action: GameAction) {
    const previousState = this.state;
    const nextState = gameReducer(previousState, action);

    if (nextState === previousState) return;

    this.state = nextState;
    this.listeners.forEach((listener) => listener(this.state, previousState, action));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const createInitialGameState = (): GameState => ({
  board: Array(9).fill(null),
  current: "circle",
  roundStarter: "circle",
  gameOver: false,
  gameStarted: false,
  roundWinner: null,
  winningCombination: null,
  gameMode: "user-user",
  aiDifficulty: "normal",
  starter: "circle",
  matchMode: "casual",
  match: { status: "playing" },
  muted: false,
  markerColors: { ...DEFAULT_MARKER_COLORS },
  score: {
    circle: 0,
    cross: 0,
  },
  playerNames: { ...DEFAULT_PLAYER_NAMES },
  playerNamesByMode: {},
  history: [],
});

export const createSettingsSnapshot = (state: GameState): SettingsSnapshot => ({
  playerNamesByMode: state.playerNamesByMode,
  markerColors: state.markerColors,
  gameMode: state.gameMode,
  aiDifficulty: state.aiDifficulty,
  starter: state.starter,
  matchMode: state.matchMode,
  muted: state.muted,
});

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "hydrateSettings":
      return hydrateSettings(state, action.settings);

    case "startGame": {
      const nextState = withPlayerNamesForMode(
        {
          ...state,
          board: Array(9).fill(null),
          gameMode: action.mode,
          score: { circle: 0, cross: 0 },
          current: action.starter,
          roundStarter: action.starter,
          gameStarted: true,
          gameOver: false,
          roundWinner: null,
          winningCombination: null,
          match: { status: "playing" },
        },
        action.mode,
      );

      return nextState;
    }

    case "makeMove": {
      if (!state.gameStarted || state.gameOver || state.board[action.index]) return state;
      if (action.player !== state.current) return state;

      const board = [...state.board];
      board[action.index] = action.player;

      return finishTurn({
        ...state,
        board,
      });
    }

    case "resetRound":
      return {
        ...state,
        board: Array(9).fill(null),
        current: action.starter,
        roundStarter: action.starter,
        gameOver: false,
        roundWinner: null,
        winningCombination: null,
      };

    case "resetGame":
      return withPlayerNamesForMode(
        {
          ...state,
          board: Array(9).fill(null),
          current: action.starter,
          roundStarter: action.starter,
          score: { circle: 0, cross: 0 },
          gameStarted: false,
          gameOver: false,
          roundWinner: null,
          winningCombination: null,
          match: { status: "playing" },
          history: [],
        },
        state.gameMode,
      );

    case "setAiDifficulty":
      return state.aiDifficulty === action.difficulty
        ? state
        : { ...state, aiDifficulty: action.difficulty };

    case "setGameMode":
      return state.gameMode === action.mode ? state : withPlayerNamesForMode({ ...state, gameMode: action.mode }, action.mode);

    case "setStarter":
      return state.starter === action.starter ? state : { ...state, starter: action.starter };

    case "setMatchMode":
      return state.matchMode === action.matchMode ? state : { ...state, matchMode: action.matchMode };

    case "setMuted":
      return state.muted === action.muted ? state : { ...state, muted: action.muted };

    case "setMarkerColor":
      if (!SettingsService.isHexColor(action.color)) return state;

      return {
        ...state,
        markerColors: {
          ...state.markerColors,
          [action.player]: action.color,
        },
      };

    case "setPlayerName": {
      const name = normalizePlayerName(action.name) || state.playerNames[action.player];
      const modeNames = {
        ...state.playerNamesByMode[state.gameMode],
        [action.player]: name,
      };

      return {
        ...state,
        playerNames: {
          ...state.playerNames,
          [action.player]: name,
        },
        playerNamesByMode: {
          ...state.playerNamesByMode,
          [state.gameMode]: modeNames,
        },
      };
    }
  }
}

function finishTurn(state: GameState): GameState {
  const result = GameEngine.getWinner(state.board);

  if (result) {
    const score = {
      ...state.score,
      [result.winner]: state.score[result.winner] + 1,
    };
    const history = recordRound({ ...state, score }, result.winner);
    const nextState = {
      ...state,
      score,
      history,
      gameOver: true,
      roundWinner: result.winner,
      winningCombination: result.combination,
    };

    return {
      ...nextState,
      match: getMatchState(nextState),
    };
  }

  if (GameEngine.isBoardFull(state.board)) {
    const history = recordRound(state, "draw");
    const nextState = {
      ...state,
      history,
      gameOver: true,
      roundWinner: "draw" as const,
    };

    return {
      ...nextState,
      match: getMatchState(nextState),
    };
  }

  return {
    ...state,
    current: GameEngine.getOpponent(state.current),
  };
}

function recordRound(state: GameState, winner: Player | "draw") {
  return [
    {
      round: state.history.length + 1,
      mode: state.gameMode,
      difficulty: state.aiDifficulty,
      starter: state.roundStarter,
      matchMode: state.matchMode,
      winner,
    },
    ...state.history,
  ];
}

function hydrateSettings(state: GameState, settings: SettingsSnapshot): GameState {
  let nextState = { ...state };
  const playerNamesByMode: Partial<Record<GameMode, Partial<PlayerNames>>> = {};

  if (settings.playerNamesByMode) {
    Object.entries(settings.playerNamesByMode).forEach(([mode, playerNames]) => {
      if (SettingsService.isGameMode(mode)) {
        playerNamesByMode[mode] = normalizePlayerNames(playerNames);
      }
    });
  } else if (settings.playerNames) {
    playerNamesByMode["user-user"] = normalizePlayerNames(settings.playerNames);
  }

  nextState = {
    ...nextState,
    playerNamesByMode,
    markerColors: hydrateMarkerColors(state.markerColors, settings.markerColors),
  };

  if (SettingsService.isGameMode(settings.gameMode)) {
    nextState = { ...nextState, gameMode: settings.gameMode };
  }

  if (SettingsService.isDifficulty(settings.aiDifficulty)) {
    nextState = { ...nextState, aiDifficulty: settings.aiDifficulty };
  }

  if (SettingsService.isStarter(settings.starter)) {
    nextState = { ...nextState, starter: settings.starter };
  }

  if (SettingsService.isMatchMode(settings.matchMode)) {
    nextState = { ...nextState, matchMode: settings.matchMode };
  }

  if (typeof settings.muted === "boolean") {
    nextState = { ...nextState, muted: settings.muted };
  }

  return withPlayerNamesForMode(nextState, nextState.gameMode);
}

function hydrateMarkerColors(
  currentColors: MarkerColors,
  savedColors: Partial<MarkerColors> | undefined,
) {
  const markerColors = { ...currentColors };

  PLAYERS.forEach((player) => {
    const savedColor = savedColors?.[player];

    if (SettingsService.isHexColor(savedColor)) {
      markerColors[player] = savedColor;
    }
  });

  return markerColors;
}

function withPlayerNamesForMode(state: GameState, mode: GameMode): GameState {
  const defaultPlayers = DEFAULT_PLAYER_NAMES_BY_MODE[mode];
  const customPlayers = state.playerNamesByMode[mode] || {};
  const playerNames = { ...state.playerNames };

  PLAYERS.forEach((player) => {
    const nextName = customPlayers[player] ?? defaultPlayers[player] ?? DEFAULT_PLAYER_NAMES[player];

    playerNames[player] = normalizePlayerName(nextName) || DEFAULT_PLAYER_NAMES[player];
  });

  return {
    ...state,
    playerNames,
  };
}

function normalizePlayerNames(playerNames: Partial<PlayerNames> | undefined) {
  const normalizedNames: Partial<PlayerNames> = {};

  PLAYERS.forEach((player) => {
    const name = playerNames?.[player];
    if (!name) return;

    normalizedNames[player] = normalizePlayerName(name);
  });

  return normalizedNames;
}

function normalizePlayerName(name: string) {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_PLAYER_NAME_LENGTH);
}

function getMatchState(state: GameState): MatchState {
  if (state.matchMode === "casual") return { status: "playing" };
  if (state.matchMode === "first-to-5") {
    const winner = PLAYERS.find((player) => state.score[player] >= 5);

    return winner ? { status: "complete", winner } : { status: "playing" };
  }

  const leadingWinner = PLAYERS.find((player) => state.score[player] >= 3);
  if (leadingWinner) return { status: "complete", winner: leadingWinner };
  if (state.history.length < 5) return { status: "playing" };
  if (state.score.circle === state.score.cross) {
    return { status: "complete", winner: "draw" };
  }

  return {
    status: "complete",
    winner: state.score.circle > state.score.cross ? "circle" : "cross",
  };
}
