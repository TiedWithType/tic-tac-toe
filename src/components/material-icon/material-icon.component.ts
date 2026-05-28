import html from "./material-icon.component.html?raw";
import css from "./material-icon.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";

const MATERIAL_SYMBOLS_FONT = "/fonts/material-symbols-rounded.woff2";

let materialSymbolsLoading = false;

export class MaterialIconComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    loadMaterialSymbols();
    this.setAttribute("aria-hidden", "true");
    renderComponent(this.root, html, css);
  }
}

defineComponent("material-icon", MaterialIconComponent);

function loadMaterialSymbols() {
  if (materialSymbolsLoading || document.querySelector("style[data-material-symbols-rounded]")) {
    return;
  }

  materialSymbolsLoading = true;

  const style = document.createElement("style");
  style.dataset.materialSymbolsRounded = "true";
  style.textContent = `
    @font-face {
      font-family: "Material Symbols Rounded";
      font-style: normal;
      font-weight: 500;
      font-display: block;
      src: url("${MATERIAL_SYMBOLS_FONT}") format("woff2");
    }
  `;

  document.head.append(style);
}
