import html from "./history-panel.component.html?raw";
import css from "./history-panel.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";
import type { ButtonRippleComponent } from "../button-ripple/button-ripple.component";
import type { GameState, MatchMode } from "../../core/types";
import { GameEngine } from "../../game/game.engine";

export class HistoryPanelComponent extends Component {
  private readonly labels = {
    history: "Session history",
    session: "session",
    close: "close",
    closeHistory: "Close history",
  };
  private roundsLabel = "0 rounds";
  private drawsLabel = "0 draws";
  private circleWinsLabel = "O 0 wins";
  private crossWinsLabel = "X 0 wins";
  private circleRateLabel = "O 0%";
  private crossRateLabel = "X 0%";

  onToggle(handler: () => void, signal?: AbortSignal) {
    this.root
      .querySelector<ButtonRippleComponent>("#history_toggle")
      ?.addEventListener("click", handler, { signal });
  }

  onClose(handler: () => void, signal?: AbortSignal) {
    this.root
      .querySelector<ButtonRippleComponent>("#history_close")!
      .addEventListener("click", handler, {
        signal,
      });
  }

  render(state: GameState) {
    const rounds = state.history.length;
    const draws = state.history.filter(
      (round) => round.winner === "draw",
    ).length;
    const circleWins = state.history.filter(
      (round) => round.winner === "circle",
    ).length;
    const crossWins = state.history.filter(
      (round) => round.winner === "cross",
    ).length;

    this.setTemplateProperties({
      roundsLabel: `${rounds} ${rounds === 1 ? "round" : "rounds"}`,
      drawsLabel: `${draws} ${draws === 1 ? "draw" : "draws"}`,
      circleWinsLabel: `O ${circleWins} ${circleWins === 1 ? "win" : "wins"}`,
      crossWinsLabel: `X ${crossWins} ${crossWins === 1 ? "win" : "wins"}`,
      circleRateLabel: `O ${this.getWinRate(circleWins, rounds)}%`,
      crossRateLabel: `X ${this.getWinRate(crossWins, rounds)}%`,
    });
    this.root.querySelector<HTMLOListElement>("#history_list")!.innerHTML =
      state.history
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

  isOpen() {
    return this.panel.classList.contains("show");
  }

  setOpen(isOpen: boolean) {
    this.panel.classList.toggle("show", isOpen);
    this.panel.setAttribute("aria-hidden", String(!isOpen));
  }

  private get panel() {
    return this.root.querySelector<HTMLElement>("#history_panel")!;
  }

  private getWinRate(wins: number, rounds: number) {
    return rounds === 0 ? 0 : Math.round((wins / rounds) * 100);
  }

  private getRoundMatchLabel(matchMode: MatchMode) {
    return matchMode === "casual"
      ? "casual"
      : matchMode === "first-to-5"
        ? "race to 5"
        : "best of 5";
  }

  private escapeHtml(value: string) {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
  }
}

defineDynamicComponent({
  selector: "tic-history-panel",
  component: HistoryPanelComponent,
  html,
  css,
});
