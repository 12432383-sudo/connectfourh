import { useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App, type AppState } from '@capacitor/app';

interface AppLifecycleOptions {
  onPause?: () => void;
  onResume?: () => void;
  onBackButton?: () => boolean; // Return true to prevent default back behavior
}

/**
 * Hook for handling app lifecycle events on native platforms
 * - Pause/Resume for game state management
 * - Back button handling for Android
 */
export const useAppLifecycle = (options: AppLifecycleOptions = {}) => {
  const { onPause, onResume, onBackButton } = options;
  const isPausedRef = useRef(false);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleStateChange = (state: AppState) => {
      if (state.isActive) {
        // App came to foreground
        if (isPausedRef.current) {
          isPausedRef.current = false;
          onResume?.();
        }
      } else {
        // App went to background
        if (!isPausedRef.current) {
          isPausedRef.current = true;
          onPause?.();
        }
      }
    };

    let listener: { remove: () => void } | null = null;

    App.addListener('appStateChange', handleStateChange).then(l => {
      listener = l;
    });

    return () => {
      listener?.remove();
    };
  }, [onPause, onResume]);

  // Handle Android back button
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

    let listener: { remove: () => void } | null = null;

    App.addListener('backButton', () => {
      // Let the callback decide if we should handle it
      const handled = onBackButton?.() ?? false;
      
      if (!handled) {
        // Default behavior: exit app if on main screen
        // This allows the app to exit naturally
        App.exitApp();
      }
    }).then(l => {
      listener = l;
    });

    return () => {
      listener?.remove();
    };
  }, [onBackButton]);

  // Utility to manually pause/resume audio or other resources
  const pauseGame = useCallback(() => {
    isPausedRef.current = true;
    onPause?.();
  }, [onPause]);

  const resumeGame = useCallback(() => {
    isPausedRef.current = false;
    onResume?.();
  }, [onResume]);

  return {
    isPaused: isPausedRef.current,
    pauseGame,
    resumeGame,
  };
};
