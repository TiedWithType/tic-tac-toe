import type { AiDifficulty, GameMode, MatchMode, Starter } from "../core/types";
import { SettingsService } from "../services/settings.service";
import { $, $$ } from "../ui/dom";

type StartMenuOptions = {
  onStart: (mode: GameMode) => void;
};

export class StartMenu {
  private startBtn = $<HTMLButtonElement>("#start_game");
  private modeButtons = $$<HTMLButtonElement>("[data-mode-option]");
  private difficultyButtons = $$<HTMLButtonElement>("[data-difficulty]");
  private starterButtons = $$<HTMLButtonElement>("[data-starter]");
  private matchButtons = $$<HTMLButtonElement>("[data-match-mode]");
  private abortController = new AbortController();
  private gameMode: GameMode = "user-user";
  private aiDifficulty: AiDifficulty = "normal";
  private starter: Starter = "circle";
  private matchMode: MatchMode = "casual";

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
    [this.startBtn, ...this.modeButtons].forEach((button) => {
      button.disabled = isLoading;
    });
  }

  private bindEvents() {
    const { signal } = this.abortController;

    this.startBtn.addEventListener(
      "click",
      () => {
        this.saveSettings();
        this.options.onStart(this.gameMode);
      },
      { signal },
    );

    this.modeButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.gameMode = button.dataset.modeOption as GameMode;
          this.saveSettings();
          this.render();
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

    this.matchButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const matchMode = button.dataset.matchMode;

          SettingsService.isMatchMode(matchMode) && (this.matchMode = matchMode);
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
    SettingsService.isGameMode(settings.gameMode) && (this.gameMode = settings.gameMode);
    SettingsService.isStarter(settings.starter) && (this.starter = settings.starter);
    SettingsService.isMatchMode(settings.matchMode) && (this.matchMode = settings.matchMode);

    const { circle, cross } = settings.markerColors ?? {};

    SettingsService.isHexColor(circle) &&
      document.documentElement.style.setProperty("--circle-color", circle);
    SettingsService.isHexColor(cross) &&
      document.documentElement.style.setProperty("--cross-color", cross);
  }

  private saveSettings() {
    const currentSettings = this.storage.load();
    const nextSettings = {
      ...currentSettings,
      gameMode: this.gameMode,
      aiDifficulty: this.aiDifficulty,
      starter: this.starter,
      matchMode: this.matchMode,
    };

    this.storage.save(nextSettings);
  }

  private render() {
    document.body.dataset.aiDifficulty = this.aiDifficulty;
    document.body.dataset.gameMode = this.gameMode;

    this.modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.modeOption === this.gameMode);
    });
    this.difficultyButtons.forEach((button) => {
      button.disabled = this.gameMode === "user-user";
      button.classList.toggle("active", button.dataset.difficulty === this.aiDifficulty);
    });

    this.starterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.starter === this.starter);
    });
    this.matchButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.matchMode === this.matchMode);
    });
  }
}
