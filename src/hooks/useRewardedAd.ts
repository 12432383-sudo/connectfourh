import { useState, useCallback } from 'react';
import { AdMob, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Test ad unit IDs - replace with your production IDs
const REWARDED_AD_ID = Capacitor.getPlatform() === 'ios'
  ? 'ca-app-pub-3940256099942544/1712485313'  // iOS test ID
  : 'ca-app-pub-3940256099942544/5224354917'; // Android test ID

export const useRewardedAd = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const prepareRewardedAd = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    setIsLoading(true);
    try {
      await AdMob.prepareRewardVideoAd({
        adId: REWARDED_AD_ID,
      });
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to prepare rewarded ad:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showRewardedAd = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      // For web, simulate watching an ad
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
    }

    return new Promise(async (resolve) => {
      let rewarded = false;

      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        (reward: AdMobRewardItem) => {
          console.log('Reward received:', reward);
          rewarded = true;
        }
      );

      const dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        async () => {
          rewardListener.remove();
          dismissListener.remove();
          setIsLoaded(false);
          resolve(rewarded);
          // Prepare next ad
          prepareRewardedAd();
        }
      );

      const failedListener = await AdMob.addListener(
        RewardAdPluginEvents.FailedToShow,
        () => {
          rewardListener.remove();
          dismissListener.remove();
          failedListener.remove();
          setIsLoaded(false);
          resolve(false);
          prepareRewardedAd();
        }
      );

      try {
        await AdMob.showRewardVideoAd();
      } catch (error) {
        console.error('Failed to show rewarded ad:', error);
        rewardListener.remove();
        dismissListener.remove();
        failedListener.remove();
        resolve(false);
      }
    });
  }, [prepareRewardedAd]);

  return {
    isLoading,
    isLoaded,
    prepareRewardedAd,
    showRewardedAd,
  };
};
