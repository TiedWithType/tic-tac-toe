import html from "./material-icon.component.html?raw";
import css from "./material-icon.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";

export class MaterialIconComponent extends Component {
  private static fontUrl = "/fonts/material-symbols-rounded.woff2";
  private static fontLoading = false;

  connectedCallback() {
    MaterialIconComponent.loadMaterialSymbols();
    this.setAttribute("aria-hidden", "true");
    super.connectedCallback();
  }

  private static loadMaterialSymbols() {
    if (
      MaterialIconComponent.fontLoading ||
      document.querySelector("style[data-material-symbols-rounded]")
    ) {
      return;
    }

    MaterialIconComponent.fontLoading = true;

    const style = document.createElement("style");
    style.dataset.materialSymbolsRounded = "true";
    style.textContent = `
      @font-face {
        font-family: "Material Symbols Rounded";
        font-style: normal;
        font-weight: 500;
        font-display: block;
        src: url("${MaterialIconComponent.fontUrl}") format("woff2");
      }
    `;

    document.head.append(style);
  }
}

defineDynamicComponent({
  selector: "material-icon",
  component: MaterialIconComponent,
  html,
  css,
});
