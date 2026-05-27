import "../game-actions/game-actions.component";
import "../game-board/board.component";
import "../player-scoreboard/player-scoreboard.component";
import html from "./game-shell.component.html?raw";
import css from "./game-shell.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class GameShellComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }
}

defineComponent("tic-game-shell", GameShellComponent);

