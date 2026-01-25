import { motion } from 'framer-motion';
import { Difficulty } from '@/hooks/useGameLogic';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2, Volume2, VolumeX } from 'lucide-react';

interface GameControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onResetGame: () => void;
  onResetStats: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isGameOver: boolean;
}

export const GameControls = ({
  difficulty,
  onDifficultyChange,
  onResetGame,
  onResetStats,
  soundEnabled,
  onToggleSound,
  isGameOver,
}: GameControlsProps) => {
  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {/* Difficulty selector */}
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
