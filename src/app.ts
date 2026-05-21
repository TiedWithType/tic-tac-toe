const tiles = document.querySelectorAll<HTMLElement>("[data-tile]");
const game = document.querySelector<HTMLElement>("#game")!;
const roundStatus = document.querySelector<HTMLElement>("#round_status")!;
const player1 = document.querySelector<HTMLElement>("#player_1")!;
const player2 = document.querySelector<HTMLElement>("#player_2")!;
const player1Name = document.querySelector<HTMLElement>("#player_1 .player-name")!;
const player2Name = document.querySelector<HTMLElement>("#player_2 .player-name")!;
const player1Result = document.querySelector<HTMLElement>("#player_1 .result")!;
const player2Result = document.querySelector<HTMLElement>("#player_2 .result")!;
const resetBtn = document.querySelector<HTMLButtonElement>("#reset")!;
const resetGameBtn = document.querySelector<HTMLButtonElement>("#reset_game")!;
const startBtn = document.querySelector<HTMLButtonElement>("#start_game")!;
const startButtons = document.querySelectorAll<HTMLButtonElement>("[data-mode]");
const difficultyButtons = document.querySelectorAll<HTMLButtonElement>("[data-difficulty]");
const appFooter = getOrCreateAppFooter();

type Player = "circle" | "cross";
type GameMode = "user-user" | "user-ai" | "ai-ai";
type AiDifficulty = "easy" | "normal" | "hard";
type BoardValue = Player | null;
type AppConfig = {
  appName: string;
  version: {
    major: number;
    minor: number;
    patch: number;
    release: string;
    codename: string;
  };
  defaultPlayers: Partial<Record<Player, string>>;
};

const MAX_PLAYER_NAME_LENGTH = 8;
const AI_MOVE_DELAY = 450;

let current: Player = "circle";
let gameOver = false;
let gameStarted = false;
let roundWinner: Player | "draw" | null = null;
let gameMode: GameMode = "user-user";
let aiDifficulty: AiDifficulty = "normal";
let aiMoveTimer: number | null = null;

const score = {
  circle: 0,
  cross: 0,
};
const playerNames = {
  circle: "player 1",
  cross: "player 2",
};
const playerNameElements = {
  circle: player1Name,
  cross: player2Name,
};
const appConfig = getAppConfig();

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

Object.entries(playerNameElements).forEach(([player, nameElement]) => {
  setupPlayerNameEditor(player as Player, nameElement);
});

applyAppConfig();
setAiDifficulty(aiDifficulty);
updateGameState();

[...tiles].forEach((tile) => {
  tile.addEventListener("click", () => {
    if (!gameStarted) return;
    if (gameOver) return;
    if (isAiTurn()) return;

    makeMove(tile, current);
  });
});

startButtons.forEach((button) => {
  button.addEventListener("click", () => {
    startGame(button.dataset.mode as GameMode);
  });
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setAiDifficulty(button.dataset.difficulty as AiDifficulty);
  });
});

resetBtn.addEventListener("click", () => {
  cancelAiMove();
  resetBtn.classList.remove("show");
  clearBoard();

  current = current === "circle" ? "cross" : "circle";
  gameOver = false;
  roundWinner = null;
  updateGameState();
  scheduleAiMove();
});

resetGameBtn.addEventListener("click", () => {
  cancelAiMove();
  clearBoard();
  resetBtn.classList.remove("show");

  score.circle = 0;
  score.cross = 0;
  current = "circle";
  gameMode = "user-user";
  gameOver = false;
  gameStarted = false;
  roundWinner = null;

  renderScore();
  updateGameState();
  startBtn.focus();
});

function startGame(mode: GameMode) {
  cancelAiMove();
  gameMode = mode;
  gameStarted = true;
  gameOver = false;
  roundWinner = null;
  updateGameState();
  scheduleAiMove();
}

function makeMove(tile: HTMLElement, player: Player) {
  if (tile.querySelector("img")) return;

  tile.innerHTML = `
    <img src="assets/${player}.svg" data-value="${player}" alt="${player}" />
  `;

  finishTurn();
}

function finishTurn() {
  const won = checkWinner();

  if (!won && isBoardFull()) {
    resetBtn.classList.add("show");
    gameOver = true;
    roundWinner = "draw";
    updateGameState();
    return;
  }

  if (gameOver) return;

  current = current === "circle" ? "cross" : "circle";
  updateGameState();
  scheduleAiMove();
}

function checkWinner() {
  const values = getBoardValues();

  return wins.some((combination) => {
    const [a, b, c] = combination;

    if (values[a] && values[a] === values[b] && values[a] === values[c]) {
      gameOver = true;
      roundWinner = values[a];

      tiles[a].classList.add("winner");
      tiles[b].classList.add("winner");
      tiles[c].classList.add("winner");

      updateScore(values[a]);

      resetBtn.classList.add("show");
      updateGameState();
      return true;
    }

    return false;
  });
}

function updateScore(winner: Player) {
  score[winner]++;

  renderScore();
}

function renderScore() {
  player1Result.textContent = String(score.circle);
  player2Result.textContent = String(score.cross);
}

function clearBoard() {
  [...tiles].forEach((tile) => {
    tile.innerHTML = "";
    tile.classList.remove("winner");
  });
}

function updateGameState() {
  document.body.classList.toggle("game-started", gameStarted);
  (game as HTMLElement & { inert: boolean }).inert = !gameStarted;
  renderStatus();
  updateActivePlayer();
}

function renderStatus() {
  if (!gameStarted) {
    roundStatus.textContent = "Start game";
    return;
  }

  if (roundWinner === "draw") {
    roundStatus.textContent = "draw";
    return;
  }

  if (roundWinner) {
    roundStatus.textContent = `${playerNames[roundWinner]} wins`;
    return;
  }

  if (isAiTurn()) {
    roundStatus.textContent = `${playerNames[current]} is thinking`;
    return;
  }

  roundStatus.textContent = `${playerNames[current]}'s turn`;
}

function updateActivePlayer() {
  player1.classList.toggle("active", current === "circle" && !gameOver && gameStarted);
  player2.classList.toggle("active", current === "cross" && !gameOver && gameStarted);
}

function isAiTurn() {
  if (!gameStarted || gameOver) return false;
  if (gameMode === "ai-ai") return true;
  return gameMode === "user-ai" && current === "cross";
}

function scheduleAiMove() {
  cancelAiMove();

  if (!isAiTurn()) return;

  aiMoveTimer = window.setTimeout(() => {
    aiMoveTimer = null;
    playAiMove();
  }, AI_MOVE_DELAY);
}

function cancelAiMove() {
  if (aiMoveTimer === null) return;

  window.clearTimeout(aiMoveTimer);
  aiMoveTimer = null;
}

function playAiMove() {
  if (!isAiTurn()) return;

  const moveIndex = getAiMove(current);
  if (moveIndex === null) return;

  makeMove(tiles[moveIndex], current);
}

function getAiMove(aiPlayer: Player) {
  const board = getBoardValues();

  if (aiDifficulty === "easy") {
    const shouldThink = Math.random() < 0.3;
    return shouldThink ? getTacticalMove(board, aiPlayer) : getRandomMove(board);
  }

  if (aiDifficulty === "normal") {
    const tacticalMove = getTacticalMove(board, aiPlayer);
    if (tacticalMove !== null) return tacticalMove;

    const shouldPlayBest = Math.random() < 0.55;
    return shouldPlayBest ? getBestMove(aiPlayer) : getRandomMove(board);
  }

  return getBestMove(aiPlayer);
}

function getBestMove(aiPlayer: Player) {
  const board = getBoardValues();
  const opponent = getOpponent(aiPlayer);
  let bestScore = -Infinity;
  const bestMoves: number[] = [];

  getAvailableMoves(board).forEach((move) => {
    board[move] = aiPlayer;
    const score = minimax(board, false, aiPlayer, opponent, 0);
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

function getTacticalMove(board: BoardValue[], aiPlayer: Player) {
  const winningMove = findImmediateMove(board, aiPlayer);
  if (winningMove !== null) return winningMove;

  const blockingMove = findImmediateMove(board, getOpponent(aiPlayer));
  if (blockingMove !== null) return blockingMove;

  return getRandomMove(board);
}

function findImmediateMove(board: BoardValue[], player: Player) {
  for (const move of getAvailableMoves(board)) {
    board[move] = player;
    const isWinningMove = getBoardWinner(board) === player;
    board[move] = null;

    if (isWinningMove) return move;
  }

  return null;
}

function getRandomMove(board: BoardValue[]) {
  const availableMoves = getAvailableMoves(board);

  if (availableMoves.length === 0) return null;

  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function minimax(
  board: BoardValue[],
  isMaximizing: boolean,
  aiPlayer: Player,
  opponent: Player,
  depth: number,
): number {
  const winner = getBoardWinner(board);

  if (winner === aiPlayer) return 10 - depth;
  if (winner === opponent) return depth - 10;
  if (getAvailableMoves(board).length === 0) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;

    getAvailableMoves(board).forEach((move) => {
      board[move] = aiPlayer;
      bestScore = Math.max(bestScore, minimax(board, false, aiPlayer, opponent, depth + 1));
      board[move] = null;
    });

    return bestScore;
  }

  let bestScore = Infinity;

  getAvailableMoves(board).forEach((move) => {
    board[move] = opponent;
    bestScore = Math.min(bestScore, minimax(board, true, aiPlayer, opponent, depth + 1));
    board[move] = null;
  });

  return bestScore;
}

function getBoardValues() {
  return [...tiles].map((tile) => {
    const img = tile.querySelector("img");
    return (img?.dataset.value as Player | undefined) || null;
  });
}

function getBoardWinner(board: BoardValue[]) {
  for (const combination of wins) {
    const [a, b, c] = combination;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function getAvailableMoves(board: BoardValue[]) {
  return board
    .map((value, index) => (value ? null : index))
    .filter((index): index is number => index !== null);
}

function isBoardFull() {
  return getBoardValues().every(Boolean);
}

function getOpponent(player: Player): Player {
  return player === "circle" ? "cross" : "circle";
}

function setAiDifficulty(difficulty: AiDifficulty) {
  aiDifficulty = difficulty;
  document.body.dataset.aiDifficulty = aiDifficulty;

  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === aiDifficulty);
  });
}

function getAppConfig(): AppConfig {
  const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;

  return {
    appName: env.VITE_APP_NAME || "Tic Tac Toe",
    version: {
      major: getEnvNumber(env.VITE_APP_VERSION_MAJOR, 1),
      minor: getEnvNumber(env.VITE_APP_VERSION_MINOR, 0),
      patch: getEnvNumber(env.VITE_APP_VERSION_PATCH, 0),
      release: env.VITE_APP_VERSION_RELEASE || "alpha",
      codename: env.VITE_APP_VERSION_CODENAME || "First Move",
    },
    defaultPlayers: {
      circle: env.VITE_DEFAULT_PLAYER_CIRCLE,
      cross: env.VITE_DEFAULT_PLAYER_CROSS,
    },
  };
}

function getOrCreateAppFooter() {
  const existingFooter = document.querySelector<HTMLElement>("#app_footer");
  if (existingFooter) return existingFooter;

  const footer = document.createElement("footer");
  footer.id = "app_footer";
  footer.textContent = 'Tic Tac Toe v1.0.0 alpha "First Move" by TiedWithType';
  document.body.append(footer);

  return footer;
}

function getEnvNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function applyAppConfig() {
  renderAppFooter(appConfig);
  applyDefaultPlayers(appConfig.defaultPlayers);
}

function renderAppFooter(config: AppConfig) {
  const { major, minor, patch, release, codename } = config.version;
  const version = `${major}.${minor}.${patch}`;
  const releaseLabel = release ? ` ${release}` : "";
  const codenameLabel = codename ? ` "${codename}"` : "";

  appFooter.textContent = `${config.appName} v${version}${releaseLabel}${codenameLabel} by TiedWithType`;
}

function applyDefaultPlayers(defaultPlayers: AppConfig["defaultPlayers"]) {
  if (!defaultPlayers) return;

  (["circle", "cross"] as Player[]).forEach((player) => {
    const defaultName = defaultPlayers[player];
    if (!defaultName) return;

    playerNames[player] = normalizePlayerName(defaultName) || playerNames[player];
    playerNameElements[player].textContent = playerNames[player];
  });

  renderStatus();
}

function setupPlayerNameEditor(player: Player, nameElement: HTMLElement) {
  const editTrigger = nameElement.parentElement || nameElement;

  editTrigger.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    startPlayerNameEdit(nameElement);
  });

  nameElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      nameElement.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      nameElement.textContent = playerNames[player];
      nameElement.blur();
      return;
    }

    const isSingleCharacter = event.key.length === 1;
    const hasSelection = getSelectionTextLength() > 0;
    const currentLength = nameElement.textContent?.length || 0;

    if (isSingleCharacter && !hasSelection && currentLength >= MAX_PLAYER_NAME_LENGTH) {
      event.preventDefault();
    }
  });

  nameElement.addEventListener("input", () => {
    limitPlayerNameInput(nameElement);
  });

  nameElement.addEventListener("blur", () => {
    const nextName = normalizePlayerName(nameElement.textContent || "");

    playerNames[player] = nextName || playerNames[player];
    nameElement.textContent = playerNames[player];
    nameElement.contentEditable = "false";
    nameElement.classList.remove("editing");
    renderStatus();
  });
}

function startPlayerNameEdit(nameElement: HTMLElement) {
  nameElement.contentEditable = "true";
  nameElement.classList.add("editing");
  nameElement.focus();
  selectText(nameElement);
}

function limitPlayerNameInput(nameElement: HTMLElement) {
  const currentName = nameElement.textContent || "";

  if (currentName.length <= MAX_PLAYER_NAME_LENGTH) return;

  nameElement.textContent = currentName.slice(0, MAX_PLAYER_NAME_LENGTH);
  moveCaretToEnd(nameElement);
}

function normalizePlayerName(name: string) {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_PLAYER_NAME_LENGTH);
}

function getSelectionTextLength() {
  return window.getSelection()?.toString().length || 0;
}

function selectText(element: HTMLElement) {
  const range = document.createRange();
  const selection = window.getSelection();

  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function moveCaretToEnd(element: HTMLElement) {
  const range = document.createRange();
  const selection = window.getSelection();

  range.selectNodeContents(element);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}
