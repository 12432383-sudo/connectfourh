import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameLogic, Difficulty } from '@/hooks/useGameLogic';
import { GameBoard } from '@/components/game/GameBoard';
import { GameHeader } from '@/components/game/GameHeader';
import { GameControls } from '@/components/game/GameControls';
import { AdBanner } from '@/components/game/AdBanner';

const Index = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const { gameState, dropDisc, resetGame, resetStats, isAIThinking } = useGameLogic(difficulty);

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  }, [resetGame]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-lg space-y-6"
        >
          <GameHeader
            currentPlayer={gameState.currentPlayer}
            winner={gameState.winner}
            isGameOver={gameState.isGameOver}
            isAIThinking={isAIThinking}
            difficulty={difficulty}
            stats={gameState.stats}
          />

          <GameBoard
            board={gameState.board}
            winningCells={gameState.winningCells}
            lastMove={gameState.lastMove}
            onColumnClick={dropDisc}
            disabled={gameState.isGameOver || isAIThinking || gameState.currentPlayer !== 1}
            currentPlayer={gameState.currentPlayer}
          />

          <GameControls
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            onResetGame={resetGame}
            onResetStats={resetStats}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            isGameOver={gameState.isGameOver}
          />
        </motion.div>
      </main>

      {/* Ad banner at bottom */}
      <footer className="px-4 pb-4 pt-2">
        <div className="max-w-lg mx-auto">
          <AdBanner />
        </div>
      </footer>
    </div>
  );
};

export default Index;
