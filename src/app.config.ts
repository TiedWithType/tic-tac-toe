import type { AppConfig } from "./core/types";

export const appConfig = {
  appName: "Tic Tac Toe",
  version: {
    major: 2,
    minor: 1,
    patch: 1,
    release: "beta",
    codename: "Eclair",
  },
  defaultPlayers: {
    "user-user": {
      circle: "player 1",
      cross: "player 2",
    },
    "user-ai": {
      circle: "player 1",
      cross: "ai 1",
    },
    "ai-ai": {
      circle: "ai 1",
      cross: "ai 2",
    },
  },
} satisfies AppConfig;
