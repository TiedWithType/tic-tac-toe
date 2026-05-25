import { SETTINGS_KEY } from "../core/constants";
import type { AiDifficulty, GameMode, SettingsSnapshot, Starter } from "../core/types";

export class SettingsService {
  load() {
    try {
      const rawSettings = localStorage.getItem(SETTINGS_KEY);

      return rawSettings ? (JSON.parse(rawSettings) as SettingsSnapshot) : {};
    } catch {
      localStorage.removeItem(SETTINGS_KEY);
      return {};
    }
  }

  save(settings: SettingsSnapshot) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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

  static isHexColor(value: unknown): value is string {
    return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
  }
}
