import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGameLogic, Difficulty, GameMode } from '@/hooks/useGameLogic';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { useAdMob } from '@/hooks/useAdMob';
import { useThemes } from '@/hooks/useThemes';
import { GameBoard } from '@/components/game/GameBoard';
import { GameHeader } from '@/components/game/GameHeader';
import { GameControls } from '@/components/game/GameControls';
import { AdBanner } from '@/components/game/AdBanner';
import { ThemeShop } from '@/components/shop/ThemeShop';

const Index = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  
  const { gameState, dropDisc, resetGame, resetStats, isAIThinking } = useGameLogic(difficulty, gameMode);
  const { playSound } = useSoundEffects(soundEnabled);
  const { impact, notification } = useHaptics(true);
  const { showInterstitial, isInterstitialLoaded } = useAdMob();
  const {
    themes,
    selectedTheme,
    isThemeUnlocked,
    unlockTheme,
    selectTheme,
  } = useThemes();
  
  // Track previous state for sound effects
  const prevLastMoveRef = useRef(gameState.lastMove);
  const prevWinnerRef = useRef(gameState.winner);
  const prevIsGameOverRef = useRef(gameState.isGameOver);

  // Play sounds and haptics on game events
  useEffect(() => {
    // Disc drop sound + haptic
    if (gameState.lastMove && gameState.lastMove !== prevLastMoveRef.current) {
      playSound('drop');
      impact('medium');
    }
    prevLastMoveRef.current = gameState.lastMove;
  }, [gameState.lastMove, playSound, impact]);

  useEffect(() => {
    // Win/Lose/Draw sounds and track games played
    if (gameState.isGameOver && !prevIsGameOverRef.current) {
      setGamesPlayed(prev => prev + 1);
      
      if (gameMode === 'local') {
        if (gameState.winner) {
          setTimeout(() => {
            playSound('win');
            notification('success');
          }, 300);
        } else {
          setTimeout(() => playSound('draw'), 300);
        }
      } else {
        if (gameState.winner === 1) {
          setTimeout(() => {
            playSound('win');
            notification('success');
          }, 300);
        } else if (gameState.winner === 2) {
          setTimeout(() => {
            playSound('lose');
            notification('error');
          }, 300);
        } else {
          setTimeout(() => playSound('draw'), 300);
        }
      }
    }
    prevWinnerRef.current = gameState.winner;
    prevIsGameOverRef.current = gameState.isGameOver;
  }, [gameState.isGameOver, gameState.winner, gameMode, playSound, notification]);

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    playSound('click');
    impact('light');
    setDifficulty(newDifficulty);
    resetGame();
  }, [resetGame, playSound, impact]);

  const handleGameModeChange = useCallback((newMode: GameMode) => {
    playSound('click');
    impact('light');
    setGameMode(newMode);
    resetGame();
  }, [resetGame, playSound, impact]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
    impact('light');
  }, [impact]);

  const handleResetGame = useCallback(async () => {
    playSound('click');
    impact('light');
    
    // Show interstitial ad every 3 games
    if (gamesPlayed > 0 && gamesPlayed % 3 === 0 && isInterstitialLoaded) {
      await showInterstitial();
    }
    
    resetGame();
  }, [resetGame, playSound, impact, gamesPlayed, isInterstitialLoaded, showInterstitial]);

  const handleResetStats = useCallback(() => {
    playSound('click');
    impact('light');
    resetStats();
  }, [resetStats, playSound, impact]);

  const handleColumnClick = useCallback((col: number) => {
    dropDisc(col);
  }, [dropDisc]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: selectedTheme.background_gradient || `linear-gradient(135deg, ${selectedTheme.board_color} 0%, ${selectedTheme.board_color}dd 100%)`,
      }}
    >
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
            gameMode={gameMode}
            stats={gameState.stats}
          />

          <GameBoard
            board={gameState.board}
            winningCells={gameState.winningCells}
            lastMove={gameState.lastMove}
            onColumnClick={handleColumnClick}
            disabled={gameState.isGameOver || isAIThinking}
            currentPlayer={gameState.currentPlayer}
          />

          <GameControls
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            gameMode={gameMode}
            onGameModeChange={handleGameModeChange}
            onResetGame={handleResetGame}
            onResetStats={handleResetStats}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            isGameOver={gameState.isGameOver}
            onOpenShop={() => setIsShopOpen(true)}
          />
        </motion.div>
      </main>

      {/* Ad banner and footer */}
      <footer className="px-4 pb-4 pt-2">
        <div className="max-w-lg mx-auto space-y-4">
          <AdBanner />
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>

      {/* Theme Shop Modal */}
      <ThemeShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        themes={themes}
        selectedTheme={selectedTheme}
        isThemeUnlocked={isThemeUnlocked}
        onUnlockTheme={unlockTheme}
        onSelectTheme={selectTheme}
      />
    </div>
  );
};

export default Index;
