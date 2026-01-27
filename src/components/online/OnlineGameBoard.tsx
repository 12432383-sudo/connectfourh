import { motion } from 'framer-motion';
import { Theme } from '@/types/theme';
import { DiscShape } from '@/components/game/DiscShape';

interface OnlineGameBoardProps {
  board: number[][];
  winningCells: [number, number][] | null;
  lastMove: { row: number; col: number } | null;
  onColumnClick: (col: number) => void;
  disabled: boolean;
  currentPlayer: number;
  playerNumber: 1 | 2;
  myTheme: Theme;
  opponentTheme: Theme | null;
}

export const OnlineGameBoard = ({
  board,
  winningCells,
  lastMove,
  onColumnClick,
  disabled,
  currentPlayer,
  playerNumber,
  myTheme,
  opponentTheme,
}: OnlineGameBoardProps) => {
  const isMyTurn = currentPlayer === playerNumber;

  const getDiscColor = (player: number) => {
    if (player === playerNumber) {
      return playerNumber === 1 ? myTheme.disc_color_p1 : myTheme.disc_color_p2;
    } else {
      if (opponentTheme) {
        return player === 1 ? opponentTheme.disc_color_p1 : opponentTheme.disc_color_p2;
      }
      return player === 1 ? '#ef4444' : '#facc15';
    }
  };

  const getDiscShape = (player: number) => {
    if (player === playerNumber) {
      return myTheme.disc_shape;
    } else {
      return opponentTheme?.disc_shape || 'circle';
    }
  };

  const isWinningCell = (row: number, col: number) => {
    return winningCells?.some(([r, c]) => r === row && c === col) || false;
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove?.row === row && lastMove?.col === col;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Turn indicator */}
      <div className={`text-center mb-4 py-2 px-4 rounded-lg ${
        isMyTurn ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
      }`}>
        {isMyTurn ? "Your turn!" : "Opponent's turn..."}
      </div>

      {/* Board */}
      <div
        className="rounded-xl p-2 sm:p-3"
        style={{ backgroundColor: myTheme.board_color }}
      >
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                whileHover={!disabled && cell === 0 ? { scale: 1.05 } : {}}
                whileTap={!disabled && cell === 0 ? { scale: 0.95 } : {}}
                onClick={() => !disabled && cell === 0 && onColumnClick(colIndex)}
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full 
                  bg-black/30 flex items-center justify-center
                  ${!disabled && cell === 0 ? 'cursor-pointer hover:bg-black/40' : ''}
                  ${disabled ? 'cursor-not-allowed' : ''}
                `}
              >
                {cell !== 0 && (
                  <DiscShape
                    shape={getDiscShape(cell)}
                    color={getDiscColor(cell)}
                    isWinning={isWinningCell(rowIndex, colIndex)}
                    shouldAnimate={isLastMove(rowIndex, colIndex)}
                  />
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};
