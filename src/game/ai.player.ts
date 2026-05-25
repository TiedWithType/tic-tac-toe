import type { AiDifficulty, BoardValue, Player } from "../core/types";
import { GameEngine } from "./game.engine";

export class AiPlayer {
  getMove(board: BoardValue[], aiPlayer: Player, difficulty: AiDifficulty) {
    const nextBoard = [...board];
    const strategies: Record<AiDifficulty, () => number | null> = {
      easy: () =>
        Math.random() < 0.3
          ? this.getTacticalMove(nextBoard, aiPlayer)
          : this.getRandomMove(nextBoard),
      normal: () => {
        const tacticalMove = this.getTacticalMove(nextBoard, aiPlayer);

        return tacticalMove ?? (Math.random() < 0.55
          ? this.getBestMove(nextBoard, aiPlayer)
          : this.getRandomMove(nextBoard));
      },
      hard: () => this.getBestMove(nextBoard, aiPlayer),
    };

    return strategies[difficulty]();
  }

  private getBestMove(board: BoardValue[], aiPlayer: Player) {
    const opponent = GameEngine.getOpponent(aiPlayer);
    let bestScore = -Infinity;
    const bestMoves: number[] = [];

    GameEngine.getAvailableMoves(board).forEach((move) => {
      board[move] = aiPlayer;
      const score = this.minimax(board, false, aiPlayer, opponent, 0);
      board[move] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMoves.length = 0;
        bestMoves.push(move);
        return;
      }

      if (score === bestScore) {
        bestMoves.push(move);
      }
    });

    return bestMoves.length ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : null;
  }

  private getTacticalMove(board: BoardValue[], aiPlayer: Player) {
    const winningMove = this.findImmediateMove(board, aiPlayer);
    const blockingMove = this.findImmediateMove(board, GameEngine.getOpponent(aiPlayer));

    return winningMove ?? blockingMove ?? this.getRandomMove(board);
  }

  private findImmediateMove(board: BoardValue[], player: Player) {
    for (const move of GameEngine.getAvailableMoves(board)) {
      board[move] = player;
      const isWinningMove = GameEngine.getBoardWinner(board) === player;
      board[move] = null;

      if (isWinningMove) return move;
    }

    return null;
  }

  private getRandomMove(board: BoardValue[]) {
    const availableMoves = GameEngine.getAvailableMoves(board);

    return availableMoves.length
      ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
      : null;
  }

  private minimax(
    board: BoardValue[],
    isMaximizing: boolean,
    aiPlayer: Player,
    opponent: Player,
    depth: number,
  ): number {
    const winner = GameEngine.getBoardWinner(board);

    if (winner === aiPlayer) return 10 - depth;
    if (winner === opponent) return depth - 10;
    if (GameEngine.getAvailableMoves(board).length === 0) return 0;

    const currentPlayer = isMaximizing ? aiPlayer : opponent;
    const nextIsMaximizing = !isMaximizing;
    const initialScore = isMaximizing ? -Infinity : Infinity;

    return GameEngine.getAvailableMoves(board).reduce((bestScore, move) => {
      board[move] = currentPlayer;
      const score = this.minimax(board, nextIsMaximizing, aiPlayer, opponent, depth + 1);
      board[move] = null;

      return isMaximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
    }, initialScore);
  }
}
