import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Info, 
  FileText, 
  Shield,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticsEnabled?: boolean;
  onToggleHaptics?: () => void;
}

export const SettingsMenu = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  hapticsEnabled = true,
  onToggleHaptics,
}: SettingsMenuProps) => {
  const appVersion = '1.0.0';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 top-auto max-w-md mx-auto bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Settings Content */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Sound Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Audio & Feedback
                </h3>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-primary" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-xs text-muted-foreground">Game sounds and UI feedback</p>
                    </div>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={onToggleSound}
                  />
                </div>

                {onToggleHaptics && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Vibrate className={`w-5 h-5 ${hapticsEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium">Vibration</p>
                        <p className="text-xs text-muted-foreground">Haptic feedback on actions</p>
                      </div>
                    </div>
                    <Switch
                      checked={hapticsEnabled}
                      onCheckedChange={onToggleHaptics}
                    />
                  </div>
                )}
              </div>

              {/* Legal & Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Legal & Information
                </h3>
                
                <Link
                  to="/privacy"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <p className="font-medium">Privacy Policy</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </Link>

                <Link
                  to="/terms"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <p className="font-medium">Terms of Service</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>

              {/* App Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  About
                </h3>
                
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Connect Four</p>
                      <p className="text-xs text-muted-foreground">Version {appVersion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                © 2025 Connect Four. All rights reserved.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
