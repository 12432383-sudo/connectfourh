import { useCallback, useEffect, useRef, useState } from 'react';

// PRODUCTION SETUP: Replace these test IDs with your real AdMob IDs
// See ADMOB_SETUP.md for complete instructions
const IS_PRODUCTION = false; // Set to true when ready for production

export const AD_CONFIG = {
  // Test IDs provided by Google - safe to use during development
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    appId: 'ca-app-pub-3940256099942544~3347511713',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    appId: 'ca-app-pub-3940256099942544~1458002511',
  },
};

type AdMobModule = typeof import('@capacitor-community/admob');

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const admobRef = useRef<AdMobModule | null>(null);
  const initAttemptedRef = useRef(false);

  // Initialize AdMob
  useEffect(() => {
    const initAdMob = async () => {
      if (initAttemptedRef.current) return;
      initAttemptedRef.current = true;

      try {
        // Dynamic import to avoid issues in web environment
        const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
        admobRef.current = { AdMob, BannerAdSize, BannerAdPosition } as any;

        // Check if running in Capacitor
        const { Capacitor } = await import('@capacitor/core');
        const isNative = Capacitor.isNativePlatform();
        setIsNativeApp(isNative);

        if (!isNative) {
          console.log('AdMob: Running in web mode - ads disabled');
          return;
        }

        await AdMob.initialize({
          testingDevices: [], // Add your test device IDs here during development
          initializeForTesting: !IS_PRODUCTION,
        });

        setIsInitialized(true);
        console.log('AdMob initialized successfully');
      } catch (error) {
        console.log('AdMob initialization skipped (web environment):', error);
      }
    };

    initAdMob();
  }, []);

  // Show banner ad
  const showBanner = useCallback(async () => {
    if (!isInitialized || !admobRef.current || isBannerVisible) return;

    try {
      const { AdMob, BannerAdSize, BannerAdPosition } = admobRef.current as any;
      const platform = (await import('@capacitor/core')).Capacitor.getPlatform();
      const adId = platform === 'ios' ? AD_CONFIG.ios.banner : AD_CONFIG.android.banner;

      await AdMob.showBanner({
        adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: !IS_PRODUCTION,
      });

      setIsBannerVisible(true);
      console.log('Banner ad shown');
    } catch (error) {
      console.error('Failed to show banner:', error);
    }
  }, [isInitialized, isBannerVisible]);

  // Hide banner ad
  const hideBanner = useCallback(async () => {
    if (!isInitialized || !admobRef.current || !isBannerVisible) return;

    try {
      const { AdMob } = admobRef.current as any;
      await AdMob.hideBanner();
      setIsBannerVisible(false);
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Failed to hide banner:', error);
    }
  }, [isInitialized, isBannerVisible]);

  // Prepare interstitial ad
  const prepareInterstitial = useCallback(async () => {
    if (!isInitialized || !admobRef.current) return;

    try {
      const { AdMob } = admobRef.current as any;
      const platform = (await import('@capacitor/core')).Capacitor.getPlatform();
      const adId = platform === 'ios' ? AD_CONFIG.ios.interstitial : AD_CONFIG.android.interstitial;

      await AdMob.prepareInterstitial({
        adId,
        isTesting: !IS_PRODUCTION,
      });

      setIsInterstitialLoaded(true);
      console.log('Interstitial ad prepared');
    } catch (error) {
      console.error('Failed to prepare interstitial:', error);
    }
  }, [isInitialized]);

  // Show interstitial ad
  const showInterstitial = useCallback(async () => {
    if (!isInitialized || !admobRef.current || !isInterstitialLoaded) return false;

    try {
      const { AdMob } = admobRef.current as any;
      await AdMob.showInterstitial();
      setIsInterstitialLoaded(false);
      console.log('Interstitial ad shown');

      // Prepare next interstitial
      setTimeout(() => prepareInterstitial(), 1000);
      return true;
    } catch (error) {
      console.error('Failed to show interstitial:', error);
      return false;
    }
  }, [isInitialized, isInterstitialLoaded, prepareInterstitial]);

  // Prepare interstitial when initialized
  useEffect(() => {
    if (isInitialized) {
      prepareInterstitial();
    }
  }, [isInitialized, prepareInterstitial]);

  return {
    isInitialized,
    isNativeApp,
    isBannerVisible,
    isInterstitialLoaded,
    showBanner,
    hideBanner,
    showInterstitial,
    prepareInterstitial,
  };
};
