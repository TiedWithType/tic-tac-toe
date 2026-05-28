import "./components/register";
import type { StartMenuComponent } from "./components/start-menu/start-menu.component";
import type { GameMode } from "./core/types";
import { SettingsService } from "./services/settings.service";
import { $, appRoot } from "./ui/dom";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let isRuntimeLoading = false;

const startMenu = $<StartMenuComponent>("tic-start-menu", appRoot());

startMenu.onStart((mode) => {
  void loadGameRuntime(mode);
});

async function loadGameRuntime(mode: GameMode) {
  if (isRuntimeLoading) return;

  isRuntimeLoading = true;
  startMenu.setLoading(true);

  try {
    const audioContext = createAudioContext();
    const [{ GameController }, { GameStore }, { AudioService }, { GameView }] =
      await loadRuntimeModules();

    const controller = new GameController(
      new GameView(),
      createAiPlayerLoader(),
      new AudioService(audioContext),
      new SettingsService(),
      new GameStore(),
    );

    controller.init({ autoStartMode: mode });
  } catch (error) {
    console.error("Failed to load game runtime", error);
    isRuntimeLoading = false;
    startMenu.setLoading(false);
  }
}

function loadRuntimeModules() {
  return Promise.all([
    import("./core/game.controller"),
    import("./core/game.store"),
    import("./services/audio.service"),
    import("./ui/game.view"),
  ]);
}

function createAiPlayerLoader() {
  let aiPlayerPromise: Promise<import("./game/ai.player").AiPlayer> | null = null;

  return () => {
    aiPlayerPromise ||= import("./game/ai.player").then(({ AiPlayer }) => new AiPlayer());

    return aiPlayerPromise;
  };
}

function createAudioContext() {
  const audioWindow = window as AudioWindow;
  const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  const audioContext = new AudioContextConstructor();
  audioContext.state === "suspended" && void audioContext.resume();

  return audioContext;
}
