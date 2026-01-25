import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdMob } from '@/hooks/useAdMob';
import { Smartphone } from 'lucide-react';

interface AdBannerProps {
  className?: string;
}

export const AdBanner = ({ className }: AdBannerProps) => {
  const { isNativeApp, isInitialized, showBanner, isBannerVisible } = useAdMob();

  // Show native banner when component mounts (for native apps)
  useEffect(() => {
    if (isNativeApp && isInitialized && !isBannerVisible) {
      showBanner();
    }
  }, [isNativeApp, isInitialized, isBannerVisible, showBanner]);

  // For native apps, the banner is rendered by AdMob natively
  // We just need a spacer to prevent content from being hidden
  if (isNativeApp && isBannerVisible) {
    return (
      <div 
        className={`w-full ${className}`}
        style={{ height: '60px' }} // Space for native banner
      />
    );
  }

  // Web fallback - show placeholder
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`w-full ${className}`}
    >
      <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">Advertisement</p>
        
        <div 
          className="mx-auto bg-muted/50 rounded flex flex-col items-center justify-center text-muted-foreground gap-2"
          style={{ 
            width: '100%', 
            maxWidth: '320px', 
            height: '60px' 
          }}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">AdMob Banner (320×50)</span>
          </div>
          <span className="text-[10px] opacity-60">
            {isNativeApp ? 'Loading...' : 'Displays in native app'}
          </span>
        </div>

        <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
          <p>✓ Test ads configured for development</p>
          <p>✓ Replace with production IDs before publishing</p>
        </div>
      </div>
    </motion.div>
  );
};
