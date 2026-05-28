import { SETTINGS_KEY, SETTINGS_SCHEMA_VERSION } from "../core/constants";
import type { AiDifficulty, GameMode, MatchMode, SettingsSnapshot, Starter } from "../core/types";

const SETTINGS_KEYS = [
  "settingsSchemaVersion",
  "playerNames",
  "playerNamesByMode",
  "markerColors",
  "gameMode",
  "aiDifficulty",
  "starter",
  "matchMode",
  "muted",
] as const satisfies readonly (keyof SettingsSnapshot)[];

type SettingsKey = (typeof SETTINGS_KEYS)[number];

export class SettingsService {
  load() {
    try {
      const splitSettings = this.loadSplitSettings();
      if (SettingsService.hasSettings(splitSettings)) {
        return this.migrate(splitSettings);
      }

      const legacySettings = this.loadLegacySettings();
      if (!legacySettings) return {};

      const migratedSettings = this.migrate(legacySettings);

      this.save(migratedSettings);

      return migratedSettings;
    } catch {
      this.reset();
      return {};
    }
  }

  save(settings: SettingsSnapshot) {
    const nextSettings = {
      ...settings,
      settingsSchemaVersion: SETTINGS_SCHEMA_VERSION,
    };

    SETTINGS_KEYS.forEach((key) => {
      const value = nextSettings[key];
      const storageKey = SettingsService.getStorageKey(key);

      value === undefined
        ? localStorage.removeItem(storageKey)
        : localStorage.setItem(storageKey, JSON.stringify(value));
    });
    localStorage.removeItem(SETTINGS_KEY);
  }

  reset() {
    localStorage.removeItem(SETTINGS_KEY);
    SETTINGS_KEYS.forEach((key) => localStorage.removeItem(SettingsService.getStorageKey(key)));
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

  private static getStorageKey(key: SettingsKey) {
    return `${SETTINGS_KEY}:${key}`;
  }

  private static hasSettings(settings: SettingsSnapshot) {
    return Object.keys(settings).length > 0;
  }

  private loadSplitSettings() {
    return SETTINGS_KEYS.reduce<SettingsSnapshot>((settings, key) => {
      const storageKey = SettingsService.getStorageKey(key);
      const rawValue = localStorage.getItem(storageKey);
      if (rawValue === null) return settings;

      try {
        return {
          ...settings,
          [key]: JSON.parse(rawValue),
        } as SettingsSnapshot;
      } catch {
        localStorage.removeItem(storageKey);
        return settings;
      }
    }, {});
  }

  private loadLegacySettings() {
    const rawSettings = localStorage.getItem(SETTINGS_KEY);

    return rawSettings ? (JSON.parse(rawSettings) as SettingsSnapshot) : null;
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
