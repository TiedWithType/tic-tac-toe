import { StartMenu } from "./bootstrap/StartMenu";
import type { GameMode } from "./core/types";
import { AppConfigService } from "./services/AppConfigService";
import { SettingsStorage } from "./services/SettingsStorage";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let isRuntimeLoading = false;

const startMenu = new StartMenu({
  onStart: (mode) => {
    void loadGameRuntime(mode);
  },
});

startMenu.init();

async function loadGameRuntime(mode: GameMode) {
  if (isRuntimeLoading) return;

  isRuntimeLoading = true;
  startMenu.setLoading(true);

  try {
    const audioContext = createAudioContext();
    const [{ GameController }, { AiPlayer }, { AudioService }, { GameView }] = await Promise.all([
      import("./core/GameController"),
      import("./game/AiPlayer"),
      import("./services/AudioService"),
      import("./ui/GameView"),
    ]);

    startMenu.destroy();

    const controller = new GameController(
      new GameView(),
      new AiPlayer(),
      new AudioService(audioContext),
      new SettingsStorage(),
      new AppConfigService(),
    );

    controller.init({ autoStartMode: mode });
  } catch (error) {
    console.error("Failed to load game runtime", error);
    isRuntimeLoading = false;
    startMenu.setLoading(false);
  }
}

function createAudioContext() {
  const audioWindow = window as AudioWindow;
  const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  const audioContext = new AudioContextConstructor();
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}
