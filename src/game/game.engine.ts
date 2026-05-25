import { WINS } from "../core/constants";
import type { BoardValue, GameMode, Player, Starter } from "../core/types";

const MODE_LABELS = {
  "user-user": "player vs player",
  "user-ai": "user vs ai",
  "ai-ai": "ai vs ai",
} satisfies Record<GameMode, string>;

export class GameEngine {
  static getWinner(board: BoardValue[]) {
    for (const combination of WINS) {
      const [a, b, c] = combination;

      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          winner: board[a],
          combination,
        };
      }
    }

    return null;
  }

  static getBoardWinner(board: BoardValue[]) {
    return GameEngine.getWinner(board)?.winner ?? null;
  }

  static getAvailableMoves(board: BoardValue[]) {
    return board
      .map((value, index) => (value ? null : index))
      .filter((index): index is number => index !== null);
  }

  static isBoardFull(board: BoardValue[]) {
    return board.every(Boolean);
  }

  static getOpponent(player: Player): Player {
    return player === "circle" ? "cross" : "circle";
  }

  static getNextStarter(starter: Starter): Player {
    return starter === "random" ? (Math.random() < 0.5 ? "circle" : "cross") : starter;
  }

  static getModeLabel(mode: GameMode) {
    return MODE_LABELS[mode];
  }
}
