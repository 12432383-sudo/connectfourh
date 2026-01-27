import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'allTime';

export interface PlayerStats {
  id: string;
  guest_id: string;
  display_name: string | null;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  daily_wins: number;
  weekly_wins: number;
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [period, setPeriod] = useState<LeaderboardPeriod>('allTime');
  const [isLoading, setIsLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  const fetchLeaderboard = useCallback(async (selectedPeriod: LeaderboardPeriod) => {
    setIsLoading(true);
    
    let orderColumn = 'total_wins';
    if (selectedPeriod === 'daily') {
      orderColumn = 'daily_wins';
    } else if (selectedPeriod === 'weekly') {
      orderColumn = 'weekly_wins';
    }

    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .order(orderColumn, { ascending: false })
      .limit(50);

    if (!error && data) {
      setLeaderboard(data);
    }
    setIsLoading(false);
  }, []);

  const findMyRank = useCallback(async (guestId: string, selectedPeriod: LeaderboardPeriod) => {
    let orderColumn = 'total_wins';
    if (selectedPeriod === 'daily') {
      orderColumn = 'daily_wins';
    } else if (selectedPeriod === 'weekly') {
      orderColumn = 'weekly_wins';
    }

    // Get my stats
    const { data: myStats } = await supabase
      .from('player_stats')
      .select('*')
      .eq('guest_id', guestId)
      .single();

    if (myStats) {
      const myWins = selectedPeriod === 'daily' 
        ? myStats.daily_wins 
        : selectedPeriod === 'weekly' 
          ? myStats.weekly_wins 
          : myStats.total_wins;

      // Count players with more wins
      const { count } = await supabase
        .from('player_stats')
        .select('*', { count: 'exact', head: true })
        .gt(orderColumn, myWins);

      setMyRank((count || 0) + 1);
    } else {
      setMyRank(null);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  const recordGameResult = useCallback(async (
    guestId: string,
    displayName: string,
    result: 'win' | 'loss' | 'draw'
  ) => {
    await supabase.rpc('record_game_result', {
      p_guest_id: guestId,
      p_display_name: displayName,
      p_result: result,
    });
    
    // Refresh leaderboard after recording result
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  return {
    leaderboard,
    period,
    setPeriod,
    isLoading,
    myRank,
    findMyRank,
    recordGameResult,
    refreshLeaderboard: () => fetchLeaderboard(period),
  };
};
