import { GameController } from "./core/GameController";
import { AiPlayer } from "./game/AiPlayer";
import { AppConfigService } from "./services/AppConfigService";
import { AudioService } from "./services/AudioService";
import { SettingsStorage } from "./services/SettingsStorage";
import { GameView } from "./ui/GameView";

const controller = new GameController(
  new GameView(),
  new AiPlayer(),
  new AudioService(),
  new SettingsStorage(),
  new AppConfigService(),
);

controller.init();
