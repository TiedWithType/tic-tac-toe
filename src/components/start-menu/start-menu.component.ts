import html from "./start-menu.component.html?raw";
import css from "./start-menu.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";
import type { ButtonRippleComponent } from "../button-ripple/button-ripple.component";
import type { AiDifficulty, GameMode, GameState, MatchMode, Starter } from "../../core/types";
import { SettingsService } from "../../services/settings.service";

export class StartMenuComponent extends Component {
  onStart(handler: () => void, signal?: AbortSignal) {
    this.startButton.addEventListener("click", handler, { signal });
  }

  onGameModeChange(handler: (mode: GameMode) => void, signal?: AbortSignal) {
    this.modeButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => handler(button.dataset.modeOption as GameMode),
        { signal },
      );
    });
  }

  onDifficultyChange(handler: (difficulty: AiDifficulty) => void, signal?: AbortSignal) {
    this.difficultyButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => handler(button.dataset.difficulty as AiDifficulty),
        { signal },
      );
    });
  }

  onStarterChange(handler: (starter: Starter) => void, signal?: AbortSignal) {
    this.starterButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.starter as Starter), {
        signal,
      });
    });
  }

  onMatchModeChange(handler: (matchMode: MatchMode) => void, signal?: AbortSignal) {
    this.matchButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const matchMode = button.dataset.matchMode;

          SettingsService.isMatchMode(matchMode) && handler(matchMode);
        },
        { signal },
      );
    });
  }

  setLoading(isLoading: boolean) {
    this.startButton.disabled = isLoading;
  }

  focusStartButton() {
    this.startButton.focus();
  }

  render(state: Pick<GameState, "aiDifficulty" | "gameMode" | "matchMode" | "starter">) {
    this.modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.modeOption === state.gameMode);
    });
    this.difficultyButtons.forEach((button) => {
      button.disabled = state.gameMode === "user-user";
      button.classList.toggle("active", button.dataset.difficulty === state.aiDifficulty);
    });
    this.starterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.starter === state.starter);
    });
    this.matchButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.matchMode === state.matchMode);
    });
  }

  private get startButton() {
    return this.root.querySelector<ButtonRippleComponent>("#start_game")!;
  }

  private get modeButtons() {
    return [...this.root.querySelectorAll<ButtonRippleComponent>("[data-mode-option]")];
  }

  private get difficultyButtons() {
    return [...this.root.querySelectorAll<ButtonRippleComponent>("[data-difficulty]")];
  }

  private get starterButtons() {
    return [...this.root.querySelectorAll<ButtonRippleComponent>("[data-starter]")];
  }

  private get matchButtons() {
    return [...this.root.querySelectorAll<ButtonRippleComponent>("[data-match-mode]")];
  }
}

defineDynamicComponent({
  selector: "tic-start-menu",
  component: StartMenuComponent,
  html,
  css,
});

