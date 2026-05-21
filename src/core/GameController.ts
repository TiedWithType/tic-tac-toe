import {
  AI_MOVE_DELAY,
  DEFAULT_MARKER_COLORS,
  DEFAULT_PLAYER_NAMES,
  PLAYERS,
} from "./constants";
import type { AiDifficulty, GameMode, GameState, Player, Starter } from "./types";
import { AiPlayer } from "../game/AiPlayer";
import { GameEngine } from "../game/GameEngine";
import { AppConfigService } from "../services/AppConfigService";
import { AudioService } from "../services/AudioService";
import { SettingsStorage } from "../services/SettingsStorage";
import { GameView } from "../ui/GameView";
import { PlayerNameEditor } from "../ui/PlayerNameEditor";

export class GameController {
  private state: GameState = {
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
    muted: false,
    markerColors: { ...DEFAULT_MARKER_COLORS },
    score: {
      circle: 0,
      cross: 0,
    },
    playerNames: { ...DEFAULT_PLAYER_NAMES },
    history: [],
  };

  private aiMoveTimer: number | null = null;
  private isStarting = false;

  constructor(
    private view: GameView,
    private aiPlayer: AiPlayer,
    private audio: AudioService,
    private storage: SettingsStorage,
    private configService: AppConfigService,
  ) {}

  init() {
    const config = this.configService.getConfig();

    this.view.renderAppTitle(config.appName);
    this.view.renderFooter(config);
    this.applyDefaultPlayers(config.defaultPlayers);
    this.loadSettings();
    this.audio.setMuted(this.state.muted);
    this.bindEvents();
    this.setupPlayerNameEditors();
    this.view.syncOptionsPlacement();
    this.render();
  }

  private bindEvents() {
    this.view.onTileClick((index) => {
      if (!this.state.gameStarted) return;
      if (this.state.gameOver) return;
      if (this.isAiTurn()) return;

      this.makeMove(index, this.state.current);
    });

    this.view.onStartGame((mode) => {
      void this.startGameWithIntro(mode);
    });

    this.view.onDifficultyChange((difficulty) => {
      this.setAiDifficulty(difficulty);
      this.saveSettings();
      this.render();
    });

    this.view.onStarterChange((starter) => {
      this.setStarter(starter);
      this.saveSettings();
      this.render();
    });

    this.view.onChangeMode(() => {
      this.openModeSelector();
      this.view.closeOptionsModal();
    });

    this.view.onHistoryToggle(() => {
      this.view.setHistoryPanelOpen(!this.view.isHistoryOpen());
      this.view.closeOptionsModal();
    });

    this.view.onHistoryClose(() => {
      this.view.setHistoryPanelOpen(false);
    });

    this.view.onMuteToggle(() => {
      this.setMuted(!this.state.muted);
      this.saveSettings();
      this.render();
    });

    this.view.onMarkerColorChange((player, color) => {
      this.setMarkerColor(player, color);
      this.saveSettings();
      this.render();
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
          this.state.playerNames[player] = name;
          this.saveSettings();
          this.render();
        },
      }).init();
    });
  }

  private async startGameWithIntro(mode: GameMode) {
    if (this.isStarting) return;

    this.isStarting = true;
    this.view.setStartButtonsDisabled(true);
    try {
      await this.audio.playIntro();
      this.startGame(mode);
    } finally {
      this.view.setStartButtonsDisabled(false);
      this.isStarting = false;
    }
  }

  private startGame(mode: GameMode) {
    this.cancelAiMove();
    this.state.gameMode = mode;
    this.state.current = GameEngine.getNextStarter(this.state.starter);
    this.state.roundStarter = this.state.current;
    this.state.gameStarted = true;
    this.state.gameOver = false;
    this.state.roundWinner = null;
    this.state.winningCombination = null;
    this.audio.resume();
    this.saveSettings();
    this.render();
    this.scheduleAiMove();
  }

  private makeMove(index: number, player: Player) {
    if (this.state.board[index]) return;

    this.state.board[index] = player;
    this.finishTurn();
  }

  private finishTurn() {
    const won = this.checkWinner();

    if (!won && GameEngine.isBoardFull(this.state.board)) {
      this.state.gameOver = true;
      this.state.roundWinner = "draw";
      this.recordRound("draw");
      this.audio.playDraw();
      this.render();
      return;
    }

    if (this.state.gameOver) return;

    this.audio.playPlayerMove(this.state.current);
    this.state.current = GameEngine.getOpponent(this.state.current);
    this.render();
    this.scheduleAiMove();
  }

  private checkWinner() {
    const result = GameEngine.getWinner(this.state.board);
    if (!result) return false;

    this.state.gameOver = true;
    this.state.roundWinner = result.winner;
    this.state.winningCombination = result.combination;

    this.state.score[result.winner]++;
    this.recordRound(result.winner);
    this.audio.playWin();
    this.render();
    return true;
  }

  private resetRound() {
    this.cancelAiMove();
    this.clearBoard();

    this.state.current = GameEngine.getNextStarter(this.state.starter);
    this.state.roundStarter = this.state.current;
    this.state.gameOver = false;
    this.state.roundWinner = null;
    this.render();
    this.scheduleAiMove();
    this.view.closeOptionsModal();
  }

  private resetGame() {
    this.cancelAiMove();
    this.clearBoard();

    this.state.score.circle = 0;
    this.state.score.cross = 0;
    this.state.current = GameEngine.getNextStarter(this.state.starter);
    this.state.roundStarter = this.state.current;
    this.state.gameMode = "user-user";
    this.state.gameOver = false;
    this.state.gameStarted = false;
    this.state.roundWinner = null;
    this.state.history.length = 0;

    this.saveSettings();
    this.render();
    this.view.focusStartButton();
    this.view.closeOptionsModal();
  }

  private clearBoard() {
    this.state.board = Array(9).fill(null);
    this.state.winningCombination = null;
  }

  private openModeSelector() {
    this.cancelAiMove();
    this.clearBoard();
    this.state.gameStarted = false;
    this.state.gameOver = false;
    this.state.roundWinner = null;
    this.state.current = GameEngine.getNextStarter(this.state.starter);
    this.state.roundStarter = this.state.current;
    this.render();
  }

  private isAiTurn() {
    if (!this.state.gameStarted || this.state.gameOver) return false;
    if (this.state.gameMode === "ai-ai") return true;
    return this.state.gameMode === "user-ai" && this.state.current === "cross";
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

    this.makeMove(moveIndex, this.state.current);
  }

  private setAiDifficulty(difficulty: AiDifficulty) {
    this.state.aiDifficulty = difficulty;
  }

  private setStarter(starter: Starter) {
    this.state.starter = starter;
  }

  private setMuted(nextMuted: boolean) {
    this.state.muted = nextMuted;
    this.audio.setMuted(nextMuted);
  }

  private setMarkerColor(player: Player, color: string) {
    if (!SettingsStorage.isHexColor(color)) return;

    this.state.markerColors[player] = color;
  }

  private recordRound(winner: Player | "draw") {
    this.state.history.unshift({
      round: this.state.history.length + 1,
      mode: this.state.gameMode,
      difficulty: this.state.aiDifficulty,
      starter: this.state.roundStarter,
      winner,
    });
  }

  private loadSettings() {
    const settings = this.storage.load();

    if (settings.playerNames) {
      PLAYERS.forEach((player) => {
        const savedName = settings.playerNames?.[player];
        if (!savedName) return;

        this.state.playerNames[player] =
          PlayerNameEditor.normalize(savedName) || this.state.playerNames[player];
      });
    }

    if (settings.markerColors) {
      PLAYERS.forEach((player) => {
        const savedColor = settings.markerColors?.[player];
        if (!SettingsStorage.isHexColor(savedColor)) return;

        this.state.markerColors[player] = savedColor;
      });
    }

    if (SettingsStorage.isGameMode(settings.gameMode)) this.state.gameMode = settings.gameMode;
    if (SettingsStorage.isDifficulty(settings.aiDifficulty)) {
      this.state.aiDifficulty = settings.aiDifficulty;
    }
    if (SettingsStorage.isStarter(settings.starter)) this.state.starter = settings.starter;
    if (typeof settings.muted === "boolean") this.state.muted = settings.muted;
  }

  private saveSettings() {
    this.storage.save({
      playerNames: this.state.playerNames,
      markerColors: this.state.markerColors,
      gameMode: this.state.gameMode,
      aiDifficulty: this.state.aiDifficulty,
      starter: this.state.starter,
      muted: this.state.muted,
    });
  }

  private applyDefaultPlayers(defaultPlayers: Partial<Record<Player, string>>) {
    PLAYERS.forEach((player) => {
      const defaultName = defaultPlayers[player];
      if (!defaultName) return;

      this.state.playerNames[player] =
        PlayerNameEditor.normalize(defaultName) || this.state.playerNames[player];
    });
  }

  private render() {
    this.view.render(this.state);
  }
}
