import { motion } from 'framer-motion';

export const AdBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full"
    >
      <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Advertisement</p>
        {/* 
          Ad placeholder - Replace with actual ad implementation:
          - For AdMob (Capacitor): Use @capacitor-community/admob
          - For web: Use Google AdSense or similar
          
          Example banner sizes:
          - Mobile: 320x50 (standard banner)
          - Tablet: 728x90 (leaderboard)
        */}
        <div 
          className="mx-auto bg-muted/50 rounded flex items-center justify-center text-muted-foreground text-sm"
          style={{ 
            width: '100%', 
            maxWidth: '320px', 
            height: '50px' 
          }}
        >
          <span className="opacity-50">Ad Space (320×50)</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Integrate AdMob for native apps
        </p>
      </div>
    </motion.div>
  );
};
