import type { AiDifficulty, BoardValue, Player } from "../core/types";
import { GameEngine } from "./GameEngine";

export class AiPlayer {
  getMove(board: BoardValue[], aiPlayer: Player, difficulty: AiDifficulty) {
    const nextBoard = [...board];

    if (difficulty === "easy") {
      const shouldThink = Math.random() < 0.3;
      return shouldThink ? this.getTacticalMove(nextBoard, aiPlayer) : this.getRandomMove(nextBoard);
    }

    if (difficulty === "normal") {
      const tacticalMove = this.getTacticalMove(nextBoard, aiPlayer);
      if (tacticalMove !== null) return tacticalMove;

      const shouldPlayBest = Math.random() < 0.55;
      return shouldPlayBest ? this.getBestMove(nextBoard, aiPlayer) : this.getRandomMove(nextBoard);
    }

    return this.getBestMove(nextBoard, aiPlayer);
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

    if (bestMoves.length === 0) return null;

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  private getTacticalMove(board: BoardValue[], aiPlayer: Player) {
    const winningMove = this.findImmediateMove(board, aiPlayer);
    if (winningMove !== null) return winningMove;

    const blockingMove = this.findImmediateMove(board, GameEngine.getOpponent(aiPlayer));
    if (blockingMove !== null) return blockingMove;

    return this.getRandomMove(board);
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

    if (availableMoves.length === 0) return null;

    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
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

    if (isMaximizing) {
      let bestScore = -Infinity;

      GameEngine.getAvailableMoves(board).forEach((move) => {
        board[move] = aiPlayer;
        bestScore = Math.max(bestScore, this.minimax(board, false, aiPlayer, opponent, depth + 1));
        board[move] = null;
      });

      return bestScore;
    }

    let bestScore = Infinity;

    GameEngine.getAvailableMoves(board).forEach((move) => {
      board[move] = opponent;
      bestScore = Math.min(bestScore, this.minimax(board, true, aiPlayer, opponent, depth + 1));
      board[move] = null;
    });

    return bestScore;
  }
}
