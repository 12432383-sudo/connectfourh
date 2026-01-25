import { motion } from 'framer-motion';
import { Player, Difficulty, GameMode } from '@/hooks/useGameLogic';
import { Trophy, Bot, User, Loader2, Users } from 'lucide-react';

interface GameHeaderProps {
  currentPlayer: Player;
  winner: Player;
  isGameOver: boolean;
  isAIThinking: boolean;
  difficulty: Difficulty;
  gameMode: GameMode;
  stats: { player1Wins: number; player2Wins: number; draws: number; wins: number; losses: number };
}

export const GameHeader = ({
  currentPlayer,
  winner,
  isGameOver,
  isAIThinking,
  difficulty,
  gameMode,
  stats,
}: GameHeaderProps) => {
  const getStatusText = () => {
    if (gameMode === 'local') {
      if (winner === 1) return 'Player 1 Wins!';
      if (winner === 2) return 'Player 2 Wins!';
      if (isGameOver) return "It's a Draw!";
      return currentPlayer === 1 ? "Player 1's Turn" : "Player 2's Turn";
    }
    
    // AI mode
    if (winner === 1) return 'You Win!';
    if (winner === 2) return 'AI Wins!';
    if (isGameOver) return "It's a Draw!";
    if (isAIThinking) return 'AI is thinking...';
    return currentPlayer === 1 ? 'Your Turn' : 'AI Turn';
  };

  const getDifficultyLabel = () => {
    const labels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    return labels[difficulty];
  };

  const getStatusIcon = () => {
    if (winner) return <Trophy className="w-5 h-5" />;
    if (isAIThinking) return <Loader2 className="w-5 h-5 animate-spin" />;
    
    if (gameMode === 'local') {
      return <User className="w-5 h-5" />;
    }
    
    return currentPlayer === 1 ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />;
  };

  return (
    <div className="text-center space-y-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight"
      >
        Connect Four
      </motion.h1>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
          <div className="w-3 h-3 rounded-full bg-player1" />
          <span className="text-sm text-muted-foreground">
            {gameMode === 'local' ? 'Player 1' : 'You'}
          </span>
        </div>
        <span className="text-muted-foreground">vs</span>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
          <div className="w-3 h-3 rounded-full bg-player2" />
          <span className="text-sm text-muted-foreground">
            {gameMode === 'local' ? 'Player 2' : `AI (${getDifficultyLabel()})`}
          </span>
        </div>
      </div>

      <motion.div
        key={getStatusText()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium
          ${winner === 1 ? 'bg-primary/20 text-primary' : ''}
          ${winner === 2 ? 'bg-secondary/20 text-secondary' : ''}
          ${!winner && isGameOver ? 'bg-muted text-muted-foreground' : ''}
          ${!isGameOver && currentPlayer === 1 ? 'bg-primary/10 text-primary' : ''}
          ${!isGameOver && currentPlayer === 2 && !winner ? 'bg-secondary/10 text-secondary' : ''}
        `}
      >
        {getStatusIcon()}
        {getStatusText()}
      </motion.div>

      <div className="flex items-center justify-center gap-6 text-sm">
        {gameMode === 'local' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-primary font-semibold">{stats.player1Wins}</span>
              <span className="text-muted-foreground">P1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-secondary font-semibold">{stats.player2Wins}</span>
              <span className="text-muted-foreground">P2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-semibold">{stats.draws}</span>
              <span className="text-muted-foreground">Draws</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-primary font-semibold">{stats.wins}</span>
              <span className="text-muted-foreground">Wins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-secondary font-semibold">{stats.losses}</span>
              <span className="text-muted-foreground">Losses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-semibold">{stats.draws}</span>
              <span className="text-muted-foreground">Draws</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
