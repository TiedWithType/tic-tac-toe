import html from "./options-menu.component.html?raw";
import css from "./options-menu.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class OptionsMenuComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }
}

defineComponent("tic-options-menu", OptionsMenuComponent);

