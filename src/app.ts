const tiles = document.querySelectorAll<HTMLElement>("[data-tile]");
const player1Result = document.querySelector<HTMLElement>("#player_1 .result")!;
const player2Result = document.querySelector<HTMLElement>("#player_2 .result")!;
const resetBtn = document.querySelector<HTMLButtonElement>("#reset")!;

let current = "circle";
let gameOver = false;

const score = {
  circle: 0,
  cross: 0,
};

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

[...tiles].forEach((tile) => {
  tile.addEventListener("click", () => {
    if (gameOver) return;
    if (tile.innerHTML.length > 0) return;

    tile.innerHTML = `
      <img src="assets/${current}.svg" data-value='${current}' alt="${current}" />
    `;

    const won = checkWinner();

    if (!won) {
      const isDraw = [...tiles].every((t) => t.innerHTML.length > 0);
      if (isDraw) {
        resetBtn.classList.add("show");
        gameOver = true;
      }
    }

    current = current === "circle" ? "cross" : "circle";
  });
});

resetBtn.addEventListener("click", () => {
  resetBtn.classList.remove("show");
  [...tiles].forEach((tile) => {
    tile.innerHTML = "";
    tile.classList.remove("winner");
  });

  current = "circle";
  gameOver = false;
});

function checkWinner() {
  const values = [...tiles].map((tile) => {
    const img = tile.querySelector("img");
    return img?.alt || null;
  });

  return wins.some((combination) => {
    const [a, b, c] = combination;

    if (values[a] && values[a] === values[b] && values[a] === values[c]) {
      gameOver = true;

      tiles[a].classList.add("winner");
      tiles[b].classList.add("winner");
      tiles[c].classList.add("winner");

      updateScore(values[a]);

      resetBtn.classList.add("show");
      return true;
    }

    return false;
  });
}

function updateScore(winner: string) {
  score[winner as keyof typeof score]++;

  player1Result.textContent = String(score.circle);
  player2Result.textContent = String(score.cross);
}
