import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useGameLogic, Difficulty, GameMode } from '@/hooks/useGameLogic';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { useAdMob } from '@/hooks/useAdMob';
import { useThemes } from '@/hooks/useThemes';
import { useGuestId } from '@/hooks/useGuestId';
import { useFriends } from '@/hooks/useFriends';
import { useConfetti } from '@/hooks/useConfetti';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import { GameBoard } from '@/components/game/GameBoard';
import { GameHeader } from '@/components/game/GameHeader';
import { GameControls } from '@/components/game/GameControls';
import { AdBanner } from '@/components/game/AdBanner';
import { ThemeShop } from '@/components/shop/ThemeShop';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { FriendsList } from '@/components/friends/FriendsList';
import { ChallengeNotification } from '@/components/friends/ChallengeNotification';
import { SettingsMenu } from '@/components/game/SettingsMenu';

const Index = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const guestId = useGuestId();
  const { incomingChallenges } = useFriends();
  
  const { gameState, dropDisc, resetGame, resetStats, isAIThinking } = useGameLogic(difficulty, gameMode);
  const { playSound, stopAllSounds } = useSoundEffects(soundEnabled);
  const { impact, notification } = useHaptics(hapticsEnabled);
  const { showInterstitial, isInterstitialLoaded } = useAdMob();
  const { fireConfetti, fireFireworks } = useConfetti();
  const {
    themes,
    selectedTheme,
    isThemeUnlocked,
    unlockTheme,
    selectTheme,
  } = useThemes();

  // Handle app lifecycle (pause/resume for native apps)
  useAppLifecycle({
    onPause: () => {
      stopAllSounds?.();
    },
    onBackButton: () => {
      // Handle back button: close modals if open, otherwise allow exit
      if (isShopOpen || isLeaderboardOpen || isFriendsOpen || isSettingsOpen) {
        setIsShopOpen(false);
        setIsLeaderboardOpen(false);
        setIsFriendsOpen(false);
        setIsSettingsOpen(false);
        return true; // Handled
      }
      return false; // Let default behavior (exit) happen
    },
  });
  
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
            fireFireworks();
          }, 300);
        } else {
          setTimeout(() => playSound('draw'), 300);
        }
      } else {
        if (gameState.winner === 1) {
          setTimeout(() => {
            playSound('win');
            notification('success');
            fireConfetti();
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
  }, [gameState.isGameOver, gameState.winner, gameMode, playSound, notification, fireConfetti, fireFireworks]);

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

  const handleToggleHaptics = useCallback(() => {
    setHapticsEnabled(prev => !prev);
  }, []);

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

  const handleNavigateToGame = useCallback((gameId: string) => {
    navigate(`/online?gameId=${gameId}`);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: selectedTheme.background_gradient || `linear-gradient(135deg, ${selectedTheme.board_color} 0%, ${selectedTheme.board_color}dd 100%)`,
      }}
    >
      {/* Challenge Notification */}
      <ChallengeNotification
        selectedTheme={selectedTheme}
        onAccept={handleNavigateToGame}
      />

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
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenFriends={() => setIsFriendsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            hasPendingChallenges={incomingChallenges.length > 0}
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

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        myGuestId={guestId}
      />

      {/* Friends Modal */}
      <FriendsList
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        selectedTheme={selectedTheme}
        onChallengeAccepted={handleNavigateToGame}
        onChallengeSent={handleNavigateToGame}
      />

      {/* Settings Menu */}
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        hapticsEnabled={hapticsEnabled}
        onToggleHaptics={handleToggleHaptics}
      />
    </div>
  );
};

export default Index;
