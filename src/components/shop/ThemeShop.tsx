import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Theme } from '@/types/theme';
import { DiscShape } from '@/components/game/DiscShape';
import { useRewardedAd } from '@/hooks/useRewardedAd';

interface ThemeShopProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  selectedTheme: Theme;
  isThemeUnlocked: (themeId: string) => boolean;
  onUnlockTheme: (themeId: string) => boolean;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeShop = ({
  isOpen,
  onClose,
  themes,
  selectedTheme,
  isThemeUnlocked,
  onUnlockTheme,
  onSelectTheme,
}: ThemeShopProps) => {
  const [unlockingThemeId, setUnlockingThemeId] = useState<string | null>(null);
  const { showRewardedAd, isLoading: isAdLoading } = useRewardedAd();

  const handleUnlock = async (themeId: string) => {
    setUnlockingThemeId(themeId);
    
    const rewarded = await showRewardedAd();
    
    if (rewarded) {
      onUnlockTheme(themeId);
    }
    
    setUnlockingThemeId(null);
  };

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
          className="bg-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Theme Shop</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Themes grid */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => {
                const isUnlocked = isThemeUnlocked(theme.id);
                const isSelected = selectedTheme.id === theme.id;
                const isUnlocking = unlockingThemeId === theme.id;

                return (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative rounded-xl p-3 cursor-pointer transition-all
                      ${isSelected ? 'ring-2 ring-primary' : 'ring-1 ring-border'}
                      ${!isUnlocked ? 'opacity-80' : ''}
                    `}
                    style={{
                      background: theme.background_gradient || theme.board_color,
                    }}
                    onClick={() => {
                      if (isUnlocked) {
                        onSelectTheme(theme.id);
                      }
                    }}
                  >
                    {/* Theme preview */}
                    <div className="flex justify-center gap-2 mb-2">
                      <div className="w-8 h-8">
                        <DiscShape
                          shape={theme.disc_shape}
                          color={theme.disc_color_p1}
                        />
                      </div>
                      <div className="w-8 h-8">
                        <DiscShape
                          shape={theme.disc_shape}
                          color={theme.disc_color_p2}
                        />
                      </div>
                    </div>

                    {/* Theme name */}
                    <p className="text-center text-sm font-medium text-white text-shadow">
                      {theme.name}
                    </p>

                    {/* Status indicator */}
                    <div className="absolute top-2 right-2">
                      {isSelected ? (
                        <div className="bg-primary rounded-full p-1">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      ) : !isUnlocked ? (
                        <div className="bg-black/50 rounded-full p-1">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      ) : null}
                    </div>

                    {/* Free badge */}
                    {theme.is_free && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                        FREE
                      </div>
                    )}

                    {/* Unlock button overlay */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlock(theme.id);
                          }}
                          disabled={isUnlocking || isAdLoading}
                          className="gap-1"
                        >
                          {isUnlocking ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          Watch Ad
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Watch ads to unlock premium themes!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
