import type { AiDifficulty, AppConfig, GameMode, Starter } from "../core/types";
import { AppConfigService } from "../services/AppConfigService";
import { SettingsStorage } from "../services/SettingsStorage";

type StartMenuOptions = {
  onStart: (mode: GameMode) => void;
};

export class StartMenu {
  private appTitle = document.querySelector<HTMLHeadingElement>("#app_title")!;
  private appFooter = document.querySelector<HTMLElement>("#app_footer")!;
  private startButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-mode]")];
  private difficultyButtons = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-difficulty]"),
  ];
  private starterButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-starter]")];
  private abortController = new AbortController();
  private config: AppConfig;
  private aiDifficulty: AiDifficulty = "normal";
  private starter: Starter = "circle";

  constructor(
    private options: StartMenuOptions,
    configService = new AppConfigService(),
    private storage = new SettingsStorage(),
  ) {
    this.config = configService.getConfig();
  }

  init() {
    this.renderConfig();
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

  private renderConfig() {
    const { major, minor, patch, codename } = this.config.version;
    const codenameLabel = codename ? ` "${codename}"` : "";

    this.appTitle.textContent = this.config.appName;
    this.appFooter.textContent = `v.${major}.${minor}.${patch}${codenameLabel} by TiedWithType`;
  }

  private loadSettings() {
    const settings = this.storage.load();

    if (SettingsStorage.isDifficulty(settings.aiDifficulty)) {
      this.aiDifficulty = settings.aiDifficulty;
    }

    if (SettingsStorage.isStarter(settings.starter)) {
      this.starter = settings.starter;
    }

    if (settings.markerColors) {
      const { circle, cross } = settings.markerColors;

      if (SettingsStorage.isHexColor(circle)) {
        document.documentElement.style.setProperty("--circle-color", circle);
      }

      if (SettingsStorage.isHexColor(cross)) {
        document.documentElement.style.setProperty("--cross-color", cross);
      }
    }
  }

  private saveSettings(gameMode?: GameMode) {
    const currentSettings = this.storage.load();
    const nextSettings = {
      ...currentSettings,
      aiDifficulty: this.aiDifficulty,
      starter: this.starter,
    };

    if (gameMode) {
      nextSettings.gameMode = gameMode;
    }

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
