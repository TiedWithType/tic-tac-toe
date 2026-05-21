const tiles = document.querySelectorAll<HTMLElement>("[data-tile]");
const game = document.querySelector<HTMLElement>("#game")!;
const roundStatus = document.querySelector<HTMLElement>("#round_status")!;
const roundMeta = document.querySelector<HTMLElement>("#round_meta")!;
const player1 = document.querySelector<HTMLElement>("#player_1")!;
const player2 = document.querySelector<HTMLElement>("#player_2")!;
const player1Name = document.querySelector<HTMLElement>("#player_1 .player-name")!;
const player2Name = document.querySelector<HTMLElement>("#player_2 .player-name")!;
const player1Result = document.querySelector<HTMLElement>("#player_1 .result")!;
const player2Result = document.querySelector<HTMLElement>("#player_2 .result")!;
const resetBtn = document.querySelector<HTMLButtonElement>("#reset")!;
const mobileResetBtn = document.querySelector<HTMLButtonElement>("#mobile_reset")!;
const resetGameBtn = document.querySelector<HTMLButtonElement>("#reset_game")!;
const changeModeBtn = document.querySelector<HTMLButtonElement>("#change_mode")!;
const historyToggleBtn = document.querySelector<HTMLButtonElement>("#history_toggle")!;
const historyCloseBtn = document.querySelector<HTMLButtonElement>("#history_close")!;
const muteToggleBtn = document.querySelector<HTMLButtonElement>("#mute_toggle")!;
const optionsMenu = document.querySelector<HTMLElement>("#options_menu")!;
const desktopOptionsMount = document.querySelector<HTMLElement>("#desktop_options_mount")!;
const optionsModal = document.querySelector<HTMLDialogElement>("#options_modal")!;
const optionsCloseBtn = document.querySelector<HTMLButtonElement>("#options_close")!;
const settingsToggle = document.querySelector<HTMLButtonElement>("#settings_toggle")!;
const startBtn = document.querySelector<HTMLButtonElement>("#start_game")!;
const startButtons = document.querySelectorAll<HTMLButtonElement>("[data-mode]");
const difficultyButtons = document.querySelectorAll<HTMLButtonElement>("[data-difficulty]");
const starterButtons = document.querySelectorAll<HTMLButtonElement>("[data-starter]");
const winLine = document.querySelector<HTMLElement>("#win_line")!;
const historyPanel = document.querySelector<HTMLElement>("#history_panel")!;
const historyList = document.querySelector<HTMLOListElement>("#history_list")!;
const statRounds = document.querySelector<HTMLElement>("#stat_rounds")!;
const statDraws = document.querySelector<HTMLElement>("#stat_draws")!;
const statCircleWins = document.querySelector<HTMLElement>("#stat_circle_wins")!;
const statCrossWins = document.querySelector<HTMLElement>("#stat_cross_wins")!;
const statCircleRate = document.querySelector<HTMLElement>("#stat_circle_rate")!;
const statCrossRate = document.querySelector<HTMLElement>("#stat_cross_rate")!;
const appFooter = getOrCreateAppFooter();

type Player = "circle" | "cross";
type GameMode = "user-user" | "user-ai" | "ai-ai";
type AiDifficulty = "easy" | "normal" | "hard";
type BoardValue = Player | null;
type Starter = Player | "random";
type RoundRecord = {
  round: number;
  mode: GameMode;
  difficulty: AiDifficulty;
  starter: Player;
  winner: Player | "draw";
};
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
const LONG_PRESS_DELAY = 550;
const SETTINGS_KEY = "tic-tac-toe-settings-v1";
const mobileOptionsQuery = window.matchMedia("(max-width: 640px)");
const audioWindow = window as Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let current: Player = "circle";
let roundStarter: Player = "circle";
let gameOver = false;
let gameStarted = false;
let roundWinner: Player | "draw" | null = null;
let gameMode: GameMode = "user-user";
let aiDifficulty: AiDifficulty = "normal";
let starter: Starter = "circle";
let muted = false;
let aiMoveTimer: number | null = null;
let longPressTimer: number | null = null;
let audioContext: AudioContext | null = null;
const sessionHistory: RoundRecord[] = [];

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
loadSettings();
syncOptionsPlacement();
renderScore();
renderHistory();
setAiDifficulty(aiDifficulty);
setStarter(starter);
setMuted(muted);
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
    saveSettings();
  });
});

starterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setStarter(button.dataset.starter as Starter);
    saveSettings();
  });
});

changeModeBtn.addEventListener("click", () => {
  openModeSelector();
  closeOptionsModal();
});

historyToggleBtn.addEventListener("click", () => {
  setHistoryPanelOpen(!historyPanel.classList.contains("show"));
  closeOptionsModal();
});

historyCloseBtn.addEventListener("click", () => {
  setHistoryPanelOpen(false);
});

muteToggleBtn.addEventListener("click", () => {
  setMuted(!muted);
  saveSettings();
});

settingsToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  openOptionsModal();
});

mobileOptionsQuery.addEventListener("change", () => {
  syncOptionsPlacement();
  updateSettingsToggle();
});

document.addEventListener("click", (event) => {
  if (!optionsModal.open) return;
  if (!(event.target instanceof Node)) return;
  if (optionsMenu.contains(event.target)) return;

  closeOptionsModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  closeOptionsModal();
});

optionsCloseBtn.addEventListener("click", () => {
  closeOptionsModal();
});

resetBtn.addEventListener("click", resetRound);
mobileResetBtn.addEventListener("click", resetRound);

resetGameBtn.addEventListener("click", () => {
  cancelAiMove();
  clearBoard();
  setNewRoundVisible(false);

  score.circle = 0;
  score.cross = 0;
  current = getNextStarter();
  roundStarter = current;
  gameMode = "user-user";
  gameOver = false;
  gameStarted = false;
  roundWinner = null;
  sessionHistory.length = 0;

  renderScore();
  renderHistory();
  saveSettings();
  updateGameState();
  startBtn.focus();
  closeOptionsModal();
});

function startGame(mode: GameMode) {
  cancelAiMove();
  gameMode = mode;
  current = getNextStarter();
  roundStarter = current;
  gameStarted = true;
  gameOver = false;
  roundWinner = null;
  resumeAudio();
  saveSettings();
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
    setNewRoundVisible(true);
    gameOver = true;
    roundWinner = "draw";
    recordRound("draw");
    playDrawSound();
    updateGameState();
    return;
  }

  if (gameOver) return;

  playPlayerMoveSound(current);
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
      setWinningLine([a, b, c]);

      updateScore(values[a]);
      recordRound(values[a]);
      playWinSound();

      setNewRoundVisible(true);
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

function resetRound() {
  cancelAiMove();
  setNewRoundVisible(false);
  clearBoard();

  current = getNextStarter();
  roundStarter = current;
  gameOver = false;
  roundWinner = null;
  updateGameState();
  scheduleAiMove();
  closeOptionsModal();
}

function clearBoard() {
  [...tiles].forEach((tile) => {
    tile.innerHTML = "";
    tile.classList.remove("winner");
  });
  setWinningLine(null);
}

function updateGameState() {
  document.body.classList.toggle("game-started", gameStarted);
  (game as HTMLElement & { inert: boolean }).inert = !gameStarted;
  updateSettingsToggle();
  if (!gameStarted) closeOptionsModal();
  renderStatus();
  renderMeta();
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

function renderMeta() {
  if (!gameStarted) {
    roundMeta.textContent = "";
    return;
  }

  const mode = getModeLabel(gameMode);
  const difficulty = gameMode === "user-user" ? "no AI" : aiDifficulty;
  const starterName = playerNames[roundStarter];

  roundMeta.textContent = `${mode} | ${difficulty} | started: ${starterName}`;
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

function setStarter(nextStarter: Starter) {
  starter = nextStarter;

  starterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.starter === starter);
  });
}

function setMuted(nextMuted: boolean) {
  muted = nextMuted;
  muteToggleBtn.textContent = muted ? "sound off" : "sound on";

  if (!muted) resumeAudio();
}

function openModeSelector() {
  cancelAiMove();
  clearBoard();
  setNewRoundVisible(false);
  gameStarted = false;
  gameOver = false;
  roundWinner = null;
  current = getNextStarter();
  roundStarter = current;
  updateGameState();
}

function getNextStarter(): Player {
  if (starter === "random") {
    return Math.random() < 0.5 ? "circle" : "cross";
  }

  return starter;
}

function getModeLabel(mode: GameMode) {
  if (mode === "user-ai") return "user vs ai";
  if (mode === "ai-ai") return "ai vs ai";
  return "player vs player";
}

function recordRound(winner: Player | "draw") {
  sessionHistory.unshift({
    round: sessionHistory.length + 1,
    mode: gameMode,
    difficulty: aiDifficulty,
    starter: roundStarter,
    winner,
  });
  renderHistory();
}

function renderHistory() {
  const rounds = sessionHistory.length;
  const draws = sessionHistory.filter((round) => round.winner === "draw").length;
  const circleWins = sessionHistory.filter((round) => round.winner === "circle").length;
  const crossWins = sessionHistory.filter((round) => round.winner === "cross").length;

  statRounds.textContent = `${rounds} ${rounds === 1 ? "round" : "rounds"}`;
  statDraws.textContent = `${draws} ${draws === 1 ? "draw" : "draws"}`;
  statCircleWins.textContent = `O ${circleWins} ${circleWins === 1 ? "win" : "wins"}`;
  statCrossWins.textContent = `X ${crossWins} ${crossWins === 1 ? "win" : "wins"}`;
  statCircleRate.textContent = `O ${getWinRate(circleWins, rounds)}%`;
  statCrossRate.textContent = `X ${getWinRate(crossWins, rounds)}%`;
  historyList.innerHTML = sessionHistory
    .map((round) => {
      const winner =
        round.winner === "draw" ? "draw" : `${escapeHtml(playerNames[round.winner])} won`;

      return `
        <li>
          <span>#${round.round}</span>
          <strong>${winner}</strong>
          <small>${getModeLabel(round.mode)} | ${round.difficulty} | ${escapeHtml(playerNames[round.starter])} started</small>
        </li>
      `;
    })
    .join("");
}

function getWinRate(wins: number, rounds: number) {
  if (rounds === 0) return 0;
  return Math.round((wins / rounds) * 100);
}

function setHistoryPanelOpen(isOpen: boolean) {
  historyPanel.classList.toggle("show", isOpen);
  historyPanel.setAttribute("aria-hidden", String(!isOpen));
}

function setNewRoundVisible(isVisible: boolean) {
  resetBtn.classList.toggle("show", isVisible);
  mobileResetBtn.classList.toggle("show", isVisible);
}

function openOptionsModal() {
  if (!mobileOptionsQuery.matches) return;
  if (optionsModal.open) return;

  optionsModal.showModal();
}

function closeOptionsModal() {
  if (!optionsModal.open) return;

  optionsModal.close();
}

function syncOptionsPlacement() {
  if (mobileOptionsQuery.matches) {
    if (optionsMenu.parentElement !== optionsModal) {
      optionsModal.append(optionsMenu);
    }
    return;
  }

  closeOptionsModal();
  if (optionsMenu.parentElement !== desktopOptionsMount) {
    desktopOptionsMount.append(optionsMenu);
  }
}

function updateSettingsToggle() {
  settingsToggle.hidden = !gameStarted || !mobileOptionsQuery.matches;
}

function setWinningLine(combination: number[] | null) {
  winLine.className = "";

  if (!combination) return;

  const index = wins.findIndex((win) => win.every((tile, i) => tile === combination[i]));
  if (index < 0) return;

  winLine.classList.add("show", `line-${index}`);
}

function playPlayerMoveSound(player: Player) {
  if (player === "circle") {
    playCircleMoveSound();
    return;
  }

  playCrossMoveSound();
}

function playCircleMoveSound() {
  playTone(523, 0.06, 0.04);
  window.setTimeout(() => playTone(659, 0.05, 0.035), 45);
}

function playCrossMoveSound() {
  playTone(392, 0.06, 0.04);
  window.setTimeout(() => playTone(330, 0.06, 0.035), 55);
}

function playDrawSound() {
  playTone(330, 0.16, 0.05);
  window.setTimeout(() => playTone(330, 0.16, 0.045), 170);
  window.setTimeout(() => playTone(262, 0.24, 0.045), 360);
}

function playFanfareRoyal() {
  // Akord otwierający (C-dur)
  playTone(523, 0.25, 0.05); // C
  playTone(659, 0.25, 0.05); // E
  playTone(784, 0.25, 0.05); // G

  // Melodia
  window.setTimeout(() => playTone(880, 0.18, 0.05), 260); // A5
  window.setTimeout(() => playTone(988, 0.2, 0.05), 420); // B5
  window.setTimeout(() => playTone(1046, 0.22, 0.05), 600); // C6

  // Akord końcowy (C-dur wyżej)
  window.setTimeout(() => {
    playTone(1046, 0.35, 0.06); // C6
    playTone(1318, 0.35, 0.06); // E6
    playTone(1568, 0.35, 0.06); // G6
  }, 850);
}


function playWinSound() {
  playFanfareRoyal();
}

function playTone(frequency: number, duration: number, volume: number) {
  if (muted) return;

  const context = resumeAudio();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration);
}

function resumeAudio() {
  const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  audioContext ||= new AudioContextConstructor();
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function loadSettings() {
  try {
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    if (!rawSettings) return;

    const settings = JSON.parse(rawSettings) as Partial<{
      playerNames: Partial<Record<Player, string>>;
      gameMode: GameMode;
      aiDifficulty: AiDifficulty;
      starter: Starter;
      muted: boolean;
    }>;

    if (settings.playerNames) {
      (["circle", "cross"] as Player[]).forEach((player) => {
        const savedName = settings.playerNames?.[player];
        if (!savedName) return;

        playerNames[player] = normalizePlayerName(savedName) || playerNames[player];
        playerNameElements[player].textContent = playerNames[player];
      });
    }

    if (isGameMode(settings.gameMode)) gameMode = settings.gameMode;
    if (isDifficulty(settings.aiDifficulty)) aiDifficulty = settings.aiDifficulty;
    if (isStarter(settings.starter)) starter = settings.starter;
    if (typeof settings.muted === "boolean") muted = settings.muted;
  } catch {
    localStorage.removeItem(SETTINGS_KEY);
  }
}

function saveSettings() {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      playerNames,
      gameMode,
      aiDifficulty,
      starter,
      muted,
    }),
  );
}

function isGameMode(value: unknown): value is GameMode {
  return value === "user-user" || value === "user-ai" || value === "ai-ai";
}

function isDifficulty(value: unknown): value is AiDifficulty {
  return value === "easy" || value === "normal" || value === "hard";
}

function isStarter(value: unknown): value is Starter {
  return value === "circle" || value === "cross" || value === "random";
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
    clearLongPressTimer();
    startPlayerNameEdit(nameElement);
  });

  editTrigger.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;

    clearLongPressTimer();
    longPressTimer = window.setTimeout(() => {
      longPressTimer = null;
      startPlayerNameEdit(nameElement);
    }, LONG_PRESS_DELAY);
  });

  editTrigger.addEventListener("pointerup", clearLongPressTimer);
  editTrigger.addEventListener("pointerleave", clearLongPressTimer);
  editTrigger.addEventListener("pointercancel", clearLongPressTimer);

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
    renderMeta();
    renderHistory();
    saveSettings();
  });
}

function clearLongPressTimer() {
  if (longPressTimer === null) return;

  window.clearTimeout(longPressTimer);
  longPressTimer = null;
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

function escapeHtml(value: string) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}
