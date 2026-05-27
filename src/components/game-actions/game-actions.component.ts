import html from "./game-actions.component.html?raw";
import css from "./game-actions.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";
import type { GameState } from "../../core/types";

export class GameActionsComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }

  onSettingsToggle(handler: () => void) {
    this.settingsToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      handler();
    });
  }

  onRoundReset(handler: () => void) {
    this.mobileReset.addEventListener("click", () => {
      !this.matchComplete && handler();
    });
  }

  onFullReset(handler: () => void) {
    this.mobileReset.addEventListener("click", () => {
      this.matchComplete && handler();
    });
  }

  render(state: GameState) {
    const matchComplete = state.match.status === "complete";
    const mobileVisible = state.gameStarted && state.gameOver;
    this.matchComplete = matchComplete;

    this.mobileReset.textContent = matchComplete ? "main menu" : "new round";
    this.mobileReset.classList.toggle("show", mobileVisible);
    this.settingsToggle.hidden = !state.gameStarted;
  }

  containsSettingsToggle(target: EventTarget) {
    return (
      target instanceof Node &&
      (target === this.settingsToggle || this.settingsToggle.contains(target))
    );
  }

  private matchComplete = false;

  private get mobileReset() {
    return this.root.querySelector<HTMLButtonElement>("#mobile_reset")!;
  }

  private get settingsToggle() {
    return this.root.querySelector<HTMLButtonElement>("#settings_toggle")!;
  }
}

defineComponent("tic-game-actions", GameActionsComponent);

