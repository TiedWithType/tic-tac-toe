import html from "./start-menu.component.html?raw";
import css from "./start-menu.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class StartMenuComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }
}

defineComponent("tic-start-menu", StartMenuComponent);

