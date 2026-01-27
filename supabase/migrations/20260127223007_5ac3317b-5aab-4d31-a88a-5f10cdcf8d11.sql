-- Remove direct INSERT/UPDATE policies on player_stats
-- Stats should ONLY be modified through the validated record_game_result function

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert player stats" ON public.player_stats;
DROP POLICY IF EXISTS "Anyone can update player stats" ON public.player_stats;

-- Keep SELECT policy for leaderboard viewing (this is intentional for a public leaderboard)
-- The record_game_result function uses SECURITY DEFINER so it can still insert/update