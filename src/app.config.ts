import type { AppConfig } from "./core/types";

export const appConfig = {
  appName: "Tic Tac Toe",
  version: {
    major: 2,
    minor: 3,
    patch: 0,
    release: "beta",
    codename: "Gelato",
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
