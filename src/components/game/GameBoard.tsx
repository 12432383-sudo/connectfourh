import { motion } from 'framer-motion';
import { Board, Player } from '@/hooks/useGameLogic';
import { GameCell } from './GameCell';

interface GameBoardProps {
  board: Board;
  winningCells: number[][] | null;
  lastMove: { row: number; col: number } | null;
  onColumnClick: (col: number) => void;
  disabled: boolean;
  currentPlayer: Player;
}

export const GameBoard = ({
  board,
  winningCells,
  lastMove,
  onColumnClick,
  disabled,
  currentPlayer,
}: GameBoardProps) => {
  const isWinningCell = (row: number, col: number) =>
    winningCells?.some(([r, c]) => r === row && c === col) ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative"
    >
      <div className="bg-board p-3 sm:p-4 rounded-2xl board-shadow">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array(7)
            .fill(null)
            .map((_, col) => (
              <button
                key={col}
                onClick={() => onColumnClick(col)}
                disabled={disabled || board[0][col] !== null}
                className="flex flex-col gap-1.5 sm:gap-2 group focus:outline-none"
                aria-label={`Drop disc in column ${col + 1}`}
              >
                {/* Hover indicator */}
                <motion.div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full 
                    opacity-0 group-hover:opacity-60 transition-opacity duration-200
                    ${currentPlayer === 1 ? 'bg-player1' : 'bg-player2'}
                    ${disabled || board[0][col] !== null ? 'group-hover:opacity-0' : ''}
                  `}
                />
                {board.map((row, rowIndex) => (
                  <GameCell
                    key={`${rowIndex}-${col}`}
                    player={row[col]}
                    isWinning={isWinningCell(rowIndex, col)}
                    isLastMove={lastMove?.row === rowIndex && lastMove?.col === col}
                    shouldAnimate={lastMove?.row === rowIndex && lastMove?.col === col}
                  />
                ))}
              </button>
            ))}
        </div>
      </div>
    </motion.div>
  );
};
