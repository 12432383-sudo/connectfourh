import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Difficulty, GameMode } from '@/hooks/useGameLogic';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2, Volume2, VolumeX, Bot, Users, Wifi, Palette, Trophy } from 'lucide-react';

interface GameControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  onResetGame: () => void;
  onResetStats: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isGameOver: boolean;
  onOpenShop?: () => void;
  onOpenLeaderboard?: () => void;
}

export const GameControls = ({
  difficulty,
  onDifficultyChange,
  gameMode,
  onGameModeChange,
  onResetGame,
  onResetStats,
  soundEnabled,
  onToggleSound,
  isGameOver,
  onOpenShop,
  onOpenLeaderboard,
}: GameControlsProps) => {
  const navigate = useNavigate();
  
  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const gameModes: { value: GameMode; label: string; icon: React.ReactNode }[] = [
    { value: 'ai', label: 'vs AI', icon: <Bot className="w-4 h-4" /> },
    { value: 'local', label: '2 Players', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {/* Game mode selector */}
      <div className="flex items-center justify-center gap-2">
        {gameModes.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => onGameModeChange(value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                gameMode === value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            {icon}
            {label}
          </button>
        ))}
        
        {/* Online mode button */}
        <button
          onClick={() => navigate('/online')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-primary/20 text-primary hover:bg-primary/30"
        >
          <Wifi className="w-4 h-4" />
          Online
        </button>
      </div>

      {/* Difficulty selector (only show for AI mode) */}
      {gameMode === 'ai' && (
        <div className="flex items-center justify-center gap-2">
          {difficulties.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onDifficultyChange(value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  difficulty === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSound}
          className="gap-2"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>

        {onOpenShop && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenShop}
            className="gap-2"
          >
            <Palette className="w-4 h-4" />
          </Button>
        )}

        {onOpenLeaderboard && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenLeaderboard}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
          </Button>
        )}

        <Button
          onClick={onResetGame}
          className={`gap-2 ${isGameOver ? 'animate-pulse' : ''}`}
        >
          <RotateCcw className="w-4 h-4" />
          {isGameOver ? 'Play Again' : 'New Game'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onResetStats}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
