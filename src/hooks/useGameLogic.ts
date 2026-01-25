import { useState, useCallback } from 'react';

export type Player = 1 | 2 | null;
export type Board = Player[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = (): Board => 
  Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

const checkWin = (board: Board, row: number, col: number, player: Player): number[][] | null => {
  if (!player) return null;
  
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal right
    [1, -1],  // diagonal left
  ];
  
  for (const [dr, dc] of directions) {
    const cells: number[][] = [[row, col]];
    
    // Check positive direction
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        cells.push([r, c]);
      } else break;
    }
    
    // Check negative direction
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        cells.push([r, c]);
      } else break;
    }
    
    if (cells.length >= 4) return cells;
  }
  
  return null;
};

const getValidMoves = (board: Board): number[] => {
  const moves: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (board[0][col] === null) moves.push(col);
  }
  return moves;
};

const evaluateWindow = (window: Player[], player: Player): number => {
  const opponent = player === 1 ? 2 : 1;
  const playerCount = window.filter(c => c === player).length;
  const opponentCount = window.filter(c => c === opponent).length;
  const emptyCount = window.filter(c => c === null).length;
  
  if (playerCount === 4) return 100;
  if (playerCount === 3 && emptyCount === 1) return 5;
  if (playerCount === 2 && emptyCount === 2) return 2;
  if (opponentCount === 3 && emptyCount === 1) return -4;
  
  return 0;
};

const evaluateBoard = (board: Board, player: Player): number => {
  let score = 0;
  
  // Center column preference
  const centerCol = Math.floor(COLS / 2);
  const centerCount = board.filter(row => row[centerCol] === player).length;
  score += centerCount * 3;
  
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]];
      score += evaluateWindow(window, player);
    }
  }
  
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]];
      score += evaluateWindow(window, player);
    }
  }
  
  // Diagonal (positive slope)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
      score += evaluateWindow(window, player);
    }
  }
  
  // Diagonal (negative slope)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]];
      score += evaluateWindow(window, player);
    }
  }
  
  return score;
};

const minimax = (
  board: Board, 
  depth: number, 
  alpha: number, 
  beta: number, 
  maximizing: boolean,
  aiPlayer: Player
): [number, number] => {
  const validMoves = getValidMoves(board);
  const humanPlayer = aiPlayer === 1 ? 2 : 1;
  
  // Check terminal states
  for (let col = 0; col < COLS; col++) {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] !== null) {
        if (checkWin(board, row, col, board[row][col])) {
          if (board[row][col] === aiPlayer) return [null as any, 10000000];
          return [null as any, -10000000];
        }
        break;
      }
    }
  }
  
  if (validMoves.length === 0) return [null as any, 0];
  if (depth === 0) return [null as any, evaluateBoard(board, aiPlayer)];
  
  if (maximizing) {
    let value = -Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    for (const col of validMoves) {
      const newBoard = board.map(row => [...row]);
      for (let row = ROWS - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = aiPlayer;
          break;
        }
      }
      const [, score] = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer);
      if (score > value) {
        value = score;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  } else {
    let value = Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    for (const col of validMoves) {
      const newBoard = board.map(row => [...row]);
      for (let row = ROWS - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = humanPlayer;
          break;
        }
      }
      const [, score] = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer);
      if (score < value) {
        value = score;
        bestCol = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  }
};

const getAIMove = (board: Board, difficulty: Difficulty): number => {
  const validMoves = getValidMoves(board);
  if (validMoves.length === 0) return -1;
  
  const depthMap = { easy: 1, medium: 3, hard: 5 };
  const depth = depthMap[difficulty];
  
  // Add randomness for easier difficulties
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  const [bestCol] = minimax(board, depth, -Infinity, Infinity, true, 2);
  return bestCol;
};

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  winningCells: number[][] | null;
  isGameOver: boolean;
  lastMove: { row: number; col: number } | null;
  stats: { wins: number; losses: number; draws: number };
}

export const useGameLogic = (difficulty: Difficulty) => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: 1,
    winner: null,
    winningCells: null,
    isGameOver: false,
    lastMove: null,
    stats: { wins: 0, losses: 0, draws: 0 },
  });
  
  const [isAIThinking, setIsAIThinking] = useState(false);

  const dropDisc = useCallback((col: number) => {
    if (gameState.isGameOver || gameState.currentPlayer !== 1 || isAIThinking) return;
    
    const newBoard = gameState.board.map(row => [...row]);
    let dropRow = -1;
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = 1;
        dropRow = row;
        break;
      }
    }
    
    if (dropRow === -1) return;
    
    const winCells = checkWin(newBoard, dropRow, col, 1);
    const validMoves = getValidMoves(newBoard);
    
    if (winCells) {
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        winner: 1,
        winningCells: winCells,
        isGameOver: true,
        lastMove: { row: dropRow, col },
        stats: { ...prev.stats, wins: prev.stats.wins + 1 },
      }));
      return;
    }
    
    if (validMoves.length === 0) {
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        isGameOver: true,
        lastMove: { row: dropRow, col },
        stats: { ...prev.stats, draws: prev.stats.draws + 1 },
      }));
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: 2,
      lastMove: { row: dropRow, col },
    }));
    
    // AI turn
    setIsAIThinking(true);
    setTimeout(() => {
      const aiCol = getAIMove(newBoard, difficulty);
      if (aiCol === -1) {
        setIsAIThinking(false);
        return;
      }
      
      const aiBoard = newBoard.map(row => [...row]);
      let aiRow = -1;
      
      for (let row = ROWS - 1; row >= 0; row--) {
        if (aiBoard[row][aiCol] === null) {
          aiBoard[row][aiCol] = 2;
          aiRow = row;
          break;
        }
      }
      
      const aiWinCells = checkWin(aiBoard, aiRow, aiCol, 2);
      const aiValidMoves = getValidMoves(aiBoard);
      
      if (aiWinCells) {
        setGameState(prev => ({
          ...prev,
          board: aiBoard,
          winner: 2,
          winningCells: aiWinCells,
          isGameOver: true,
          lastMove: { row: aiRow, col: aiCol },
          stats: { ...prev.stats, losses: prev.stats.losses + 1 },
        }));
      } else if (aiValidMoves.length === 0) {
        setGameState(prev => ({
          ...prev,
          board: aiBoard,
          isGameOver: true,
          lastMove: { row: aiRow, col: aiCol },
          stats: { ...prev.stats, draws: prev.stats.draws + 1 },
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          board: aiBoard,
          currentPlayer: 1,
          lastMove: { row: aiRow, col: aiCol },
        }));
      }
      
      setIsAIThinking(false);
    }, 500);
  }, [gameState, difficulty, isAIThinking]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      board: createEmptyBoard(),
      currentPlayer: 1,
      winner: null,
      winningCells: null,
      isGameOver: false,
      lastMove: null,
    }));
  }, []);

  const resetStats = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      stats: { wins: 0, losses: 0, draws: 0 },
    }));
  }, []);

  return {
    gameState,
    dropDisc,
    resetGame,
    resetStats,
    isAIThinking,
  };
};
