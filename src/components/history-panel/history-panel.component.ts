import html from "./history-panel.component.html?raw";
import css from "./history-panel.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class HistoryPanelComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }
}

defineComponent("tic-history-panel", HistoryPanelComponent);

