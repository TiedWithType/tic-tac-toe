import "./components/register";
import { StartMenu } from "./bootstrap/start.menu";
import type { GameMode } from "./core/types";
import { SettingsService } from "./services/settings.service";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let isRuntimeLoading = false;
let runtimePreload: ReturnType<typeof loadRuntimeModules> | null = null;

installButtonRipples();

const startMenu = new StartMenu({
  onStart: (mode) => {
    void loadGameRuntime(mode);
  },
});

startMenu.init();
preloadRuntime();

async function loadGameRuntime(mode: GameMode) {
  if (isRuntimeLoading) return;

  isRuntimeLoading = true;
  startMenu.setLoading(true);

  try {
    const audioContext = createAudioContext();
    const [{ GameController }, { GameStore }, { AiPlayer }, { AudioService }, { GameView }] =
      await (runtimePreload || loadRuntimeModules());

    startMenu.destroy();

    const controller = new GameController(
      new GameView(),
      new AiPlayer(),
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
    import("./game/ai.player"),
    import("./services/audio.service"),
    import("./ui/game.view"),
  ]);
}

function preloadRuntime() {
  const schedulePreload = () => {
    runtimePreload ||= loadRuntimeModules();
  };
  const idleCallback = window.requestIdleCallback || ((callback: IdleRequestCallback) => {
    window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 1);
    return 0;
  });

  idleCallback(schedulePreload, { timeout: 1200 });
}

function createAudioContext() {
  const audioWindow = window as AudioWindow;
  const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  const audioContext = new AudioContextConstructor();
  audioContext.state === "suspended" && void audioContext.resume();

  return audioContext;
}

function installButtonRipples() {
  document.addEventListener("pointerdown", (event) => {
    const button = event
      .composedPath()
      .find((target): target is HTMLButtonElement => target instanceof HTMLButtonElement);

    if (!button || button.disabled) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement("span");

    ripple.className = "button-ripple";
    ripple.style.inlineSize = `${size}px`;
    ripple.style.blockSize = `${size}px`;
    ripple.style.insetInlineStart = `${event.clientX - rect.left}px`;
    ripple.style.insetBlockStart = `${event.clientY - rect.top}px`;

    button.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
}
