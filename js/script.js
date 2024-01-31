document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  const size = 4;
  let board = [];
  let currentScore = 0;
  const currentScoreElement = document.getElementById("current-score");

  // Get the high score from local storage or set it to 0 if not found
  let bestScore = localStorage.getItem("2048-best-score") || 0;
  const bestScoreElement = document.getElementById("best-score");
  bestScoreElement.textContent = bestScore;

  const gameOverElement = document.getElementById("game-over");

  // Update score
  function updateScore(value) {
    currentScore += value;
    currentScoreElement.textContent = currentScore;
    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestScoreElement.textContent = bestScore;
      localStorage.setItem("2048-best-score", bestScore);
    }
  }

  // Restart game
  function restartGame() {
    currentScore = 0;
    currentScoreElement.textContent = "0";
    gameOverElement.style.display = "none";
    startGame();
  }

  // Start game
  function startGame() {
    board = [...Array(size)].map((e) => Array(size).fill(0));
    spawnTiles();
    spawnTiles();
    renderBoard();
  }

  // Render board
  function renderBoard() {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const tile = document.querySelector(
          `[data-row="${i}"][data-col="${j}"]`
        );
        const prevValue = tile.dataset.value;
        const currentValue = board[i][j];
        if (currentValue !== 0) {
          tile.dataset.value = currentValue;
          tile.textContent = currentValue;
          // Handle animation
          if (
            currentValue !== parseInt(prevValue) &&
            !tile.classList.contains("new-tile")
          ) {
            tile.classList.add("merged-tile");
          }
        } else {
          tile.textContent = "";
          delete tile.dataset.value;
          tile.classList.remove("merged-tile", "new-tile");
        }
      }
    }

    // Clean up animation
    setTimeout(() => {
      const cells = document.querySelectorAll(".grid-tile");
      cells.forEach((tile) => {
        tile.classList.remove("merged-tile", "new-tile");
      });
    }, 300);
  }

  // Spawn tiles randomly
  function spawnTiles() {
    const available = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 0) {
          available.push({ x: i, y: j });
        }
      }
    }

    if (available.length > 0) {
      const randomCell =
        available[Math.floor(Math.random() * available.length)];
      board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
      const tile = document.querySelector(
        `[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`
      );
      tile.classList.add("new-tile"); // Animation for new tiles
    }
  }

  // Move the tiles based on arrow key input
  function move(direction) {
    let hasChanged = false;
    if (direction === "ArrowUp" || direction === "ArrowDown") {
      for (let j = 0; j < size; j++) {
        const column = [...Array(size)].map((_, i) => board[i][j]);
        const newColumn = transform(column, direction === "ArrowUp");
        for (let i = 0; i < size; i++) {
          if (board[i][j] !== newColumn[i]) {
            hasChanged = true;
            board[i][j] = newColumn[i];
          }
        }
      }
    } else if (direction === "ArrowLeft" || direction === "ArrowRight") {
      for (let i = 0; i < size; i++) {
        const row = board[i];
        const newRow = transform(row, direction === "ArrowLeft");
        if (row.join(",") !== newRow.join(",")) {
          hasChanged = true;
          board[i] = newRow;
        }
      }
    }
    if (hasChanged) {
      spawnTiles();
      renderBoard();
      checkGameOver();
    }
  }

  // Transform a line (row or column) based on move direction
  function transform(line, moveTowardsStart) {
    let newLine = line.filter((tile) => tile !== 0);
    if (!moveTowardsStart) {
      newLine.reverse();
    }
    for (let i = 0; i < newLine.length - 1; i++) {
      if (newLine[i] === newLine[i + 1]) {
        newLine[i] *= 2;
        updateScore(newLine[i]); // Update score when tiles merged
        newLine.splice(i + 1, 1);
      }
    }
    while (newLine.length < size) {
      newLine.push(0);
    }
    if (!moveTowardsStart) {
      newLine.reverse();
    }
    return newLine;
  }

  // Check game over
  function checkGameOver() {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === 0) {
          return; // There is an empty tile, so game not over
        }
        if (j < size - 1 && board[i][j] === board[i][j + 1]) {
          return; // There are horizontally adjacent equal cells, so a move is possible
        }
        if (i < size - 1 && board[i][j] === board[i + 1][j]) {
          return; // There are vertically adjacent equal cells, so a move is possible
        }
      }
    }

    // If we reach here, no moves are possible
    gameOverElement.style.display = "flex";
  }

  // Event listeners
  document.addEventListener("keydown", (event) => {
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      move(event.key);
    }
  });
  document.getElementById("restart-btn").addEventListener("click", restartGame);

  startGame();
});
