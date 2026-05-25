import { PLAYERS, WINS } from "../core/constants";
import type { AiDifficulty, GameMode, GameState, Player, Starter } from "../core/types";
import { GameEngine } from "../game/game.engine";

export class GameView {
  readonly tiles = [...document.querySelectorAll<HTMLElement>("[data-tile]")];
  readonly playerNameElements = {
    circle: document.querySelector<HTMLElement>("#player_1 .player-name")!,
    cross: document.querySelector<HTMLElement>("#player_2 .player-name")!,
  };

  private game = document.querySelector<HTMLElement>("#game")!;
  private roundStatus = document.querySelector<HTMLElement>("#round_status")!;
  private roundMeta = document.querySelector<HTMLElement>("#round_meta")!;
  private player1 = document.querySelector<HTMLElement>("#player_1")!;
  private player2 = document.querySelector<HTMLElement>("#player_2")!;
  private player1Result = document.querySelector<HTMLElement>("#player_1 .result")!;
  private player2Result = document.querySelector<HTMLElement>("#player_2 .result")!;
  private resetBtn = document.querySelector<HTMLButtonElement>("#reset")!;
  private mobileResetBtn = document.querySelector<HTMLButtonElement>("#mobile_reset")!;
  private resetGameBtn = document.querySelector<HTMLButtonElement>("#reset_game")!;
  private circleColorInput = document.querySelector<HTMLInputElement>("#circle_color")!;
  private crossColorInput = document.querySelector<HTMLInputElement>("#cross_color")!;
  private changeModeBtn = document.querySelector<HTMLButtonElement>("#change_mode")!;
  private historyToggleBtn = document.querySelector<HTMLButtonElement>("#history_toggle")!;
  private historyCloseBtn = document.querySelector<HTMLButtonElement>("#history_close")!;
  private muteToggleBtn = document.querySelector<HTMLButtonElement>("#mute_toggle")!;
  private optionsMenu = document.querySelector<HTMLElement>("#options_menu")!;
  private desktopOptionsMount = document.querySelector<HTMLElement>("#desktop_options_mount")!;
  private optionsModal = document.querySelector<HTMLDialogElement>("#options_modal")!;
  private optionsCloseBtn = document.querySelector<HTMLButtonElement>("#options_close")!;
  private settingsToggle = document.querySelector<HTMLButtonElement>("#settings_toggle")!;
  private startBtn = document.querySelector<HTMLButtonElement>("#start_game")!;
  private startButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-mode]")];
  private difficultyButtons = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-difficulty]"),
  ];
  private starterButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-starter]")];
  private winLine = document.querySelector<HTMLElement>("#win_line")!;
  private historyPanel = document.querySelector<HTMLElement>("#history_panel")!;
  private historyList = document.querySelector<HTMLOListElement>("#history_list")!;
  private statRounds = document.querySelector<HTMLElement>("#stat_rounds")!;
  private statDraws = document.querySelector<HTMLElement>("#stat_draws")!;
  private statCircleWins = document.querySelector<HTMLElement>("#stat_circle_wins")!;
  private statCrossWins = document.querySelector<HTMLElement>("#stat_cross_wins")!;
  private statCircleRate = document.querySelector<HTMLElement>("#stat_circle_rate")!;
  private statCrossRate = document.querySelector<HTMLElement>("#stat_cross_rate")!;
  private mobileOptionsQuery = window.matchMedia("(max-width: 640px)");

  onTileClick(handler: (index: number) => void) {
    this.tiles.forEach((tile, index) => {
      tile.addEventListener("click", () => handler(index));
    });
  }

  onStartGame(handler: (mode: GameMode) => void) {
    this.startButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.mode as GameMode));
    });
  }

  onDifficultyChange(handler: (difficulty: AiDifficulty) => void) {
    this.difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.difficulty as AiDifficulty));
    });
  }

  onStarterChange(handler: (starter: Starter) => void) {
    this.starterButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.starter as Starter));
    });
  }

  onChangeMode(handler: () => void) {
    this.changeModeBtn.addEventListener("click", handler);
  }

  onHistoryToggle(handler: () => void) {
    this.historyToggleBtn.addEventListener("click", handler);
  }

  onHistoryClose(handler: () => void) {
    this.historyCloseBtn.addEventListener("click", handler);
  }

  onMuteToggle(handler: () => void) {
    this.muteToggleBtn.addEventListener("click", handler);
  }

  onMarkerColorChange(handler: (player: Player, color: string) => void) {
    this.circleColorInput.addEventListener("input", () =>
      handler("circle", this.circleColorInput.value),
    );
    this.crossColorInput.addEventListener("input", () => handler("cross", this.crossColorInput.value));
  }

  onSettingsToggle(handler: () => void) {
    this.settingsToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      handler();
    });
  }

  onMobileOptionsChange(handler: () => void) {
    this.mobileOptionsQuery.addEventListener("change", handler);
  }

  onDocumentDismiss(handler: () => void) {
    document.addEventListener("click", (event) => {
      const shouldDismiss =
        this.optionsModal.open &&
        event.target instanceof Node &&
        !this.optionsMenu.contains(event.target);

      shouldDismiss && handler();
    });

    document.addEventListener("keydown", (event) => {
      event.key === "Escape" && handler();
    });

    this.optionsCloseBtn.addEventListener("click", handler);
  }

  onRoundReset(handler: () => void) {
    this.resetBtn.addEventListener("click", handler);
    this.mobileResetBtn.addEventListener("click", handler);
  }

  onFullReset(handler: () => void) {
    this.resetGameBtn.addEventListener("click", handler);
  }

  render(state: GameState) {
    document.body.classList.toggle("game-started", state.gameStarted);
    document.body.dataset.aiDifficulty = state.aiDifficulty;
    (this.game as HTMLElement & { inert: boolean }).inert = !state.gameStarted;

    !state.gameStarted && this.closeOptionsModal();

    this.renderBoard(state);
    this.renderScore(state);
    this.renderStatus(state);
    this.renderMeta(state);
    this.renderActivePlayer(state);
    this.renderHistory(state);
    this.renderOptions(state);
    this.setNewRoundVisible(state.gameStarted && state.gameOver);
    this.updateSettingsToggle(state.gameStarted);
  }

  syncOptionsPlacement() {
    const targetMount = this.mobileOptionsQuery.matches
      ? this.optionsModal
      : this.desktopOptionsMount;

    !this.mobileOptionsQuery.matches && this.closeOptionsModal();
    this.optionsMenu.parentElement !== targetMount && targetMount.append(this.optionsMenu);
  }

  openOptionsModal() {
    this.mobileOptionsQuery.matches && !this.optionsModal.open && this.optionsModal.showModal();
  }

  closeOptionsModal() {
    this.optionsModal.open && this.optionsModal.close();
  }

  isHistoryOpen() {
    return this.historyPanel.classList.contains("show");
  }

  setHistoryPanelOpen(isOpen: boolean) {
    this.historyPanel.classList.toggle("show", isOpen);
    this.historyPanel.setAttribute("aria-hidden", String(!isOpen));
  }

  setStartButtonsDisabled(isDisabled: boolean) {
    this.startButtons.forEach((button) => {
      button.disabled = isDisabled;
    });
  }

  focusStartButton() {
    this.startBtn.focus();
  }

  private renderBoard(state: GameState) {
    this.tiles.forEach((tile, index) => {
      const value = state.board[index];
      const isWinner = state.winningCombination?.includes(index) || false;

      value
        ? (tile.dataset.value = value, tile.setAttribute("aria-label", value))
        : (delete tile.dataset.value, tile.removeAttribute("aria-label"));

      tile.classList.toggle("filled", Boolean(value));
      tile.classList.toggle("circle", value === "circle");
      tile.classList.toggle("cross", value === "cross");
      tile.classList.toggle("winner", isWinner);
    });

    this.setWinnerColor(state);
    this.setWinningLine(state.winningCombination);
  }

  private renderScore(state: GameState) {
    this.player1Result.textContent = String(state.score.circle);
    this.player2Result.textContent = String(state.score.cross);
    this.playerNameElements.circle.textContent = state.playerNames.circle;
    this.playerNameElements.cross.textContent = state.playerNames.cross;
  }

  private renderStatus(state: GameState) {
    this.roundStatus.classList.toggle(
      "winner",
      Boolean(state.roundWinner && state.roundWinner !== "draw"),
    );

    this.roundStatus.textContent = !state.gameStarted
      ? "Start game"
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

    this.roundMeta.textContent = state.gameStarted
      ? `${mode} | ${difficulty} | started: ${starterName}`
      : "";
  }

  private renderActivePlayer(state: GameState) {
    this.player1.classList.toggle(
      "active",
      state.current === "circle" && !state.gameOver && state.gameStarted,
    );
    this.player2.classList.toggle(
      "active",
      state.current === "cross" && !state.gameOver && state.gameStarted,
    );
  }

  private renderHistory(state: GameState) {
    const rounds = state.history.length;
    const draws = state.history.filter((round) => round.winner === "draw").length;
    const circleWins = state.history.filter((round) => round.winner === "circle").length;
    const crossWins = state.history.filter((round) => round.winner === "cross").length;

    this.statRounds.textContent = `${rounds} ${rounds === 1 ? "round" : "rounds"}`;
    this.statDraws.textContent = `${draws} ${draws === 1 ? "draw" : "draws"}`;
    this.statCircleWins.textContent = `O ${circleWins} ${circleWins === 1 ? "win" : "wins"}`;
    this.statCrossWins.textContent = `X ${crossWins} ${crossWins === 1 ? "win" : "wins"}`;
    this.statCircleRate.textContent = `O ${this.getWinRate(circleWins, rounds)}%`;
    this.statCrossRate.textContent = `X ${this.getWinRate(crossWins, rounds)}%`;
    this.historyList.innerHTML = state.history
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
            )} started</small>
          </li>
        `;
      })
      .join("");
  }

  private renderOptions(state: GameState) {
    this.difficultyButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.difficulty === state.aiDifficulty);
    });

    this.starterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.starter === state.starter);
    });

    this.muteToggleBtn.textContent = state.muted ? "sound off" : "sound on";
    this.circleColorInput.value = state.markerColors.circle;
    this.crossColorInput.value = state.markerColors.cross;
    this.circleColorInput.parentElement?.style.setProperty(
      "--swatch-color",
      state.markerColors.circle,
    );
    this.crossColorInput.parentElement?.style.setProperty("--swatch-color", state.markerColors.cross);
    document.documentElement.style.setProperty("--circle-color", state.markerColors.circle);
    document.documentElement.style.setProperty("--cross-color", state.markerColors.cross);
  }

  private setNewRoundVisible(isVisible: boolean) {
    this.resetBtn.classList.toggle("show", isVisible);
    this.mobileResetBtn.classList.toggle("show", isVisible);
  }

  private updateSettingsToggle(gameStarted: boolean) {
    this.settingsToggle.hidden = !gameStarted || !this.mobileOptionsQuery.matches;
  }

  private setWinningLine(combination: number[] | null) {
    this.winLine.className = "";

    if (!combination) return;

    const index = WINS.findIndex((win) => win.every((tile, i) => tile === combination[i]));
    if (index < 0) return;

    this.winLine.classList.add("show", `line-${index}`);
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
}
