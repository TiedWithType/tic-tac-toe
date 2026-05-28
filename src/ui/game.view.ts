import "../components/game-shell/game-shell.component";
import "../components/history-panel/history-panel.component";
import "../components/options-menu/options-menu.component";
import type { AiDifficulty, GameMode, GameState, MatchMode, Player, Starter } from "../core/types";
import type { GameActionsComponent } from "../components/game-actions/game-actions.component";
import type { BoardComponent } from "../components/game-board/board.component";
import type { GameShellComponent } from "../components/game-shell/game-shell.component";
import type { HistoryPanelComponent } from "../components/history-panel/history-panel.component";
import type { OptionsMenuComponent } from "../components/options-menu/options-menu.component";
import type { PlayerScoreboardComponent } from "../components/player-scoreboard/player-scoreboard.component";
import type { StartMenuComponent } from "../components/start-menu/start-menu.component";
import { $, appRoot } from "./dom";

export class GameView {
  private root = appRoot();
  private shell: GameShellComponent;
  private start: StartMenuComponent;
  private options: OptionsMenuComponent;
  private history: HistoryPanelComponent;
  private board: BoardComponent;
  private actions: GameActionsComponent;
  private scoreboard: PlayerScoreboardComponent;
  readonly playerNameElements: PlayerScoreboardComponent["playerNameElements"];
  private queries = {
    mobileOptions: window.matchMedia("(max-width: 640px)"),
  };

  constructor() {
    this.mountGameComponents();

    this.shell = this.getComponent<GameShellComponent>("tic-game-shell");
    this.start = this.getComponent<StartMenuComponent>("tic-start-menu");
    this.options = this.getComponent<OptionsMenuComponent>("tic-options-menu");
    this.history = this.getComponent<HistoryPanelComponent>("tic-history-panel");
    this.board = this.getNestedComponent<BoardComponent>("tic-board", this.shell.root);
    this.actions = this.getNestedComponent<GameActionsComponent>(
      "tic-game-actions",
      this.shell.root,
    );
    this.scoreboard = this.getNestedComponent<PlayerScoreboardComponent>(
      "tic-player-scoreboard",
      this.shell.root,
    );
    this.playerNameElements = this.scoreboard.playerNameElements;
  }

  onTileClick(handler: (index: number) => void) {
    this.board.onTileClick(handler);
  }

  onStartGame(handler: () => void) {
    this.start.onStart(handler);
  }

  onGameModeChange(handler: (mode: GameMode) => void) {
    this.start.onGameModeChange(handler);
  }

  onDifficultyChange(handler: (difficulty: AiDifficulty) => void) {
    this.start.onDifficultyChange(handler);
  }

  onStarterChange(handler: (starter: Starter) => void) {
    this.start.onStarterChange(handler);
  }

  onMatchModeChange(handler: (matchMode: MatchMode) => void) {
    this.start.onMatchModeChange(handler);
  }

  onHistoryToggle(handler: () => void) {
    this.options.onHistoryToggle(handler);
  }

  onHistoryClose(handler: () => void) {
    this.history.onClose(handler);
  }

  onMuteToggle(handler: () => void) {
    this.options.onMuteToggle(handler);
  }

  onMarkerColorChange(handler: (player: Player, color: string) => void) {
    this.options.onMarkerColorChange(handler);
  }

  onSettingsToggle(handler: () => void) {
    this.actions.onSettingsToggle(handler);
  }

  onMobileOptionsChange(handler: () => void) {
    this.queries.mobileOptions.addEventListener("change", handler);
  }

  onDocumentDismiss(handler: () => void) {
    document.addEventListener("click", (event) => {
      const path = event.composedPath();
      const shouldDismiss =
        this.options.isModalOpen() &&
        !path.some((target) => this.options.containsTarget(target)) &&
        !path.some((target) => this.actions.containsSettingsToggle(target));

      shouldDismiss && handler();
    });

    document.addEventListener("keydown", (event) => {
      event.key === "Escape" && handler();
    });
  }

  onRoundReset(handler: () => void) {
    this.options.onRoundReset(handler);
    this.actions.onRoundReset(handler);
  }

  onFullReset(handler: () => void) {
    this.options.onFullReset(handler);
    this.actions.onFullReset(handler);
  }

  render(state: GameState) {
    document.body.classList.toggle("game-started", state.gameStarted);
    document.body.dataset.aiDifficulty = state.aiDifficulty;
    document.body.dataset.gameMode = state.gameMode;

    if (!state.gameStarted) {
      this.closeOptionsModal();
    }

    this.applyTheme(state);
    this.shell.render(state);
    this.scoreboard.render(state);
    this.board.render(state);
    this.history.render(state);
    this.options.render(state);
    this.actions.render(state);
    this.start.render(state);
  }

  syncOptionsPlacement() {
    this.options.syncPlacement();
  }

  openOptionsModal() {
    this.options.openModal();
  }

  closeOptionsModal() {
    this.options.closeModal();
  }

  isHistoryOpen() {
    return this.history.isOpen();
  }

  setHistoryPanelOpen(isOpen: boolean) {
    this.history.setOpen(isOpen);
  }

  setStartButtonsDisabled(isDisabled: boolean) {
    this.start.setLoading(isDisabled);
  }

  focusStartButton() {
    this.start.focusStartButton();
  }

  private applyTheme(state: GameState) {
    document.documentElement.style.setProperty("--circle-color", state.markerColors.circle);
    document.documentElement.style.setProperty("--cross-color", state.markerColors.cross);

    if (!state.roundWinner || state.roundWinner === "draw") {
      document.documentElement.style.removeProperty("--winner-color");
      return;
    }

    document.documentElement.style.setProperty(
      "--winner-color",
      state.markerColors[state.roundWinner],
    );
  }

  private getComponent<T extends HTMLElement>(selector: string) {
    return $<T>(selector, this.root);
  }

  private mountGameComponents() {
    this.ensureRootElement("tic-game-shell", "before-start");
    this.ensureRootElement("tic-options-menu", "before-start");
    this.ensureRootElement("tic-history-panel", "after-start");
  }

  private ensureRootElement(tagName: string, placement: "before-start" | "after-start") {
    if (this.root.querySelector(tagName)) return;

    const element = document.createElement(tagName);
    const start = this.root.querySelector("tic-start-menu");

    if (!start) {
      this.root.append(element);
      return;
    }

    placement === "before-start" ? start.before(element) : start.after(element);
  }

  private getNestedComponent<T extends HTMLElement>(selector: string, root: ParentNode) {
    const element = $<T>(selector, root);

    if (!element.shadowRoot) {
      throw new Error(`Missing component shadow root: ${selector}`);
    }

    return element;
  }
}
