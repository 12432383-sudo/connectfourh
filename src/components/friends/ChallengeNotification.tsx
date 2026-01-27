import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFriends, GameChallenge } from '@/hooks/useFriends';
import { Theme } from '@/types/theme';

interface ChallengeNotificationProps {
  selectedTheme: Theme;
  onAccept: (gameId: string) => void;
}

export const ChallengeNotification: React.FC<ChallengeNotificationProps> = ({
  selectedTheme,
  onAccept,
}) => {
  const { incomingChallenges, acceptChallenge, declineChallenge } = useFriends();
  const [visibleChallenge, setVisibleChallenge] = useState<GameChallenge | null>(null);

  useEffect(() => {
    if (incomingChallenges.length > 0 && !visibleChallenge) {
      setVisibleChallenge(incomingChallenges[0]);
    }
  }, [incomingChallenges, visibleChallenge]);

  const handleAccept = async () => {
    if (!visibleChallenge) return;
    
    const result = await acceptChallenge(visibleChallenge.id, selectedTheme);
    if (result.success && result.gameId) {
      setVisibleChallenge(null);
      onAccept(result.gameId);
    }
  };

  const handleDecline = async () => {
    if (!visibleChallenge) return;
    
    await declineChallenge(visibleChallenge.id);
    setVisibleChallenge(null);
  };

  return (
    <AnimatePresence>
      {visibleChallenge && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
          <div className="bg-card border border-primary rounded-xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Swords className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Challenge!</h3>
                <p className="text-sm text-muted-foreground">
                  {visibleChallenge.challengerName} wants to play
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleAccept} className="flex-1">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDecline} className="flex-1">
                    Decline
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDecline}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
