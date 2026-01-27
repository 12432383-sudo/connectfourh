import { useState, useCallback, useRef } from 'react';
import { getAIMove, recordAILoss, checkWin, getValidMoves } from '@/lib/aiEngine';

export type Player = 1 | 2 | null;
export type Board = Player[][];
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'ai' | 'local';

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = (): Board => 
  Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  winningCells: number[][] | null;
  isGameOver: boolean;
  lastMove: { row: number; col: number } | null;
  stats: { 
    player1Wins: number; 
    player2Wins: number; 
    draws: number;
    // Legacy stats for AI mode
    wins: number;
    losses: number;
  };
}

export const useGameLogic = (difficulty: Difficulty, gameMode: GameMode) => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: 1,
    winner: null,
    winningCells: null,
    isGameOver: false,
    lastMove: null,
    stats: { player1Wins: 0, player2Wins: 0, draws: 0, wins: 0, losses: 0 },
  });
  
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  // Track player moves for learning
  const playerMovesRef = useRef<number[]>([]);

  const dropDisc = useCallback((col: number) => {
    if (gameState.isGameOver || isAIThinking) return;
    
    // In AI mode, only player 1 can drop manually
    if (gameMode === 'ai' && gameState.currentPlayer !== 1) return;
    
    const currentPlayer = gameState.currentPlayer;
    const newBoard = gameState.board.map(row => [...row]);
    let dropRow = -1;
    
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = currentPlayer;
        dropRow = row;
        break;
      }
    }
    
    if (dropRow === -1) return;
    
    // Track player moves for learning (only in AI mode)
    if (gameMode === 'ai' && currentPlayer === 1) {
      playerMovesRef.current = [...playerMovesRef.current, col];
    }
    
    const winCells = checkWin(newBoard, dropRow, col, currentPlayer);
    const validMoves = getValidMoves(newBoard);
    
    if (winCells) {
      // Player wins - record this pattern so AI learns from it
      if (gameMode === 'ai' && currentPlayer === 1) {
        recordAILoss(playerMovesRef.current, difficulty);
      }
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        winner: currentPlayer,
        winningCells: winCells,
        isGameOver: true,
        lastMove: { row: dropRow, col },
        stats: {
          ...prev.stats,
          player1Wins: currentPlayer === 1 ? prev.stats.player1Wins + 1 : prev.stats.player1Wins,
          player2Wins: currentPlayer === 2 ? prev.stats.player2Wins + 1 : prev.stats.player2Wins,
          wins: gameMode === 'ai' && currentPlayer === 1 ? prev.stats.wins + 1 : prev.stats.wins,
          losses: gameMode === 'ai' && currentPlayer === 2 ? prev.stats.losses + 1 : prev.stats.losses,
        },
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
    
    const nextPlayer: Player = currentPlayer === 1 ? 2 : 1;
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: nextPlayer,
      lastMove: { row: dropRow, col },
    }));
    
    // AI turn (only in AI mode when it's player 2's turn)
    if (gameMode === 'ai' && nextPlayer === 2) {
      setIsAIThinking(true);
      setTimeout(() => {
        const aiCol = getAIMove(newBoard, difficulty, {
          playerMoveHistory: playerMovesRef.current,
          difficulty
        });
        
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
            stats: { 
              ...prev.stats, 
              losses: prev.stats.losses + 1,
              player2Wins: prev.stats.player2Wins + 1,
            },
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
    }
  }, [gameState, difficulty, gameMode, isAIThinking]);

  const resetGame = useCallback(() => {
    // Clear player move history for new game
    playerMovesRef.current = [];
    
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
      stats: { player1Wins: 0, player2Wins: 0, draws: 0, wins: 0, losses: 0 },
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
