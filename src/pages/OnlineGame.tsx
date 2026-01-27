import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Frown, Minus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnlineMatchmaking } from '@/components/online/OnlineMatchmaking';
import { OnlineGameBoard } from '@/components/online/OnlineGameBoard';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { useThemes } from '@/hooks/useThemes';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { useGuestId } from '@/hooks/useGuestId';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useConfetti } from '@/hooks/useConfetti';
import { AdBanner } from '@/components/game/AdBanner';

const OnlineGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameIdFromUrl = searchParams.get('gameId');
  
  const { selectedTheme } = useThemes();
  const { playSound } = useSoundEffects(true);
  const { notification, impact } = useHaptics(true);
  const guestId = useGuestId();
  const { recordGameResult } = useLeaderboard();
  const { fireConfetti, fireFireworks } = useConfetti();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const hasRecordedResult = useRef(false);

  const {
    status,
    game,
    playerNumber,
    opponentTheme,
    findMatch,
    makeMove,
    cancelSearch,
    leaveGame,
    joinGame,
  } = useOnlineGame(selectedTheme);

  // Auto-join game if gameId is in URL
  useEffect(() => {
    if (gameIdFromUrl && status === 'idle') {
      joinGame(gameIdFromUrl);
    }
  }, [gameIdFromUrl, status, joinGame]);

  // Record game result and play sounds when game ends
  useEffect(() => {
    if (game?.is_game_over && guestId && !hasRecordedResult.current) {
      hasRecordedResult.current = true;
      
      // Determine result
      let result: 'win' | 'loss' | 'draw';
      if (game.winner === playerNumber) {
        result = 'win';
        playSound('win');
        notification('success');
        // Fire victory animation!
        setTimeout(() => fireFireworks(), 300);
      } else if (game.winner) {
        result = 'loss';
        playSound('lose');
        notification('error');
      } else {
        result = 'draw';
        playSound('draw');
      }

      // Record the result
      recordGameResult(guestId, `Player ${guestId.slice(-6)}`, result);
    }
  }, [game?.is_game_over, game?.winner, playerNumber, guestId, playSound, notification, recordGameResult, fireFireworks]);

  // Reset recorded flag when starting new game
  useEffect(() => {
    if (status === 'searching' || status === 'idle') {
      hasRecordedResult.current = false;
    }
  }, [status]);

  // Play drop sound when opponent makes a move
  useEffect(() => {
    if (game?.last_move && game.current_player === playerNumber) {
      playSound('drop');
      impact('medium');
    }
  }, [game?.last_move, game?.current_player, playerNumber, playSound, impact]);

  const handleColumnClick = (col: number) => {
    playSound('drop');
    impact('medium');
    makeMove(col);
  };

  const handleBack = () => {
    if (status === 'searching') {
      cancelSearch();
    } else if (status === 'playing' || status === 'finished') {
      leaveGame();
    }
    navigate('/');
  };

  const handlePlayAgain = () => {
    leaveGame();
    findMatch();
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: selectedTheme.background_gradient || `linear-gradient(135deg, ${selectedTheme.board_color} 0%, ${selectedTheme.board_color}dd 100%)`,
      }}
    >
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsLeaderboardOpen(true)}
          className="gap-2"
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-lg space-y-6"
        >
          <h1 className="text-2xl font-bold text-center text-foreground">
            Online Battle
          </h1>

          {status === 'idle' && (
            <OnlineMatchmaking
              status={status}
              onFindMatch={findMatch}
              onCancel={cancelSearch}
            />
          )}

          {status === 'searching' && (
            <OnlineMatchmaking
              status={status}
              onFindMatch={findMatch}
              onCancel={cancelSearch}
            />
          )}

          {status === 'matched' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-6 h-6 text-primary animate-pulse" />
                <span className="text-lg text-foreground">Waiting for opponent to accept...</span>
              </div>
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
            </div>
          )}

          {(status === 'playing' || status === 'finished') && game && (
            <>
              <OnlineGameBoard
                board={game.board}
                winningCells={game.winning_cells}
                lastMove={game.last_move}
                onColumnClick={handleColumnClick}
                disabled={game.is_game_over || game.current_player !== playerNumber}
                currentPlayer={game.current_player}
                playerNumber={playerNumber}
                myTheme={selectedTheme}
                opponentTheme={opponentTheme}
              />

              {/* Game over overlay */}
              {game.is_game_over && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="flex items-center justify-center gap-2">
                    {game.winner === playerNumber ? (
                      <>
                        <Trophy className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-primary">You Won!</span>
                      </>
                    ) : game.winner ? (
                      <>
                        <Frown className="w-8 h-8 text-destructive" />
                        <span className="text-2xl font-bold text-destructive">You Lost</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-8 h-8 text-muted-foreground" />
                        <span className="text-2xl font-bold text-muted-foreground">Draw</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleBack}>
                      Exit
                    </Button>
                    <Button onClick={handlePlayAgain}>
                      Play Again
                    </Button>
                    <Button variant="outline" onClick={() => setIsLeaderboardOpen(true)}>
                      <Trophy className="w-4 h-4 mr-2" />
                      Ranks
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-4 pb-4 pt-2">
        <div className="max-w-lg mx-auto">
          <AdBanner />
        </div>
      </footer>

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        myGuestId={guestId}
      />
    </div>
  );
};

export default OnlineGame;
