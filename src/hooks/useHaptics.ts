import { useCallback, useEffect, useRef, useState } from 'react';

export const useHaptics = (enabled: boolean) => {
  const [isNativeApp, setIsNativeApp] = useState(false);
  const hapticsRef = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        const isNative = Capacitor.isNativePlatform();
        setIsNativeApp(isNative);

        if (isNative) {
          const { Haptics } = await import('@capacitor/haptics');
          hapticsRef.current = Haptics;
        }
      } catch (error) {
        console.log('Haptics not available');
      }
    };

    init();
  }, []);

  const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!enabled || !isNativeApp || !hapticsRef.current) return;

    try {
      const { ImpactStyle } = await import('@capacitor/haptics');
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      await hapticsRef.current.impact({ style: styleMap[style] });
    } catch (error) {
      console.log('Haptic impact failed');
    }
  }, [enabled, isNativeApp]);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!enabled || !isNativeApp || !hapticsRef.current) return;

    try {
      const { NotificationType } = await import('@capacitor/haptics');
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };
      await hapticsRef.current.notification({ type: typeMap[type] });
    } catch (error) {
      console.log('Haptic notification failed');
    }
  }, [enabled, isNativeApp]);

  const vibrate = useCallback(async (duration: number = 300) => {
    if (!enabled || !isNativeApp || !hapticsRef.current) return;

    try {
      await hapticsRef.current.vibrate({ duration });
    } catch (error) {
      console.log('Vibrate failed');
    }
  }, [enabled, isNativeApp]);

  return { impact, notification, vibrate, isNativeApp };
};
