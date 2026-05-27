import { PLAYERS, WINS } from "../core/constants";
import type {
  AiDifficulty,
  GameMode,
  GameState,
  MatchMode,
  MatchWinner,
  Player,
  Starter,
} from "../core/types";
import { GameEngine } from "../game/game.engine";
import { SettingsService } from "../services/settings.service";
import { $, $$, shadowRootOf } from "./dom";

const MATERIAL_SYMBOLS_FONT = "/fonts/material-symbols-rounded.woff2";

let materialSymbolsLoading = false;

export class GameView {
  private roots = {
    shell: shadowRootOf("tic-game-shell"),
    start: shadowRootOf("tic-start-menu"),
    options: shadowRootOf("tic-options-menu"),
    history: shadowRootOf("tic-history-panel"),
  };
  private componentRoots = {
    actions: this.getComponentRoot("tic-game-actions", this.roots.shell),
    board: this.getComponentRoot("tic-board", this.roots.shell),
    scoreboard: this.getComponentRoot("tic-player-scoreboard", this.roots.shell),
  };
  private board = {
    tiles: $$<HTMLElement>("[data-tile]", this.componentRoots.board),
    winLine: $<HTMLElement>("#win_line", this.componentRoots.board),
  };
  private controls = {
    muteToggle: $<HTMLButtonElement>("#mute_toggle", this.roots.options),
    reset: $<HTMLButtonElement>("#reset", this.roots.options),
    resetGame: $<HTMLButtonElement>("#reset_game", this.roots.options),
    mobileReset: $<HTMLButtonElement>("#mobile_reset", this.componentRoots.actions),
    settingsToggle: $<HTMLButtonElement>("#settings_toggle", this.componentRoots.actions),
  };
  private history = {
    panel: $<HTMLElement>("#history_panel", this.roots.history),
    list: $<HTMLOListElement>("#history_list", this.roots.history),
    toggle: $<HTMLButtonElement>("#history_toggle", this.roots.options),
    close: $<HTMLButtonElement>("#history_close", this.roots.history),
  };
  private options = {
    menu: $<HTMLElement>("#options_menu", this.roots.options),
    modal: $<HTMLDialogElement>("#options_modal", this.roots.options),
    markerColors: {
      circle: $<HTMLInputElement>("#circle_color", this.roots.options),
      cross: $<HTMLInputElement>("#cross_color", this.roots.options),
    },
  };
  private players = {
    circle: this.getPlayerRefs("#player_1"),
    cross: this.getPlayerRefs("#player_2"),
  };
  readonly playerNameElements = {
    circle: this.players.circle.name,
    cross: this.players.cross.name,
  };
  private round = {
    game: $<HTMLElement>("#game", this.roots.shell),
    meta: $<HTMLElement>("#round_meta", this.roots.shell),
    status: $<HTMLElement>("#round_status", this.roots.shell),
  };
  private start = {
    button: $<HTMLButtonElement>("#start_game", this.roots.start),
    modeButtons: $$<HTMLButtonElement>("[data-mode-option]", this.roots.start),
    difficultyButtons: $$<HTMLButtonElement>("[data-difficulty]", this.roots.start),
    starterButtons: $$<HTMLButtonElement>("[data-starter]", this.roots.start),
    matchButtons: $$<HTMLButtonElement>("[data-match-mode]", this.roots.start),
  };
  private stats = {
    rounds: $<HTMLElement>("#stat_rounds", this.roots.history),
    draws: $<HTMLElement>("#stat_draws", this.roots.history),
    circleWins: $<HTMLElement>("#stat_circle_wins", this.roots.history),
    crossWins: $<HTMLElement>("#stat_cross_wins", this.roots.history),
    circleRate: $<HTMLElement>("#stat_circle_rate", this.roots.history),
    crossRate: $<HTMLElement>("#stat_cross_rate", this.roots.history),
  };
  private queries = {
    mobileOptions: window.matchMedia("(max-width: 640px)"),
  };
  private matchComplete = false;

  constructor() {
    loadMaterialSymbols();
  }

  onTileClick(handler: (index: number) => void) {
    this.board.tiles.forEach((tile, index) => {
      tile.addEventListener("click", () => handler(index));
      tile.addEventListener("keydown", (event) => this.handleTileKeydown(event, index, handler));
    });
  }

  onStartGame(handler: () => void) {
    this.start.button.addEventListener("click", handler);
  }

  onGameModeChange(handler: (mode: GameMode) => void) {
    this.start.modeButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.modeOption as GameMode));
    });
  }

  onDifficultyChange(handler: (difficulty: AiDifficulty) => void) {
    this.start.difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.difficulty as AiDifficulty));
    });
  }

  onStarterChange(handler: (starter: Starter) => void) {
    this.start.starterButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.starter as Starter));
    });
  }

  onMatchModeChange(handler: (matchMode: MatchMode) => void) {
    this.start.matchButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const matchMode = button.dataset.matchMode;

        SettingsService.isMatchMode(matchMode) && handler(matchMode);
      });
    });
  }

  onHistoryToggle(handler: () => void) {
    this.history.toggle.addEventListener("click", handler);
  }

  onHistoryClose(handler: () => void) {
    this.history.close.addEventListener("click", handler);
  }

  onMuteToggle(handler: () => void) {
    this.controls.muteToggle.addEventListener("click", handler);
  }

  onMarkerColorChange(handler: (player: Player, color: string) => void) {
    this.options.markerColors.circle.addEventListener("input", () =>
      handler("circle", this.options.markerColors.circle.value),
    );
    this.options.markerColors.cross.addEventListener("input", () =>
      handler("cross", this.options.markerColors.cross.value),
    );
  }

  onSettingsToggle(handler: () => void) {
    this.controls.settingsToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      handler();
    });
  }

  onMobileOptionsChange(handler: () => void) {
    this.queries.mobileOptions.addEventListener("change", handler);
  }

  onDocumentDismiss(handler: () => void) {
    document.addEventListener("click", (event) => {
      const path = event.composedPath();
      const shouldDismiss =
        this.options.modal.open &&
        !path.includes(this.options.menu) &&
        !path.includes(this.controls.settingsToggle);

      shouldDismiss && handler();
    });

    document.addEventListener("keydown", (event) => {
      event.key === "Escape" && handler();
    });
  }

  onRoundReset(handler: () => void) {
    this.controls.reset.addEventListener("click", handler);
    this.controls.mobileReset.addEventListener("click", () => !this.matchComplete && handler());
  }

  onFullReset(handler: () => void) {
    this.controls.resetGame.addEventListener("click", handler);
    this.controls.mobileReset.addEventListener("click", () => this.matchComplete && handler());
  }

  render(state: GameState) {
    document.body.classList.toggle("game-started", state.gameStarted);
    document.body.dataset.aiDifficulty = state.aiDifficulty;
    document.body.dataset.gameMode = state.gameMode;
    (this.round.game as HTMLElement & { inert: boolean }).inert = !state.gameStarted;

    !state.gameStarted && this.closeOptionsModal();

    this.renderBoard(state);
    this.renderScore(state);
    this.renderStatus(state);
    this.renderMeta(state);
    this.renderActivePlayer(state);
    this.renderHistory(state);
    this.renderOptions(state);
    this.renderPrimaryAction(state);
    this.updateSettingsToggle(state.gameStarted);
  }

  syncOptionsPlacement() {
    this.options.menu.parentElement !== this.options.modal && this.options.modal.append(this.options.menu);
  }

  openOptionsModal() {
    !this.options.modal.open && this.options.modal.showModal();
  }

  closeOptionsModal() {
    this.options.modal.open && this.options.modal.close();
  }

  isHistoryOpen() {
    return this.history.panel.classList.contains("show");
  }

  setHistoryPanelOpen(isOpen: boolean) {
    this.history.panel.classList.toggle("show", isOpen);
    this.history.panel.setAttribute("aria-hidden", String(!isOpen));
  }

  setStartButtonsDisabled(isDisabled: boolean) {
    [this.start.button, ...this.start.modeButtons].forEach((button) => {
      button.disabled = isDisabled;
    });
  }

  focusStartButton() {
    this.start.button.focus();
  }

  private renderBoard(state: GameState) {
    this.board.tiles.forEach((tile, index) => {
      const value = state.board[index];
      const isWinner = state.winningCombination?.includes(index) || false;

      value
        ? (tile.dataset.value = value, tile.setAttribute("aria-label", value))
        : (delete tile.dataset.value, tile.setAttribute("aria-label", `empty tile ${index + 1}`));

      tile.classList.toggle("filled", Boolean(value));
      tile.classList.toggle("circle", value === "circle");
      tile.classList.toggle("cross", value === "cross");
      tile.classList.toggle("winner", isWinner);
      tile.setAttribute("aria-disabled", String(state.gameOver || Boolean(value)));
    });

    this.setWinnerColor(state);
    this.setWinningLine(state.winningCombination);
  }

  private renderScore(state: GameState) {
    this.players.circle.result.textContent = String(state.score.circle);
    this.players.cross.result.textContent = String(state.score.cross);
    this.players.circle.name.textContent = state.playerNames.circle;
    this.players.cross.name.textContent = state.playerNames.cross;
  }

  private renderStatus(state: GameState) {
    this.round.status.classList.toggle(
      "winner",
      Boolean(state.roundWinner && state.roundWinner !== "draw"),
    );

    this.round.status.textContent = !state.gameStarted
      ? "Start game"
      : state.match.status === "complete"
        ? this.getMatchWinnerLabel(state.match.winner, state)
      : state.roundWinner === "draw"
        ? "draw"
        : state.roundWinner
          ? `${state.playerNames[state.roundWinner]} wins`
          : this.isAiTurn(state)
            ? `${state.playerNames[state.current]} is thinking`
            : `${state.playerNames[state.current]}'s turn`;
  }

  private renderMeta(state: GameState) {
    const mode = GameEngine.getModeLabel(state.gameMode);
    const difficulty = state.gameMode === "user-user" ? "no AI" : state.aiDifficulty;
    const starterName = state.playerNames[state.roundStarter];
    const matchLabel = this.getMatchLabel(state);
    const matchPoint = this.isMatchPoint(state) ? " | match point" : "";

    this.round.meta.textContent = state.gameStarted
      ? `${mode} | ${difficulty} | ${matchLabel} | started: ${starterName}${matchPoint}`
      : "";
  }

  private renderActivePlayer(state: GameState) {
    this.players.circle.element.classList.toggle(
      "active",
      state.current === "circle" && !state.gameOver && state.gameStarted,
    );
    this.players.cross.element.classList.toggle(
      "active",
      state.current === "cross" && !state.gameOver && state.gameStarted,
    );
  }

  private renderHistory(state: GameState) {
    const rounds = state.history.length;
    const draws = state.history.filter((round) => round.winner === "draw").length;
    const circleWins = state.history.filter((round) => round.winner === "circle").length;
    const crossWins = state.history.filter((round) => round.winner === "cross").length;

    this.stats.rounds.textContent = `${rounds} ${rounds === 1 ? "round" : "rounds"}`;
    this.stats.draws.textContent = `${draws} ${draws === 1 ? "draw" : "draws"}`;
    this.stats.circleWins.textContent = `O ${circleWins} ${circleWins === 1 ? "win" : "wins"}`;
    this.stats.crossWins.textContent = `X ${crossWins} ${crossWins === 1 ? "win" : "wins"}`;
    this.stats.circleRate.textContent = `O ${this.getWinRate(circleWins, rounds)}%`;
    this.stats.crossRate.textContent = `X ${this.getWinRate(crossWins, rounds)}%`;
    this.history.list.innerHTML = state.history
      .map((round) => {
        const winner =
          round.winner === "draw"
            ? "draw"
            : `${this.escapeHtml(state.playerNames[round.winner])} won`;

        return `
          <li>
            <span>#${round.round}</span>
            <strong>${winner}</strong>
            <small>${GameEngine.getModeLabel(round.mode)} | ${round.difficulty} | ${this.escapeHtml(
              state.playerNames[round.starter],
            )} started | ${this.getRoundMatchLabel(round.matchMode)}</small>
          </li>
        `;
      })
      .join("");
  }

  private renderOptions(state: GameState) {
    this.start.modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.modeOption === state.gameMode);
    });

    this.start.difficultyButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.difficulty === state.aiDifficulty);
    });

    this.start.starterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.starter === state.starter);
    });
    this.start.matchButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.matchMode === state.matchMode);
    });
    this.start.difficultyButtons.forEach((button) => {
      button.disabled = state.gameMode === "user-user";
    });

    this.setIconButton(
      this.controls.muteToggle,
      state.muted ? "volume_off" : "volume_up",
      "sound",
    );
    this.options.markerColors.circle.value = state.markerColors.circle;
    this.options.markerColors.cross.value = state.markerColors.cross;
    this.options.markerColors.circle.parentElement?.style.setProperty(
      "--swatch-color",
      state.markerColors.circle,
    );
    this.options.markerColors.cross.parentElement?.style.setProperty(
      "--swatch-color",
      state.markerColors.cross,
    );
    document.documentElement.style.setProperty("--circle-color", state.markerColors.circle);
    document.documentElement.style.setProperty("--cross-color", state.markerColors.cross);
  }

  private renderPrimaryAction(state: GameState) {
    const matchComplete = state.match.status === "complete";
    const desktopVisible = state.gameStarted && state.gameOver && !matchComplete;
    const mobileVisible = state.gameStarted && state.gameOver;
    this.matchComplete = matchComplete;

    this.setIconButton(this.controls.reset, "restart_alt", "new round");
    this.controls.mobileReset.textContent = this.matchComplete ? "main menu" : "new round";
    this.controls.reset.classList.toggle("show", desktopVisible);
    this.controls.mobileReset.classList.toggle("show", mobileVisible);
  }

  private updateSettingsToggle(gameStarted: boolean) {
    this.controls.settingsToggle.hidden = !gameStarted;
  }

  private setWinningLine(combination: number[] | null) {
    this.board.winLine.className = "";

    if (!combination) return;

    const index = WINS.findIndex((win) => win.every((tile, i) => tile === combination[i]));
    if (index < 0) return;

    this.board.winLine.classList.add("show", `line-${index}`);
  }

  private setWinnerColor(state: GameState) {
    if (!state.roundWinner || state.roundWinner === "draw") {
      document.documentElement.style.removeProperty("--winner-color");
      return;
    }

    document.documentElement.style.setProperty(
      "--winner-color",
      state.markerColors[state.roundWinner],
    );
  }

  private isAiTurn(state: GameState) {
    return (
      state.gameStarted &&
      !state.gameOver &&
      (state.gameMode === "ai-ai" || (state.gameMode === "user-ai" && state.current === "cross"))
    );
  }

  private getWinRate(wins: number, rounds: number) {
    return rounds === 0 ? 0 : Math.round((wins / rounds) * 100);
  }

  private escapeHtml(value: string) {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
  }

  private handleTileKeydown(
    event: KeyboardEvent,
    index: number,
    handler: (index: number) => void,
  ) {
    const nextIndexByKey: Partial<Record<string, number>> = {
      ArrowUp: index - 3,
      ArrowDown: index + 3,
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
    };

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler(index);
      return;
    }

    const nextIndex = nextIndexByKey[event.key];
    if (nextIndex === undefined || nextIndex < 0 || nextIndex >= this.board.tiles.length) return;
    if (event.key === "ArrowLeft" && index % 3 === 0) return;
    if (event.key === "ArrowRight" && index % 3 === 2) return;

    event.preventDefault();
    this.board.tiles[nextIndex].focus();
  }

  private isMatchPoint(state: GameState) {
    if (state.matchMode === "casual" || state.roundWinner) return false;

    if (state.matchMode === "first-to-5") {
      return PLAYERS.some((player) => state.score[player] === 4);
    }

    return this.getBestOfRound(state) === 5 || PLAYERS.some((player) => state.score[player] === 2);
  }

  private getMatchWinnerLabel(winner: MatchWinner, state: GameState) {
    return winner === "draw"
      ? "match draw"
      : `${state.playerNames[winner]} wins match`;
  }

  private getMatchLabel(state: GameState) {
    if (state.matchMode === "casual") return "casual";
    if (state.matchMode === "first-to-5") return "race to 5";

    return `best of 5 | round ${this.getBestOfRound(state)}/5`;
  }

  private getRoundMatchLabel(matchMode: MatchMode) {
    return matchMode === "casual"
      ? "casual"
      : matchMode === "first-to-5"
        ? "race to 5"
        : "best of 5";
  }

  private getBestOfRound(state: GameState) {
    const playedRounds = state.history.length;

    return Math.min(state.gameOver ? playedRounds : playedRounds + 1, 5);
  }

  private getPlayerRefs(selector: string) {
    const element = $<HTMLElement>(selector, this.componentRoots.scoreboard);

    return {
      element,
      name: $<HTMLElement>(".player-name", element),
      result: $<HTMLElement>(".result", element),
    };
  }

  private setIconButton(button: HTMLButtonElement, icon: string, label: string) {
    const iconElement = $<HTMLElement>(".material-symbols-rounded", button);
    const labelElement = $<HTMLElement>("span:last-child", button);

    iconElement.textContent = icon;
    labelElement.textContent = label;
  }

  private getComponentRoot(selector: string, root: ParentNode) {
    const element = $<HTMLElement>(selector, root);

    if (!element.shadowRoot) {
      throw new Error(`Missing component shadow root: ${selector}`);
    }

    return element.shadowRoot;
  }
}

function loadMaterialSymbols() {
  if (materialSymbolsLoading || document.querySelector("style[data-material-symbols-rounded]")) {
    return;
  }

  materialSymbolsLoading = true;

  const link = document.createElement("link");
  link.dataset.materialSymbolsRounded = "true";
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.crossOrigin = "anonymous";
  link.href = MATERIAL_SYMBOLS_FONT;

  const style = document.createElement("style");
  style.dataset.materialSymbolsRounded = "true";
  style.textContent = `
    @font-face {
      font-family: "Material Symbols Rounded";
      font-style: normal;
      font-weight: 500;
      font-display: block;
      src: url("${MATERIAL_SYMBOLS_FONT}") format("woff2");
    }
  `;

  document.head.append(link, style);
}
