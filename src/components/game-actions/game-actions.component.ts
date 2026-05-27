import html from "./game-actions.component.html?raw";
import css from "./game-actions.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class GameActionsComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }
}

defineComponent("tic-game-actions", GameActionsComponent);

