import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Medal, Award, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeaderboard, LeaderboardPeriod, PlayerStats } from '@/hooks/useLeaderboard';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  myGuestId?: string;
}

const periodLabels: Record<LeaderboardPeriod, string> = {
  daily: 'Today',
  weekly: 'This Week',
  allTime: 'All Time',
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-amber-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-slate-300" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
  }
};

const getWins = (player: PlayerStats, period: LeaderboardPeriod) => {
  switch (period) {
    case 'daily':
      return player.daily_wins;
    case 'weekly':
      return player.weekly_wins;
    case 'allTime':
      return player.total_wins;
  }
};

export const Leaderboard = ({ isOpen, onClose, myGuestId }: LeaderboardProps) => {
  const { leaderboard, period, setPeriod, isLoading, myRank, findMyRank } = useLeaderboard();

  useEffect(() => {
    if (isOpen && myGuestId) {
      findMyRank(myGuestId, period);
    }
  }, [isOpen, myGuestId, period, findMyRank]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Period selector */}
          <div className="flex gap-2 p-4 border-b border-border">
            {(Object.keys(periodLabels) as LeaderboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${period === p 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* My rank */}
          {myRank && (
            <div className="px-4 py-3 bg-primary/10 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your Rank</span>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-bold text-foreground">#{myRank}</span>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard list */}
          <div className="overflow-y-auto max-h-[50vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No players yet</p>
                <p className="text-sm">Be the first to play online!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {leaderboard.map((player, index) => {
                  const rank = index + 1;
                  const isMe = player.guest_id === myGuestId;
                  const wins = getWins(player, period);

                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`
                        flex items-center gap-3 px-4 py-3
                        ${isMe ? 'bg-primary/10' : ''}
                        ${rank <= 3 ? 'bg-gradient-to-r from-transparent to-transparent' : ''}
                      `}
                    >
                      {/* Rank */}
                      <div className="w-8 flex justify-center">
                        {getRankIcon(rank)}
                      </div>

                      {/* Player info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                          {player.display_name || 'Anonymous'}
                          {isMe && <span className="text-xs ml-2 text-primary">(You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {player.total_wins}W / {player.total_losses}L / {player.total_draws}D
                        </p>
                      </div>

                      {/* Wins count */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">{wins}</p>
                        <p className="text-xs text-muted-foreground">wins</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Play online matches to climb the leaderboard!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
