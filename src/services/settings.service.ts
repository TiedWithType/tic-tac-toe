import { SETTINGS_KEY, SETTINGS_SCHEMA_VERSION } from "../core/constants";
import type { AiDifficulty, GameMode, MatchMode, SettingsSnapshot, Starter } from "../core/types";

export class SettingsService {
  load() {
    try {
      const rawSettings = localStorage.getItem(SETTINGS_KEY);

      return rawSettings ? this.migrate(JSON.parse(rawSettings) as SettingsSnapshot) : {};
    } catch {
      localStorage.removeItem(SETTINGS_KEY);
      return {};
    }
  }

  save(settings: SettingsSnapshot) {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        ...settings,
        settingsSchemaVersion: SETTINGS_SCHEMA_VERSION,
      }),
    );
  }

  reset() {
    localStorage.removeItem(SETTINGS_KEY);
  }

  static isGameMode(value: unknown): value is GameMode {
    return value === "user-user" || value === "user-ai" || value === "ai-ai";
  }

  static isDifficulty(value: unknown): value is AiDifficulty {
    return value === "easy" || value === "normal" || value === "hard";
  }

  static isStarter(value: unknown): value is Starter {
    return value === "circle" || value === "cross" || value === "random";
  }

  static isMatchMode(value: unknown): value is MatchMode {
    return value === "casual" || value === "best-of-5" || value === "first-to-5";
  }

  static isHexColor(value: unknown): value is string {
    return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
  }

  private migrate(settings: SettingsSnapshot) {
    const nextSettings = { ...settings };

    nextSettings.settingsSchemaVersion ||= SETTINGS_SCHEMA_VERSION;
    nextSettings.matchMode = SettingsService.isMatchMode(settings.matchMode)
      ? settings.matchMode
      : settings.matchTarget === 5
        ? "first-to-5"
        : "casual";
    delete nextSettings.matchTarget;

    return nextSettings;
  }
}
