import "../game-actions/game-actions.component";
import "../game-board/board.component";
import "../player-scoreboard/player-scoreboard.component";
import html from "./game-shell.component.html?raw";
import css from "./game-shell.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";
import { PLAYERS } from "../../core/constants";
import type { GameState, MatchMode, MatchWinner } from "../../core/types";
import { GameEngine } from "../../game/game.engine";

export class GameShellComponent extends Component {
  render(state: GameState) {
    const game = this.root.querySelector<HTMLElement>("#game")! as HTMLElement & {
      inert: boolean;
    };

    game.inert = !state.gameStarted;
    this.renderStatus(state);
    this.renderMeta(state);
  }

  private renderStatus(state: GameState) {
    const status = this.root.querySelector<HTMLElement>("#round_status")!;

    status.classList.toggle(
      "winner",
      Boolean(state.roundWinner && state.roundWinner !== "draw"),
    );

    status.textContent = !state.gameStarted
      ? "Start game"
      : state.match.status === "complete"
        ? this.getMatchWinnerLabel(state.match.winner, state)
        : state.roundWinner === "draw"
          ? "draw"
          : state.roundWinner
            ? `${state.playerNames[state.roundWinner]} wins`
            : this.isAiTurn(state)
              ? `${state.playerNames[state.current]} is thinking`
              : `${state.playerNames[state.current]}'s turn`;
  }

  private renderMeta(state: GameState) {
    const meta = this.root.querySelector<HTMLElement>("#round_meta")!;
    const mode = GameEngine.getModeLabel(state.gameMode);
    const difficulty = state.gameMode === "user-user" ? "no AI" : state.aiDifficulty;
    const starterName = state.playerNames[state.roundStarter];
    const matchLabel = this.getMatchLabel(state);
    const matchPoint = this.isMatchPoint(state) ? " | match point" : "";

    meta.textContent = state.gameStarted
      ? `${mode} | ${difficulty} | ${matchLabel} | started: ${starterName}${matchPoint}`
      : "";
  }

  private isAiTurn(state: GameState) {
    return (
      state.gameStarted &&
      !state.gameOver &&
      (state.gameMode === "ai-ai" || (state.gameMode === "user-ai" && state.current === "cross"))
    );
  }

  private isMatchPoint(state: GameState) {
    if (state.matchMode === "casual" || state.roundWinner) return false;

    if (state.matchMode === "first-to-5") {
      return PLAYERS.some((player) => state.score[player] === 4);
    }

    return this.getBestOfRound(state) === 5 || PLAYERS.some((player) => state.score[player] === 2);
  }

  private getMatchWinnerLabel(winner: MatchWinner, state: GameState) {
    return winner === "draw" ? "match draw" : `${state.playerNames[winner]} wins match`;
  }

  private getMatchLabel(state: GameState) {
    if (state.matchMode === "casual") return "casual";
    if (state.matchMode === "first-to-5") return "race to 5";

    return `best of 5 | round ${this.getBestOfRound(state)}/5`;
  }

  private getBestOfRound(state: GameState) {
    const playedRounds = state.history.length;

    return Math.min(state.gameOver ? playedRounds : playedRounds + 1, 5);
  }
}

defineDynamicComponent({
  selector: "tic-game-shell",
  component: GameShellComponent,
  html,
  css,
});

