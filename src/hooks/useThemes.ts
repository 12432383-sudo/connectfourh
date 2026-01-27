import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Theme, UnlockedThemes } from '@/types/theme';

const UNLOCKED_THEMES_KEY = 'connect4_unlocked_themes';
const SELECTED_THEME_KEY = 'connect4_selected_theme';
const COINS_KEY = 'connect4_coins';

const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Classic',
  description: 'The original Connect 4 look',
  disc_color_p1: '#ef4444',
  disc_color_p2: '#facc15',
  disc_shape: 'circle',
  board_color: '#1e40af',
  background_gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  price_coins: 0,
  is_free: true,
};

export const useThemes = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(DEFAULT_THEME);
  const [coins, setCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load themes from database
  useEffect(() => {
    const fetchThemes = async () => {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('is_free', { ascending: false });

      if (!error && data) {
        const mappedThemes: Theme[] = data.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          disc_color_p1: t.disc_color_p1,
          disc_color_p2: t.disc_color_p2,
          disc_shape: t.disc_shape as Theme['disc_shape'],
          board_color: t.board_color,
          background_gradient: t.background_gradient,
          price_coins: t.price_coins,
          is_free: t.is_free,
        }));
        setThemes(mappedThemes);
      }
      setIsLoading(false);
    };

    fetchThemes();
  }, []);

  // Load local storage data
  useEffect(() => {
    const savedUnlocked = localStorage.getItem(UNLOCKED_THEMES_KEY);
    const savedSelected = localStorage.getItem(SELECTED_THEME_KEY);
    const savedCoins = localStorage.getItem(COINS_KEY);

    if (savedUnlocked) {
      setUnlockedThemeIds(JSON.parse(savedUnlocked));
    }

    if (savedCoins) {
      setCoins(parseInt(savedCoins, 10));
    }

    if (savedSelected && themes.length > 0) {
      const theme = themes.find(t => t.id === savedSelected);
      if (theme) setSelectedTheme(theme);
    }
  }, [themes]);

  // Update selected theme when themes load
  useEffect(() => {
    const savedSelected = localStorage.getItem(SELECTED_THEME_KEY);
    if (savedSelected && themes.length > 0) {
      const theme = themes.find(t => t.id === savedSelected);
      if (theme) setSelectedTheme(theme);
    } else if (themes.length > 0) {
      const freeTheme = themes.find(t => t.is_free);
      if (freeTheme) setSelectedTheme(freeTheme);
    }
  }, [themes]);

  const isThemeUnlocked = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    return theme?.is_free || unlockedThemeIds.includes(themeId);
  }, [themes, unlockedThemeIds]);

  const unlockTheme = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme || isThemeUnlocked(themeId)) return false;
    
    // Theme is unlocked by watching ads, no coin cost
    const newUnlocked = [...unlockedThemeIds, themeId];
    setUnlockedThemeIds(newUnlocked);
    localStorage.setItem(UNLOCKED_THEMES_KEY, JSON.stringify(newUnlocked));
    return true;
  }, [themes, unlockedThemeIds, isThemeUnlocked]);

  const selectTheme = useCallback((themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme && isThemeUnlocked(themeId)) {
      setSelectedTheme(theme);
      localStorage.setItem(SELECTED_THEME_KEY, themeId);
    }
  }, [themes, isThemeUnlocked]);

  const addCoins = useCallback((amount: number) => {
    setCoins(prev => {
      const newCoins = prev + amount;
      localStorage.setItem(COINS_KEY, newCoins.toString());
      return newCoins;
    });
  }, []);

  return {
    themes,
    selectedTheme,
    unlockedThemeIds,
    coins,
    isLoading,
    isThemeUnlocked,
    unlockTheme,
    selectTheme,
    addCoins,
  };
};
