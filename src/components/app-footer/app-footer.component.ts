import html from "./app-footer.component.html?raw";
import css from "./app-footer.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class AppFooterComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }
}

defineComponent("tic-app-footer", AppFooterComponent);

