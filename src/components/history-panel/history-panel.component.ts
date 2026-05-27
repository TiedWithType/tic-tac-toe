import html from "./history-panel.component.html?raw";
import css from "./history-panel.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";
import type { GameState, MatchMode } from "../../core/types";
import { GameEngine } from "../../game/game.engine";

export class HistoryPanelComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }

  onToggle(handler: () => void, signal?: AbortSignal) {
    this.root.querySelector<HTMLButtonElement>("#history_toggle")?.addEventListener(
      "click",
      handler,
      { signal },
    );
  }

  onClose(handler: () => void, signal?: AbortSignal) {
    this.root.querySelector<HTMLButtonElement>("#history_close")!.addEventListener("click", handler, {
      signal,
    });
  }

  render(state: GameState) {
    const rounds = state.history.length;
    const draws = state.history.filter((round) => round.winner === "draw").length;
    const circleWins = state.history.filter((round) => round.winner === "circle").length;
    const crossWins = state.history.filter((round) => round.winner === "cross").length;

    this.setText("#stat_rounds", `${rounds} ${rounds === 1 ? "round" : "rounds"}`);
    this.setText("#stat_draws", `${draws} ${draws === 1 ? "draw" : "draws"}`);
    this.setText("#stat_circle_wins", `O ${circleWins} ${circleWins === 1 ? "win" : "wins"}`);
    this.setText("#stat_cross_wins", `X ${crossWins} ${crossWins === 1 ? "win" : "wins"}`);
    this.setText("#stat_circle_rate", `O ${this.getWinRate(circleWins, rounds)}%`);
    this.setText("#stat_cross_rate", `X ${this.getWinRate(crossWins, rounds)}%`);
    this.root.querySelector<HTMLOListElement>("#history_list")!.innerHTML = state.history
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

  private setText(selector: string, value: string) {
    this.root.querySelector<HTMLElement>(selector)!.textContent = value;
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

defineComponent("tic-history-panel", HistoryPanelComponent);

