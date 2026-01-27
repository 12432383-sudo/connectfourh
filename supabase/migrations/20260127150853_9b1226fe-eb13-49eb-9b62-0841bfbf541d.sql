-- Create player stats table to track wins
CREATE TABLE public.player_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_losses INTEGER NOT NULL DEFAULT 0,
  total_draws INTEGER NOT NULL DEFAULT 0,
  daily_wins INTEGER NOT NULL DEFAULT 0,
  weekly_wins INTEGER NOT NULL DEFAULT 0,
  last_win_at TIMESTAMP WITH TIME ZONE,
  daily_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weekly_reset_at DATE NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can view stats (public leaderboard)
CREATE POLICY "Anyone can view player stats"
ON public.player_stats
FOR SELECT
USING (true);

-- Anyone can insert their stats
CREATE POLICY "Anyone can insert player stats"
ON public.player_stats
FOR INSERT
WITH CHECK (true);

-- Anyone can update their own stats
CREATE POLICY "Anyone can update player stats"
ON public.player_stats
FOR UPDATE
USING (true);

-- Create trigger for timestamps
CREATE TRIGGER update_player_stats_updated_at
BEFORE UPDATE ON public.player_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to record a game result
CREATE OR REPLACE FUNCTION public.record_game_result(
  p_guest_id TEXT,
  p_display_name TEXT,
  p_result TEXT -- 'win', 'loss', or 'draw'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_daily_reset DATE;
  current_weekly_reset DATE;
BEGIN
  current_daily_reset := CURRENT_DATE;
  current_weekly_reset := date_trunc('week', CURRENT_DATE)::date;

  INSERT INTO public.player_stats (guest_id, display_name, total_wins, total_losses, total_draws, daily_wins, weekly_wins, last_win_at, daily_reset_at, weekly_reset_at)
  VALUES (
    p_guest_id,
    COALESCE(p_display_name, 'Player'),
    CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
    CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
    CASE WHEN p_result = 'draw' THEN 1 ELSE 0 END,
    CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
    CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
    CASE WHEN p_result = 'win' THEN now() ELSE NULL END,
    current_daily_reset,
    current_weekly_reset
  )
  ON CONFLICT (guest_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, player_stats.display_name),
    total_wins = player_stats.total_wins + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
    total_losses = player_stats.total_losses + CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
    total_draws = player_stats.total_draws + CASE WHEN p_result = 'draw' THEN 1 ELSE 0 END,
    -- Reset daily wins if it's a new day
    daily_wins = CASE 
      WHEN player_stats.daily_reset_at < current_daily_reset THEN 
        CASE WHEN p_result = 'win' THEN 1 ELSE 0 END
      ELSE 
        player_stats.daily_wins + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END
    END,
    daily_reset_at = current_daily_reset,
    -- Reset weekly wins if it's a new week
    weekly_wins = CASE 
      WHEN player_stats.weekly_reset_at < current_weekly_reset THEN 
        CASE WHEN p_result = 'win' THEN 1 ELSE 0 END
      ELSE 
        player_stats.weekly_wins + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END
    END,
    weekly_reset_at = current_weekly_reset,
    last_win_at = CASE WHEN p_result = 'win' THEN now() ELSE player_stats.last_win_at END,
    updated_at = now();
END;
$$;