import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameLogic, Difficulty } from '@/hooks/useGameLogic';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAdMob } from '@/hooks/useAdMob';
import { GameBoard } from '@/components/game/GameBoard';
import { GameHeader } from '@/components/game/GameHeader';
import { GameControls } from '@/components/game/GameControls';
import { AdBanner } from '@/components/game/AdBanner';

const Index = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  const { gameState, dropDisc, resetGame, resetStats, isAIThinking } = useGameLogic(difficulty);
  const { playSound } = useSoundEffects(soundEnabled);
  const { showInterstitial, isInterstitialLoaded } = useAdMob();
  
  // Track previous state for sound effects
  const prevLastMoveRef = useRef(gameState.lastMove);
  const prevWinnerRef = useRef(gameState.winner);
  const prevIsGameOverRef = useRef(gameState.isGameOver);

  // Play sounds on game events
  useEffect(() => {
    // Disc drop sound
    if (gameState.lastMove && gameState.lastMove !== prevLastMoveRef.current) {
      playSound('drop');
    }
    prevLastMoveRef.current = gameState.lastMove;
  }, [gameState.lastMove, playSound]);

  useEffect(() => {
    // Win/Lose/Draw sounds and track games played
    if (gameState.isGameOver && !prevIsGameOverRef.current) {
      setGamesPlayed(prev => prev + 1);
      
      if (gameState.winner === 1) {
        setTimeout(() => playSound('win'), 300);
      } else if (gameState.winner === 2) {
        setTimeout(() => playSound('lose'), 300);
      } else {
        setTimeout(() => playSound('draw'), 300);
      }
    }
    prevWinnerRef.current = gameState.winner;
    prevIsGameOverRef.current = gameState.isGameOver;
  }, [gameState.isGameOver, gameState.winner, playSound]);

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    playSound('click');
    setDifficulty(newDifficulty);
    resetGame();
  }, [resetGame, playSound]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const handleResetGame = useCallback(async () => {
    playSound('click');
    
    // Show interstitial ad every 3 games
    if (gamesPlayed > 0 && gamesPlayed % 3 === 0 && isInterstitialLoaded) {
      await showInterstitial();
    }
    
    resetGame();
  }, [resetGame, playSound, gamesPlayed, isInterstitialLoaded, showInterstitial]);

  const handleResetStats = useCallback(() => {
    playSound('click');
    resetStats();
  }, [resetStats, playSound]);

  const handleColumnClick = useCallback((col: number) => {
    dropDisc(col);
  }, [dropDisc]);

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
            onColumnClick={handleColumnClick}
            disabled={gameState.isGameOver || isAIThinking || gameState.currentPlayer !== 1}
            currentPlayer={gameState.currentPlayer}
          />

          <GameControls
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            onResetGame={handleResetGame}
            onResetStats={handleResetStats}
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
