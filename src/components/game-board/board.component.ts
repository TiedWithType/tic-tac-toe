import html from "./board.component.html?raw";
import css from "./board.component.css?raw";
import { Component, defineDynamicComponent } from "../component.utils";
import { WINS } from "../../core/constants";
import type { GameState } from "../../core/types";

export class BoardComponent extends Component {
  private tileElements: HTMLElement[] | null = null;

  onTileClick(handler: (index: number) => void) {
    this.tiles.forEach((tile, index) => {
      tile.addEventListener("click", () => handler(index));
      tile.addEventListener("keydown", (event) => this.handleTileKeydown(event, index, handler));
    });
  }

  render(state: GameState) {
    this.tiles.forEach((tile, index) => {
      const value = state.board[index];
      const isWinner = state.winningCombination?.includes(index) || false;
      const currentValue = tile.dataset.value || null;

      if (value && currentValue !== value) {
        tile.dataset.value = value;
        tile.setAttribute("aria-label", value);
      } else if (!value && currentValue !== null) {
        delete tile.dataset.value;
        tile.setAttribute("aria-label", `empty tile ${index + 1}`);
      } else if (!value) {
        tile.setAttribute("aria-label", `empty tile ${index + 1}`);
      }

      tile.classList.toggle("filled", Boolean(value));
      tile.classList.toggle("circle", value === "circle");
      tile.classList.toggle("cross", value === "cross");
      tile.classList.toggle("winner", isWinner);
      tile.setAttribute("aria-disabled", String(state.gameOver || Boolean(value)));
    });

    this.setWinningLine(state.winningCombination);
  }

  private get tiles() {
    this.tileElements ||= [...this.root.querySelectorAll<HTMLElement>("[data-tile]")];

    return this.tileElements;
  }

  private get winLine() {
    return this.root.querySelector<HTMLElement>("#win_line")!;
  }

  private setWinningLine(combination: number[] | null) {
    this.winLine.className = "";

    if (!combination) return;

    const index = WINS.findIndex((win) => win.every((tile, i) => tile === combination[i]));
    if (index >= 0) {
      this.winLine.classList.add("show", `line-${index}`);
    }
  }

  private handleTileKeydown(
    event: KeyboardEvent,
    index: number,
    handler: (index: number) => void,
  ) {
    const nextIndexByKey: Partial<Record<string, number>> = {
      ArrowUp: index - 3,
      ArrowDown: index + 3,
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
    };

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler(index);
      return;
    }

    const nextIndex = nextIndexByKey[event.key];
    if (nextIndex === undefined || nextIndex < 0 || nextIndex >= this.tiles.length) return;
    if (event.key === "ArrowLeft" && index % 3 === 0) return;
    if (event.key === "ArrowRight" && index % 3 === 2) return;

    event.preventDefault();
    this.tiles[nextIndex].focus();
  }
}

defineDynamicComponent({
  selector: "tic-board",
  component: BoardComponent,
  html,
  css,
});

