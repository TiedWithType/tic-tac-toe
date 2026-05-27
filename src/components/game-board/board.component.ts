import html from "./board.component.html?raw";
import css from "./board.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class BoardComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }

  get tiles() {
    return [...this.root.querySelectorAll<HTMLElement>("[data-tile]")];
  }

  get winLine() {
    return this.root.querySelector<HTMLElement>("#win_line")!;
  }
}

defineComponent("tic-board", BoardComponent);

