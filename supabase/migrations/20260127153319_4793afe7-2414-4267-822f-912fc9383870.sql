-- Fix the record_game_result function with proper input validation
-- This function is SECURITY DEFINER so we need to add validation

DROP FUNCTION IF EXISTS public.record_game_result(text, text, text);

CREATE OR REPLACE FUNCTION public.record_game_result(p_guest_id text, p_display_name text, p_result text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_daily_reset DATE;
  current_weekly_reset DATE;
  sanitized_display_name TEXT;
BEGIN
  -- Input validation: Validate result is one of allowed values
  IF p_result NOT IN ('win', 'loss', 'draw') THEN
    RAISE EXCEPTION 'Invalid result value. Must be win, loss, or draw.';
  END IF;

  -- Input validation: Validate guest_id format (must match expected pattern)
  IF p_guest_id IS NULL OR length(p_guest_id) < 10 OR length(p_guest_id) > 100 THEN
    RAISE EXCEPTION 'Invalid guest_id format.';
  END IF;

  -- Input validation: Sanitize display name (limit length, remove dangerous characters)
  sanitized_display_name := COALESCE(
    substring(regexp_replace(p_display_name, '[<>"''\\]', '', 'g') FROM 1 FOR 50),
    'Player'
  );

  current_daily_reset := CURRENT_DATE;
  current_weekly_reset := date_trunc('week', CURRENT_DATE)::date;

  INSERT INTO public.player_stats (guest_id, display_name, total_wins, total_losses, total_draws, daily_wins, weekly_wins, last_win_at, daily_reset_at, weekly_reset_at)
  VALUES (
    p_guest_id,
    sanitized_display_name,
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
$function$;