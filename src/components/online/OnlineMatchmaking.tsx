import { motion } from 'framer-motion';
import { Loader2, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnlineGameStatus } from '@/hooks/useOnlineGame';

interface OnlineMatchmakingProps {
  status: OnlineGameStatus;
  onFindMatch: () => void;
  onCancel: () => void;
}

export const OnlineMatchmaking = ({
  status,
  onFindMatch,
  onCancel,
}: OnlineMatchmakingProps) => {
  if (status === 'searching') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-card rounded-2xl p-8 text-center max-w-sm w-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
          >
            <Loader2 className="w-12 h-12 text-primary" />
          </motion.div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">
            Finding Opponent...
          </h2>
          <p className="text-muted-foreground mb-6">
            Looking for a worthy challenger
          </p>

          <motion.div
            className="flex justify-center gap-1 mb-6"
            initial="initial"
            animate="animate"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>

          <Button variant="outline" onClick={onCancel} className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-4"
    >
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Wifi className="w-5 h-5" />
        <span>Play Online</span>
      </div>
      
      <Button
        size="lg"
        onClick={onFindMatch}
        className="gap-2 px-8"
      >
        <Wifi className="w-5 h-5" />
        Find Match
      </Button>

      <p className="text-xs text-muted-foreground">
        Play against real players worldwide
      </p>
    </motion.div>
  );
};
