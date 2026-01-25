import { motion } from 'framer-motion';
import { Player } from '@/hooks/useGameLogic';

interface GameCellProps {
  player: Player;
  isWinning: boolean;
  isLastMove: boolean;
  shouldAnimate: boolean;
}

export const GameCell = ({ player, isWinning, shouldAnimate }: GameCellProps) => {
  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-cell flex items-center justify-center">
      {player && (
        <motion.div
          initial={shouldAnimate ? { y: -200, opacity: 0.5 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className={`
            w-full h-full rounded-full
            ${player === 1 ? 'bg-player1' : 'bg-player2'}
            ${player === 1 ? 'glow-player-1' : 'glow-player-2'}
            ${isWinning ? 'animate-win-pulse glow-win' : ''}
          `}
        />
      )}
    </div>
  );
};
