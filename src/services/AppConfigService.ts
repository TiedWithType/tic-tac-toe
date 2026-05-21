import { appConfig } from "../app.config";
import type { AppConfig } from "../core/types";

export class AppConfigService {
  getConfig(): AppConfig {
    return appConfig;
  }
}
