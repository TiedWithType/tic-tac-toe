import html from "./player-scoreboard.component.html?raw";
import css from "./player-scoreboard.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class PlayerScoreboardComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }
}

defineComponent("tic-player-scoreboard", PlayerScoreboardComponent);

