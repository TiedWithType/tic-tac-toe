import html from "./options-menu.component.html?raw";
import css from "./options-menu.component.css?raw";
import "../color-picker/color-picker.component";
import "../material-icon/material-icon.component";
import { DEFAULT_MARKER_COLORS } from "../../core/constants";
import { Component, defineDynamicComponent } from "../component.utils";
import type { ButtonRippleComponent } from "../button-ripple/button-ripple.component";
import type { GameState, Player } from "../../core/types";

type ColorPickerEventDetail = {
  player: Player;
  color: string;
};

export class OptionsMenuComponent extends Component {
  private readonly labels = {
    options: "Game options",
    markerColors: "Marker colors",
    circleColor: "Circle marker color",
    crossColor: "Cross marker color",
    reset: "new round",
    resetIcon: "restart_alt",
    history: "history",
    historyIcon: "history",
    sound: "sound",
    menu: "menu",
    menuIcon: "home",
    infoIcon: "info",
  };
  private muteIcon = "volume_up";
  private circleColor = DEFAULT_MARKER_COLORS.circle;
  private crossColor = DEFAULT_MARKER_COLORS.cross;

  onHistoryToggle(handler: () => void) {
    this.button("#history_toggle").addEventListener("click", handler);
  }

  onMuteToggle(handler: () => void) {
    this.button("#mute_toggle").addEventListener("click", handler);
  }

  onMarkerColorChange(handler: (player: Player, color: string) => void) {
    this.menu.addEventListener(
      "color-change",
      ((event: CustomEvent<ColorPickerEventDetail>) => {
        handler(event.detail.player, event.detail.color);
      }) as EventListener,
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
    this.setTemplateProperties({
      muteIcon: state.muted ? "volume_off" : "volume_up",
      circleColor: state.markerColors.circle,
      crossColor: state.markerColors.cross,
    });

    const matchComplete = state.match.status === "complete";
    const desktopVisible = state.gameStarted && state.gameOver && !matchComplete;

    this.button("#reset").classList.toggle("show", desktopVisible);
  }

  private get menu() {
    return this.root.querySelector<HTMLElement>("#options_menu")!;
  }

  private get modal() {
    return this.root.querySelector<HTMLDialogElement>("#options_modal")!;
  }

  private button(selector: string) {
    return this.root.querySelector<ButtonRippleComponent>(selector)!;
  }
}

defineDynamicComponent({
  selector: "tic-options-menu",
  component: OptionsMenuComponent,
  html,
  css,
});

