/**
 * AI Engine Module
 * 
 * Contains the Connect Four AI logic with learning capabilities.
 * Extracted from useGameLogic for better maintainability.
 */

import { Board, Player, Difficulty } from '@/hooks/useGameLogic';
import { 
  getLearnedPenalties, 
  suggestCounterMove, 
  recordLossPattern 
} from '@/lib/aiLearning';

const ROWS = 6;
const COLS = 7;

export const getValidMoves = (board: Board): number[] => {
  const moves: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (board[0][col] === null) moves.push(col);
  }
  return moves;
};

export const checkWin = (board: Board, row: number, col: number, player: Player): number[][] | null => {
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
  aiPlayer: Player,
  learnedPenalties: Map<number, number>
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
      let [, score] = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer, learnedPenalties);
      
      // Apply learned penalty to discourage moves that led to losses
      const penalty = learnedPenalties.get(col) || 0;
      score -= penalty;
      
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
      const [, score] = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer, learnedPenalties);
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

export interface AIContext {
  playerMoveHistory: number[];
  difficulty: Difficulty;
}

export const getAIMove = (
  board: Board, 
  difficulty: Difficulty,
  context: AIContext
): number => {
  const validMoves = getValidMoves(board);
  if (validMoves.length === 0) return -1;
  
  // Get learned penalties from previous losses
  const learnedPenalties = getLearnedPenalties(context.playerMoveHistory, difficulty);
  
  // Check if we should use a counter-strategy based on learned patterns
  const counterMove = suggestCounterMove(context.playerMoveHistory, validMoves, difficulty);
  
  const depthMap = { easy: 1, medium: 3, hard: 5 };
  const depth = depthMap[difficulty];
  
  // Add randomness for easier difficulties
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  // For medium/hard, sometimes use counter-strategy if available
  if (counterMove !== null && difficulty !== 'easy') {
    // Higher chance to use counter-strategy at higher difficulties
    const counterChance = difficulty === 'hard' ? 0.4 : 0.25;
    if (Math.random() < counterChance) {
      return counterMove;
    }
  }
  
  const [bestCol] = minimax(board, depth, -Infinity, Infinity, true, 2, learnedPenalties);
  return bestCol;
};

// Record that the AI lost to learn from it
export const recordAILoss = (playerMoves: number[], difficulty: Difficulty): void => {
  recordLossPattern(playerMoves, difficulty);
};
