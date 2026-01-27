/**
 * AI Learning System
 * 
 * Tracks losing patterns and adapts the AI's strategy to avoid
 * repeating the same mistakes. Uses localStorage to persist learning
 * across sessions.
 */

import { Board, Player, Difficulty } from '@/hooks/useGameLogic';

const STORAGE_KEY = 'connect4_ai_learning';
const MAX_PATTERNS = 100; // Limit stored patterns to prevent localStorage bloat

export interface LearningPattern {
  // The sequence of player moves that led to AI loss
  playerMoves: number[];
  // How many times this pattern has caused a loss
  lossCount: number;
  // The difficulty level where this occurred
  difficulty: Difficulty;
}

export interface AILearningData {
  patterns: LearningPattern[];
  totalGamesLearned: number;
}

// Load learning data from localStorage
export const loadLearningData = (): AILearningData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load AI learning data:', e);
  }
  return { patterns: [], totalGamesLearned: 0 };
};

// Save learning data to localStorage
export const saveLearningData = (data: AILearningData): void => {
  try {
    // Limit patterns to prevent localStorage bloat
    if (data.patterns.length > MAX_PATTERNS) {
      // Keep patterns with highest loss counts
      data.patterns.sort((a, b) => b.lossCount - a.lossCount);
      data.patterns = data.patterns.slice(0, MAX_PATTERNS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save AI learning data:', e);
  }
};

// Record a loss pattern for learning
export const recordLossPattern = (
  playerMoves: number[],
  difficulty: Difficulty
): void => {
  const data = loadLearningData();
  
  // Look for existing similar pattern (same first few moves)
  const patternKey = playerMoves.slice(0, Math.min(5, playerMoves.length)).join(',');
  const existingIndex = data.patterns.findIndex(p => 
    p.playerMoves.slice(0, Math.min(5, p.playerMoves.length)).join(',') === patternKey &&
    p.difficulty === difficulty
  );
  
  if (existingIndex >= 0) {
    // Increment loss count for existing pattern
    data.patterns[existingIndex].lossCount++;
    // Update with the latest move sequence
    data.patterns[existingIndex].playerMoves = playerMoves;
  } else {
    // Add new pattern
    data.patterns.push({
      playerMoves,
      lossCount: 1,
      difficulty
    });
  }
  
  data.totalGamesLearned++;
  saveLearningData(data);
};

// Get penalty scores for columns based on learned patterns
export const getLearnedPenalties = (
  currentPlayerMoves: number[],
  difficulty: Difficulty
): Map<number, number> => {
  const penalties = new Map<number, number>();
  const data = loadLearningData();
  
  // Initialize all columns with 0 penalty
  for (let col = 0; col < 7; col++) {
    penalties.set(col, 0);
  }
  
  // Find patterns that match the current game state
  for (const pattern of data.patterns) {
    if (pattern.difficulty !== difficulty) continue;
    
    // Check if current moves match the start of this losing pattern
    const matchLength = Math.min(currentPlayerMoves.length, pattern.playerMoves.length);
    let matches = true;
    
    for (let i = 0; i < matchLength; i++) {
      if (currentPlayerMoves[i] !== pattern.playerMoves[i]) {
        matches = false;
        break;
      }
    }
    
    if (matches && pattern.playerMoves.length > currentPlayerMoves.length) {
      // The next move in the pattern is what led to a loss
      const dangerousMove = pattern.playerMoves[currentPlayerMoves.length];
      
      // Apply penalty based on how many times this pattern caused losses
      const currentPenalty = penalties.get(dangerousMove) || 0;
      penalties.set(dangerousMove, currentPenalty + pattern.lossCount * 10);
    }
  }
  
  return penalties;
};

// Calculate a counter-strategy based on learned patterns
export const suggestCounterMove = (
  currentPlayerMoves: number[],
  validMoves: number[],
  difficulty: Difficulty
): number | null => {
  const data = loadLearningData();
  
  // Find patterns that match current state
  const matchingPatterns = data.patterns.filter(pattern => {
    if (pattern.difficulty !== difficulty) return false;
    
    const matchLength = Math.min(currentPlayerMoves.length, pattern.playerMoves.length);
    for (let i = 0; i < matchLength; i++) {
      if (currentPlayerMoves[i] !== pattern.playerMoves[i]) {
        return false;
      }
    }
    return pattern.playerMoves.length > currentPlayerMoves.length;
  });
  
  if (matchingPatterns.length === 0) return null;
  
  // Sort by loss count to prioritize blocking the most dangerous patterns
  matchingPatterns.sort((a, b) => b.lossCount - a.lossCount);
  
  // The most dangerous pattern - try to block the player's next likely move
  const mostDangerous = matchingPatterns[0];
  const expectedPlayerMove = mostDangerous.playerMoves[currentPlayerMoves.length];
  
  // If we can block that column, suggest it (but only sometimes to add variety)
  if (validMoves.includes(expectedPlayerMove) && Math.random() < 0.7) {
    return expectedPlayerMove;
  }
  
  // Otherwise, try adjacent columns to disrupt the pattern
  const adjacentCols = [expectedPlayerMove - 1, expectedPlayerMove + 1]
    .filter(col => validMoves.includes(col));
  
  if (adjacentCols.length > 0 && Math.random() < 0.5) {
    return adjacentCols[Math.floor(Math.random() * adjacentCols.length)];
  }
  
  return null;
};

// Clear all learned patterns (for debugging/reset)
export const clearLearningData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Get learning statistics
export const getLearningStats = (): { totalGames: number; patternsLearned: number } => {
  const data = loadLearningData();
  return {
    totalGames: data.totalGamesLearned,
    patternsLearned: data.patterns.length
  };
};
