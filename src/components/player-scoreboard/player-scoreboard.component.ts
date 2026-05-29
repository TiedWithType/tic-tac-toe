import html from "./player-scoreboard.component.html?raw";
import css from "./player-scoreboard.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";
import { DEFAULT_PLAYER_NAMES_BY_MODE } from "../../core/constants";
import type { GameState, Player } from "../../core/types";

const DEFAULT_SCOREBOARD_NAMES = DEFAULT_PLAYER_NAMES_BY_MODE["user-user"];

export class PlayerScoreboardComponent extends Component {
  private circleName = DEFAULT_SCOREBOARD_NAMES.circle;
  private circleScore = 0;
  private circleMarker = "O";
  private crossName = DEFAULT_SCOREBOARD_NAMES.cross;
  private crossScore = 0;
  private crossMarker = "X";

  get playerNameElements() {
    return {
      circle: this.getPlayerRefs("circle").name,
      cross: this.getPlayerRefs("cross").name,
    };
  }

  render(state: GameState) {
    this.setTemplateProperties({
      circleName: state.playerNames.circle,
      circleScore: state.score.circle,
      crossName: state.playerNames.cross,
      crossScore: state.score.cross,
    });
    this.updatePlayerState("circle", state);
    this.updatePlayerState("cross", state);
  }

  private updatePlayerState(player: Player, state: GameState) {
    const refs = this.getPlayerRefs(player);

    refs.element.classList.toggle(
      "active",
      state.current === player && !state.gameOver && state.gameStarted,
    );
  }

  private getPlayerRefs(player: Player) {
    const selector = player === "circle" ? "#player_1" : "#player_2";
    const element = this.root.querySelector<HTMLElement>(selector)!;

    return {
      element,
      name: element.querySelector<HTMLElement>(".player-name")!,
    };
  }
}

defineDynamicComponent({
  selector: "tic-player-scoreboard",
  component: PlayerScoreboardComponent,
  html,
  css,
});

