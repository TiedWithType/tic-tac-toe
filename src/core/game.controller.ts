import { AI_MOVE_DELAY, PLAYERS } from "./constants";
import type { GameAction, GameStore } from "./game.store";
import { createSettingsSnapshot } from "./game.store";
import type { GameMode, GameState } from "./types";
import type { AiPlayer } from "../game/ai.player";
import { GameEngine } from "../game/game.engine";
import type { AudioService } from "../services/audio.service";
import { SettingsService } from "../services/settings.service";
import type { GameView } from "../ui/game.view";
import { PlayerNameEditor } from "../ui/player.name.editor";

type GameControllerInitOptions = {
  autoStartMode?: GameMode;
};

export class GameController {
  private aiMoveTimer: number | null = null;
  private isStarting = false;

  constructor(
    private view: GameView,
    private aiPlayer: AiPlayer,
    private audio: AudioService,
    private storage: SettingsService,
    private store: GameStore,
  ) {}

  init(options: GameControllerInitOptions = {}) {
    this.store.subscribe((state, previousState, action) => {
      this.handleStateEffects(state, previousState, action);
      this.render();
    });
    this.store.dispatch({ type: "hydrateSettings", settings: this.storage.load() });
    this.audio.setMuted(this.state.muted);
    this.bindEvents();
    this.setupPlayerNameEditors();
    this.view.syncOptionsPlacement();
    this.render();

    if (options.autoStartMode) {
      this.startGameWithIntro(options.autoStartMode);
    }
  }

  private get state() {
    return this.store.getState();
  }

  private bindEvents() {
    this.view.onTileClick((index) => {
      if (!this.state.gameStarted || this.state.gameOver || this.isAiTurn()) return;

      this.store.dispatch({ type: "makeMove", index, player: this.state.current });
    });

    this.view.onStartGame(() => {
      this.startGameWithIntro();
    });

    this.view.onGameModeChange((mode) => {
      this.store.dispatch({ type: "setGameMode", mode });
    });

    this.view.onDifficultyChange((difficulty) => {
      this.store.dispatch({ type: "setAiDifficulty", difficulty });
    });

    this.view.onStarterChange((starter) => {
      this.store.dispatch({ type: "setStarter", starter });
    });

    this.view.onMatchModeChange((matchMode) => {
      this.store.dispatch({ type: "setMatchMode", matchMode });
    });

    this.view.onHistoryToggle(() => {
      this.view.setHistoryPanelOpen(!this.view.isHistoryOpen());
      this.view.closeOptionsModal();
    });

    this.view.onHistoryClose(() => {
      this.view.setHistoryPanelOpen(false);
    });

    this.view.onMuteToggle(() => {
      this.store.dispatch({ type: "setMuted", muted: !this.state.muted });
    });

    this.view.onMarkerColorChange((player, color) => {
      this.store.dispatch({ type: "setMarkerColor", player, color });
    });

    this.view.onSettingsToggle(() => {
      this.view.openOptionsModal();
    });

    this.view.onMobileOptionsChange(() => {
      this.view.syncOptionsPlacement();
      this.render();
    });

    this.view.onDocumentDismiss(() => {
      this.view.closeOptionsModal();
    });

    this.view.onRoundReset(() => {
      this.resetRound();
    });

    this.view.onFullReset(() => {
      this.resetGame();
    });
  }

  private setupPlayerNameEditors() {
    PLAYERS.forEach((player) => {
      new PlayerNameEditor({
        element: this.view.playerNameElements[player],
        getName: () => this.state.playerNames[player],
        onCommit: (name) => {
          this.store.dispatch({ type: "setPlayerName", player, name });
        },
      }).init();
    });
  }

  private startGameWithIntro(mode = this.state.gameMode) {
    if (this.isStarting) return;

    this.isStarting = true;
    this.view.setStartButtonsDisabled(true);

    try {
      void this.audio.playIntro();
      this.startGame(mode);
    } finally {
      this.view.setStartButtonsDisabled(false);
      this.isStarting = false;
    }
  }

  private startGame(mode: GameMode) {
    this.cancelAiMove();
    this.store.dispatch({
      type: "startGame",
      mode,
      starter: GameEngine.getNextStarter(this.state.starter),
    });
  }

  private resetRound() {
    this.cancelAiMove();
    this.store.dispatch({
      type: "resetRound",
      starter: GameEngine.getNextStarter(this.state.starter),
    });
    this.view.closeOptionsModal();
  }

  private resetGame() {
    this.cancelAiMove();
    this.store.dispatch({
      type: "resetGame",
      starter: GameEngine.getNextStarter(this.state.starter),
    });
    this.view.focusStartButton();
    this.view.closeOptionsModal();
  }

  private handleStateEffects(state: GameState, previousState: GameState, action: GameAction) {
    if (state.muted !== previousState.muted) {
      this.audio.setMuted(state.muted);
    }

    if (action.type === "startGame") {
      this.audio.resume();
    }

    if (action.type === "makeMove" && state.board !== previousState.board) {
      this.playMoveResultSound(state, previousState, action.player);
    }

    if (shouldPersistSettings(action)) {
      this.saveSettings();
    }

    if (shouldScheduleAiMove(action)) {
      this.scheduleAiMove();
    }
  }

  private playMoveResultSound(state: GameState, previousState: GameState, player: GameState["current"]) {
    if (state.gameOver && !previousState.gameOver) {
      state.roundWinner === "draw" ? this.audio.playDraw() : this.audio.playWin();
      return;
    }

    if (state.current !== previousState.current) {
      this.audio.playPlayerMove(player);
    }
  }

  private isAiTurn() {
    return isAiTurn(this.state);
  }

  private scheduleAiMove() {
    this.cancelAiMove();

    if (!this.isAiTurn()) return;

    this.aiMoveTimer = window.setTimeout(() => {
      this.aiMoveTimer = null;
      this.playAiMove();
    }, AI_MOVE_DELAY);
  }

  private cancelAiMove() {
    if (this.aiMoveTimer === null) return;

    window.clearTimeout(this.aiMoveTimer);
    this.aiMoveTimer = null;
  }

  private playAiMove() {
    if (!this.isAiTurn()) return;

    const moveIndex = this.aiPlayer.getMove(
      this.state.board,
      this.state.current,
      this.state.aiDifficulty,
    );
    if (moveIndex === null) return;

    this.store.dispatch({ type: "makeMove", index: moveIndex, player: this.state.current });
  }

  private saveSettings() {
    this.storage.save(createSettingsSnapshot(this.state));
  }

  private render() {
    this.view.render(this.state);
  }
}

function isAiTurn(state: GameState) {
  return (
    state.gameStarted &&
    !state.gameOver &&
    (state.gameMode === "ai-ai" || (state.gameMode === "user-ai" && state.current === "cross"))
  );
}

function shouldScheduleAiMove(action: GameAction) {
  return action.type === "startGame" || action.type === "makeMove" || action.type === "resetRound";
}

function shouldPersistSettings(action: GameAction) {
  return (
    action.type === "startGame" ||
    action.type === "setAiDifficulty" ||
    action.type === "setGameMode" ||
    action.type === "setStarter" ||
    action.type === "setMatchMode" ||
    action.type === "setMuted" ||
    action.type === "setMarkerColor" ||
    action.type === "setPlayerName"
  );
}
