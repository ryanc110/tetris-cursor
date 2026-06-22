// --- 상수 ---
const COLS = 10;
const ROWS = 20;
const FALL_INTERVAL_MS = 800;
const SPAWN_ROW = 0;
const SPAWN_COL = 3;

const LINE_SCORES = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  T: [
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  Z: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  L: [
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

const PIECE_TYPES = Object.keys(SHAPES);

// --- DOM ---
const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const statusMessage = document.getElementById("status-message");

// --- 게임 상태 ---
let score = 0;
let isPlaying = false;
let board = createEmptyBoard();
let currentPiece = null;
let fallIntervalId = null;
let keyboardControlsRegistered = false;

// --- 보드 유틸 ---

function createEmptyRow() {
  return Array(COLS).fill(null);
}

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => createEmptyRow());
}

function isInsideBoard(row, col) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function isRowFull(row) {
  return board[row].every((cell) => cell !== null);
}

function clearBoardAndScore() {
  board = createEmptyBoard();
  score = 0;
  updateScoreDisplay();
}

// --- 블록 생성 ---

function createPiece(type) {
  const pieceType = type ?? PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];

  return {
    type: pieceType,
    shape: SHAPES[pieceType],
    row: SPAWN_ROW,
    col: SPAWN_COL,
  };
}

function forEachFilledCell(piece, callback) {
  for (let shapeRow = 0; shapeRow < piece.shape.length; shapeRow++) {
    for (let shapeCol = 0; shapeCol < piece.shape[shapeRow].length; shapeCol++) {
      if (!piece.shape[shapeRow][shapeCol]) {
        continue;
      }

      callback(shapeRow, shapeCol);
    }
  }
}

function rotateShape(shape) {
  const size = shape.length;
  const rotated = Array.from({ length: size }, () => Array(size).fill(0));

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      rotated[col][size - 1 - row] = shape[row][col];
    }
  }

  return rotated;
}

// --- 충돌 / 이동 ---

function canMove(piece, dx, dy, matrix) {
  if (!piece) {
    return false;
  }

  let canPlace = true;

  forEachFilledCell(piece, (shapeRow, shapeCol) => {
    const targetRow = piece.row + shapeRow + dy;
    const targetCol = piece.col + shapeCol + dx;

    if (!isInsideBoard(targetRow, targetCol) || matrix[targetRow][targetCol] !== null) {
      canPlace = false;
    }
  });

  return canPlace;
}

function movePiece(dx, dy) {
  if (!currentPiece || !canMove(currentPiece, dx, dy, board)) {
    return false;
  }

  currentPiece.col += dx;
  currentPiece.row += dy;
  return true;
}

function isGameActive() {
  return isPlaying && currentPiece;
}

function tryMoveAndRefresh(dx, dy) {
  if (movePiece(dx, dy)) {
    refreshDisplay();
  }
}

function tryRotate() {
  if (!isGameActive()) {
    return;
  }

  const rotatedShape = rotateShape(currentPiece.shape);
  const rotatedPiece = {
    type: currentPiece.type,
    shape: rotatedShape,
    row: currentPiece.row,
    col: currentPiece.col,
  };

  if (!canMove(rotatedPiece, 0, 0, board)) {
    return;
  }

  currentPiece.shape = rotatedShape;
  refreshDisplay();
}

// --- 고정 / 줄 삭제 / 점수 ---

function lockPiece() {
  if (!currentPiece) {
    return;
  }

  forEachFilledCell(currentPiece, (shapeRow, shapeCol) => {
    const boardRow = currentPiece.row + shapeRow;
    const boardCol = currentPiece.col + shapeCol;

    if (isInsideBoard(boardRow, boardCol)) {
      board[boardRow][boardCol] = currentPiece.type;
    }
  });
}

function clearLines() {
  const remainingRows = [];
  let linesCleared = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (isRowFull(row)) {
      linesCleared++;
    } else {
      remainingRows.unshift(board[row]);
    }
  }

  while (remainingRows.length < ROWS) {
    remainingRows.unshift(createEmptyRow());
  }

  board = remainingRows;
  return linesCleared;
}

function addScoreForLines(linesCleared) {
  if (linesCleared <= 0) {
    return;
  }

  score += LINE_SCORES[linesCleared] ?? linesCleared * 100;
  updateScoreDisplay();
}

function spawnPiece() {
  currentPiece = createPiece();

  if (!canMove(currentPiece, 0, 0, board)) {
    endGame();
    return false;
  }

  return true;
}

function lockAndSpawn() {
  lockPiece();
  const linesCleared = clearLines();
  addScoreForLines(linesCleared);
  spawnPiece();
}

// --- 렌더링 ---

function drawPiece(baseBoard, piece) {
  const displayBoard = baseBoard.map((row) => [...row]);

  if (!piece) {
    return displayBoard;
  }

  forEachFilledCell(piece, (shapeRow, shapeCol) => {
    const boardRow = piece.row + shapeRow;
    const boardCol = piece.col + shapeCol;

    if (isInsideBoard(boardRow, boardCol)) {
      displayBoard[boardRow][boardCol] = piece.type;
    }
  });

  return displayBoard;
}

function renderBoard(displayBoard) {
  boardElement.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const cellValue = displayBoard[row][col];
      if (cellValue) {
        cell.classList.add("filled", `piece-${cellValue}`);
      }

      boardElement.appendChild(cell);
    }
  }
}

function refreshDisplay() {
  const displayBoard = drawPiece(board, currentPiece);
  renderBoard(displayBoard);
}

function updateScoreDisplay() {
  scoreElement.textContent = String(score);
}

// --- 게임 루프 ---

function startGameLoop() {
  stopGameLoop();
  fallIntervalId = setInterval(tick, FALL_INTERVAL_MS);
}

function stopGameLoop() {
  if (fallIntervalId !== null) {
    clearInterval(fallIntervalId);
    fallIntervalId = null;
  }
}

function tick() {
  if (!isGameActive()) {
    return;
  }

  if (!movePiece(0, 1)) {
    lockAndSpawn();
  }

  refreshDisplay();
}

function softDrop() {
  if (!isGameActive()) {
    return;
  }

  if (movePiece(0, 1)) {
    refreshDisplay();
  }
}

function hardDrop() {
  if (!isGameActive()) {
    return;
  }

  while (movePiece(0, 1)) {
    // 바닥 또는 장애물까지 낙하
  }

  lockAndSpawn();
  refreshDisplay();
}

// --- 입력 ---

function handleKeyDown(event) {
  if (!isGameActive()) {
    return;
  }

  switch (event.code) {
    case "ArrowLeft":
      event.preventDefault();
      tryMoveAndRefresh(-1, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      tryMoveAndRefresh(1, 0);
      break;
    case "ArrowDown":
      event.preventDefault();
      softDrop();
      break;
    case "ArrowUp":
      event.preventDefault();
      tryRotate();
      break;
    case "Space":
      event.preventDefault();
      hardDrop();
      break;
    default:
      break;
  }
}

function setupKeyboardControls() {
  if (keyboardControlsRegistered) {
    return;
  }

  document.addEventListener("keydown", handleKeyDown);
  keyboardControlsRegistered = true;
}

// --- 게임 상태 전환 ---

function endGame() {
  isPlaying = false;
  stopGameLoop();
  currentPiece = null;
  statusMessage.textContent = "게임 오버! 재시작 버튼을 눌러주세요.";
  refreshDisplay();
}

function resetGame() {
  stopGameLoop();
  clearBoardAndScore();
  isPlaying = false;
  currentPiece = createPiece();
  refreshDisplay();
  statusMessage.textContent = "시작 버튼을 눌러 게임을 시작하세요.";
}

function startGame() {
  stopGameLoop();
  clearBoardAndScore();
  isPlaying = true;
  currentPiece = createPiece();
  refreshDisplay();
  startGameLoop();
  statusMessage.textContent = "방향키와 Space로 블록을 조작하세요.";
}

// --- 초기화 ---
startBtn.addEventListener("click", () => {
  if (!isPlaying) {
    startGame();
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

setupKeyboardControls();
resetGame();
