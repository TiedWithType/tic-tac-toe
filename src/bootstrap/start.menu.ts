import type { AiDifficulty, GameMode, Starter } from "../core/types";
import { SettingsService } from "../services/settings.service";

type StartMenuOptions = {
  onStart: (mode: GameMode) => void;
};

export class StartMenu {
  private startButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-mode]")];
  private difficultyButtons = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-difficulty]"),
  ];
  private starterButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-starter]")];
  private abortController = new AbortController();
  private aiDifficulty: AiDifficulty = "normal";
  private starter: Starter = "circle";

  constructor(
    private options: StartMenuOptions,
    private storage = new SettingsService(),
  ) {}

  init() {
    this.loadSettings();
    this.bindEvents();
    this.render();
  }

  destroy() {
    this.abortController.abort();
  }

  setLoading(isLoading: boolean) {
    this.startButtons.forEach((button) => {
      button.disabled = isLoading;
    });
  }

  private bindEvents() {
    const { signal } = this.abortController;

    this.startButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const mode = button.dataset.mode as GameMode;

          this.saveSettings(mode);
          this.options.onStart(mode);
        },
        { signal },
      );
    });

    this.difficultyButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.aiDifficulty = button.dataset.difficulty as AiDifficulty;
          this.saveSettings();
          this.render();
        },
        { signal },
      );
    });

    this.starterButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.starter = button.dataset.starter as Starter;
          this.saveSettings();
          this.render();
        },
        { signal },
      );
    });
  }

  private loadSettings() {
    const settings = this.storage.load();

    SettingsService.isDifficulty(settings.aiDifficulty) &&
      (this.aiDifficulty = settings.aiDifficulty);
    SettingsService.isStarter(settings.starter) && (this.starter = settings.starter);

    const { circle, cross } = settings.markerColors ?? {};

    SettingsService.isHexColor(circle) &&
      document.documentElement.style.setProperty("--circle-color", circle);
    SettingsService.isHexColor(cross) &&
      document.documentElement.style.setProperty("--cross-color", cross);
  }

  private saveSettings(gameMode?: GameMode) {
    const currentSettings = this.storage.load();
    const nextSettings = {
      ...currentSettings,
      aiDifficulty: this.aiDifficulty,
      starter: this.starter,
      ...(gameMode ? { gameMode } : {}),
    };

    this.storage.save(nextSettings);
  }

  private render() {
    document.body.dataset.aiDifficulty = this.aiDifficulty;

    this.difficultyButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.difficulty === this.aiDifficulty);
    });

    this.starterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.starter === this.starter);
    });
  }
}
