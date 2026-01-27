import { motion } from 'framer-motion';

interface DiscShapeProps {
  shape: 'circle' | 'diamond' | 'star' | 'heart';
  color: string;
  isWinning?: boolean;
  shouldAnimate?: boolean;
  className?: string;
}

export const DiscShape = ({ shape, color, isWinning, shouldAnimate, className = '' }: DiscShapeProps) => {
  const baseClass = `w-full h-full ${isWinning ? 'animate-win-pulse' : ''} ${className}`;
  
  const style = {
    filter: isWinning ? `drop-shadow(0 0 8px ${color})` : `drop-shadow(0 2px 4px ${color}40)`,
  };

  if (shape === 'circle') {
    return (
      <motion.div
        initial={shouldAnimate ? { y: -200, opacity: 0.5 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${baseClass} rounded-full`}
        style={{ backgroundColor: color, ...style }}
      />
    );
  }

  if (shape === 'diamond') {
    return (
      <motion.div
        initial={shouldAnimate ? { y: -200, opacity: 0.5 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${baseClass} flex items-center justify-center`}
      >
        <div 
          className="w-[70%] h-[70%] rotate-45"
          style={{ backgroundColor: color, ...style }}
        />
      </motion.div>
    );
  }

  if (shape === 'star') {
    return (
      <motion.div
        initial={shouldAnimate ? { y: -200, opacity: 0.5 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${baseClass} flex items-center justify-center`}
      >
        <svg viewBox="0 0 24 24" className="w-[85%] h-[85%]" style={style}>
          <path
            fill={color}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      </motion.div>
    );
  }

  if (shape === 'heart') {
    return (
      <motion.div
        initial={shouldAnimate ? { y: -200, opacity: 0.5 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${baseClass} flex items-center justify-center`}
      >
        <svg viewBox="0 0 24 24" className="w-[85%] h-[85%]" style={style}>
          <path
            fill={color}
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </motion.div>
    );
  }

  return null;
};
