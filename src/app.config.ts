import type { AppConfig } from "./core/types";

export const appConfig = {
  appName: "Tic Tac Toe",
  version: {
    major: 2,
    minor: 0,
    patch: 0,
    release: "beta",
    codename: "Donut",
  },
  defaultPlayers: {
    circle: "player 1",
    cross: "player 2",
  },
} satisfies AppConfig;
