export interface Theme {
  id: string;
  name: string;
  description: string | null;
  disc_color_p1: string;
  disc_color_p2: string;
  disc_shape: 'circle' | 'diamond' | 'star' | 'heart';
  board_color: string;
  background_gradient: string | null;
  price_coins: number;
  is_free: boolean;
}

export interface UnlockedThemes {
  themeIds: string[];
  coins: number;
}
