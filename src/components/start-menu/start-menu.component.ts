import html from "./start-menu.component.html?raw";
import css from "./start-menu.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";
import type { ButtonRippleComponent } from "../button-ripple/button-ripple.component";
import type { AiDifficulty, GameMode, GameState, MatchMode, Starter } from "../../core/types";
import { SettingsService } from "../../services/settings.service";

type StartMenuState = Pick<GameState, "aiDifficulty" | "gameMode" | "matchMode" | "starter">;

type StartMenuEventDetail = {
  "start-game": { mode: GameMode };
  "game-mode-change": { mode: GameMode };
  "difficulty-change": { difficulty: AiDifficulty };
  "starter-change": { starter: Starter };
  "match-mode-change": { matchMode: MatchMode };
};

export class StartMenuComponent extends Component {
  private abortController: AbortController | null = null;
  private storage = new SettingsService();
  private gameMode: GameMode = "user-user";
  private aiDifficulty: AiDifficulty = "normal";
  private starter: Starter = "circle";
  private matchMode: MatchMode = "casual";

  connectedCallback() {
    super.connectedCallback();

    if (this.abortController) return;

    this.abortController = new AbortController();
    this.loadSettings();
    this.bindEvents();
    this.render(this.state);
  }

  disconnectedCallback() {
    this.abortController?.abort();
    this.abortController = null;
  }

  onStart(handler: (mode: GameMode) => void, signal?: AbortSignal) {
    this.on("start-game", ({ mode }) => handler(mode), signal);
  }

  onGameModeChange(handler: (mode: GameMode) => void, signal?: AbortSignal) {
    this.on("game-mode-change", ({ mode }) => handler(mode), signal);
  }

  onDifficultyChange(handler: (difficulty: AiDifficulty) => void, signal?: AbortSignal) {
    this.on("difficulty-change", ({ difficulty }) => handler(difficulty), signal);
  }

  onStarterChange(handler: (starter: Starter) => void, signal?: AbortSignal) {
    this.on("starter-change", ({ starter }) => handler(starter), signal);
  }

  onMatchModeChange(handler: (matchMode: MatchMode) => void, signal?: AbortSignal) {
    this.on("match-mode-change", ({ matchMode }) => handler(matchMode), signal);
  }

  setLoading(isLoading: boolean) {
    this.startButton.disabled = isLoading;
  }

  focusStartButton() {
    this.startButton.focus();
  }

  render(state: StartMenuState = this.state) {
    this.gameMode = state.gameMode;
    this.aiDifficulty = state.aiDifficulty;
    this.starter = state.starter;
    this.matchMode = state.matchMode;

    document.body.dataset.aiDifficulty = state.aiDifficulty;
    document.body.dataset.gameMode = state.gameMode;

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

  private get state(): StartMenuState {
    return {
      aiDifficulty: this.aiDifficulty,
      gameMode: this.gameMode,
      matchMode: this.matchMode,
      starter: this.starter,
    };
  }

  private bindEvents() {
    const signal = this.abortController?.signal;

    this.startButton.addEventListener(
      "click",
      () => {
        this.startGame();
      },
      { signal },
    );

    this.modeButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.setGameMode(button.dataset.modeOption as GameMode);
        },
        { signal },
      );
    });

    this.difficultyButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.setAiDifficulty(button.dataset.difficulty as AiDifficulty);
        },
        { signal },
      );
    });

    this.starterButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.setStarter(button.dataset.starter as Starter);
        },
        { signal },
      );
    });

    this.matchButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const matchMode = button.dataset.matchMode;

          if (!SettingsService.isMatchMode(matchMode)) return;

          this.setMatchMode(matchMode);
        },
        { signal },
      );
    });
  }

  private loadSettings() {
    const settings = this.storage.load();

    SettingsService.isDifficulty(settings.aiDifficulty) &&
      (this.aiDifficulty = settings.aiDifficulty);
    SettingsService.isGameMode(settings.gameMode) && (this.gameMode = settings.gameMode);
    SettingsService.isStarter(settings.starter) && (this.starter = settings.starter);
    SettingsService.isMatchMode(settings.matchMode) && (this.matchMode = settings.matchMode);

    const { circle, cross } = settings.markerColors ?? {};

    SettingsService.isHexColor(circle) &&
      document.documentElement.style.setProperty("--circle-color", circle);
    SettingsService.isHexColor(cross) &&
      document.documentElement.style.setProperty("--cross-color", cross);
  }

  private startGame() {
    this.saveSettings();
    this.emit("start-game", { mode: this.gameMode });
  }

  private setGameMode(gameMode: GameMode) {
    this.gameMode = gameMode;
    this.render();
    this.saveSettings();
    this.emit("game-mode-change", { mode: this.gameMode });
  }

  private setAiDifficulty(aiDifficulty: AiDifficulty) {
    this.aiDifficulty = aiDifficulty;
    this.render();
    this.saveSettings();
    this.emit("difficulty-change", { difficulty: this.aiDifficulty });
  }

  private setStarter(starter: Starter) {
    this.starter = starter;
    this.render();
    this.saveSettings();
    this.emit("starter-change", { starter: this.starter });
  }

  private setMatchMode(matchMode: MatchMode) {
    this.matchMode = matchMode;
    this.render();
    this.saveSettings();
    this.emit("match-mode-change", { matchMode });
  }

  private saveSettings() {
    const currentSettings = this.storage.load();

    this.storage.save({
      ...currentSettings,
      gameMode: this.gameMode,
      aiDifficulty: this.aiDifficulty,
      starter: this.starter,
      matchMode: this.matchMode,
    });
  }

  private on<EventName extends keyof StartMenuEventDetail>(
    eventName: EventName,
    handler: (detail: StartMenuEventDetail[EventName]) => void,
    signal?: AbortSignal,
  ) {
    this.addEventListener(
      eventName,
      ((event: CustomEvent<StartMenuEventDetail[EventName]>) => handler(event.detail)) as EventListener,
      { signal },
    );
  }

  private emit<EventName extends keyof StartMenuEventDetail>(
    eventName: EventName,
    detail: StartMenuEventDetail[EventName],
  ) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
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

