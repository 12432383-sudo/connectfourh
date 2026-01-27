import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Frown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnlineMatchmaking } from '@/components/online/OnlineMatchmaking';
import { OnlineGameBoard } from '@/components/online/OnlineGameBoard';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { useThemes } from '@/hooks/useThemes';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { AdBanner } from '@/components/game/AdBanner';

const OnlineGame = () => {
  const navigate = useNavigate();
  const { selectedTheme } = useThemes();
  const { playSound } = useSoundEffects(true);
  const { notification, impact } = useHaptics(true);

  const {
    status,
    game,
    playerNumber,
    opponentTheme,
    findMatch,
    makeMove,
    cancelSearch,
    leaveGame,
  } = useOnlineGame(selectedTheme);

  // Play sounds on game events
  useEffect(() => {
    if (game?.is_game_over) {
      if (game.winner === playerNumber) {
        playSound('win');
        notification('success');
      } else if (game.winner) {
        playSound('lose');
        notification('error');
      } else {
        playSound('draw');
      }
    }
  }, [game?.is_game_over, game?.winner, playerNumber, playSound, notification]);

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
      <header className="p-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
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
    </div>
  );
};

export default OnlineGame;
