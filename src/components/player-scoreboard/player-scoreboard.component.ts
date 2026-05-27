import html from "./player-scoreboard.component.html?raw";
import css from "./player-scoreboard.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";
import type { GameState, Player } from "../../core/types";

export class PlayerScoreboardComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }

  get playerNameElements() {
    return {
      circle: this.getPlayerRefs("circle").name,
      cross: this.getPlayerRefs("cross").name,
    };
  }

  render(state: GameState) {
    this.renderPlayer("circle", state);
    this.renderPlayer("cross", state);
  }

  private renderPlayer(player: Player, state: GameState) {
    const refs = this.getPlayerRefs(player);

    refs.result.textContent = String(state.score[player]);
    refs.name.textContent = state.playerNames[player];
    refs.element.classList.toggle(
      "active",
      state.current === player && !state.gameOver && state.gameStarted,
    );
  }

  private getPlayerRefs(player: Player) {
    const selector = player === "circle" ? "#player_1" : "#player_2";
    const element = this.root.querySelector<HTMLElement>(selector)!;

    return {
      element,
      name: element.querySelector<HTMLElement>(".player-name")!,
      result: element.querySelector<HTMLElement>(".result")!,
    };
  }
}

defineComponent("tic-player-scoreboard", PlayerScoreboardComponent);

