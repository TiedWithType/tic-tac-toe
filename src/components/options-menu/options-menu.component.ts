import html from "./options-menu.component.html?raw";
import css from "./options-menu.component.css?raw";
import { defineComponent, renderComponent } from "../component.utils";
import type { GameState, Player } from "../../core/types";

export class OptionsMenuComponent extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });

  connectedCallback() {
    if (this.root.childElementCount) return;

    renderComponent(this.root, html, css);
  }

  onHistoryToggle(handler: () => void) {
    this.button("#history_toggle").addEventListener("click", handler);
  }

  onMuteToggle(handler: () => void) {
    this.button("#mute_toggle").addEventListener("click", handler);
  }

  onMarkerColorChange(handler: (player: Player, color: string) => void) {
    this.colorInput("circle").addEventListener("input", () =>
      handler("circle", this.colorInput("circle").value),
    );
    this.colorInput("cross").addEventListener("input", () =>
      handler("cross", this.colorInput("cross").value),
    );
  }

  onRoundReset(handler: () => void) {
    this.button("#reset").addEventListener("click", handler);
  }

  onFullReset(handler: () => void) {
    this.button("#reset_game").addEventListener("click", handler);
  }

  syncPlacement() {
    this.menu.parentElement !== this.modal && this.modal.append(this.menu);
  }

  openModal() {
    !this.modal.open && this.modal.showModal();
  }

  closeModal() {
    this.modal.open && this.modal.close();
  }

  isModalOpen() {
    return this.modal.open;
  }

  containsTarget(target: EventTarget) {
    return target instanceof Node && (target === this.menu || this.menu.contains(target));
  }

  render(state: GameState) {
    this.setIconButton(this.button("#mute_toggle"), state.muted ? "volume_off" : "volume_up", "sound");
    this.colorInput("circle").value = state.markerColors.circle;
    this.colorInput("cross").value = state.markerColors.cross;
    this.colorInput("circle").parentElement?.style.setProperty(
      "--swatch-color",
      state.markerColors.circle,
    );
    this.colorInput("cross").parentElement?.style.setProperty(
      "--swatch-color",
      state.markerColors.cross,
    );

    const matchComplete = state.match.status === "complete";
    const desktopVisible = state.gameStarted && state.gameOver && !matchComplete;

    this.setIconButton(this.button("#reset"), "restart_alt", "new round");
    this.button("#reset").classList.toggle("show", desktopVisible);
  }

  private get menu() {
    return this.root.querySelector<HTMLElement>("#options_menu")!;
  }

  private get modal() {
    return this.root.querySelector<HTMLDialogElement>("#options_modal")!;
  }

  private colorInput(player: Player) {
    return this.root.querySelector<HTMLInputElement>(`#${player}_color`)!;
  }

  private button(selector: string) {
    return this.root.querySelector<HTMLButtonElement>(selector)!;
  }

  private setIconButton(button: HTMLButtonElement, icon: string, label: string) {
    button.querySelector<HTMLElement>(".material-symbols-rounded")!.textContent = icon;
    button.querySelector<HTMLElement>("span:last-child")!.textContent = label;
  }
}

defineComponent("tic-options-menu", OptionsMenuComponent);

