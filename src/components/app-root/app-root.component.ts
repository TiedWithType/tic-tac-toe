import "../app-footer/app-footer.component";
import "../game-shell/game-shell.component";
import "../history-panel/history-panel.component";
import "../options-menu/options-menu.component";
import "../start-menu/start-menu.component";
import html from "./app-root.component.html?raw";
import css from "./app-root.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

export class AppRootComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }
}

defineComponent("app-root", AppRootComponent);

