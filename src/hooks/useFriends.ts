import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGuestId } from './useGuestId';
import { Theme } from '@/types/theme';
import { Json } from '@/integrations/supabase/types';

export interface Friend {
  id: string;
  guestId: string;
  displayName: string;
  status: 'pending' | 'accepted' | 'blocked';
  isRequester: boolean;
}

export interface GameChallenge {
  id: string;
  challengerGuestId: string;
  challengerName: string;
  gameId: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export const useFriends = () => {
  const guestId = useGuestId();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<GameChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const challengeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const friendsChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchFriends = useCallback(async () => {
    if (!guestId) return;

    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`requester_guest_id.eq.${guestId},addressee_guest_id.eq.${guestId}`);

    if (error) {
      console.error('Error fetching friends:', error);
      return;
    }

    const friendsList: Friend[] = [];
    const pendingList: Friend[] = [];

    for (const row of data || []) {
      const isRequester = row.requester_guest_id === guestId;
      const friendGuestId = isRequester ? row.addressee_guest_id : row.requester_guest_id;

      // Get display name from player_stats
      const { data: statsData } = await supabase
        .from('player_stats')
        .select('display_name')
        .eq('guest_id', friendGuestId)
        .maybeSingle();

      const friend: Friend = {
        id: row.id,
        guestId: friendGuestId,
        displayName: statsData?.display_name || 'Unknown Player',
        status: row.status as Friend['status'],
        isRequester,
      };

      if (row.status === 'accepted') {
        friendsList.push(friend);
      } else if (row.status === 'pending') {
        pendingList.push(friend);
      }
    }

    setFriends(friendsList);
    setPendingRequests(pendingList);
    setLoading(false);
  }, [guestId]);

  const fetchChallenges = useCallback(async () => {
    if (!guestId) return;

    const { data, error } = await supabase
      .from('game_challenges')
      .select('*')
      .eq('challenged_guest_id', guestId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error fetching challenges:', error);
      return;
    }

    const challenges: GameChallenge[] = [];
    for (const row of data || []) {
      const { data: statsData } = await supabase
        .from('player_stats')
        .select('display_name')
        .eq('guest_id', row.challenger_guest_id)
        .maybeSingle();

      challenges.push({
        id: row.id,
        challengerGuestId: row.challenger_guest_id,
        challengerName: statsData?.display_name || 'Unknown Player',
        gameId: row.game_id,
        status: row.status as GameChallenge['status'],
        createdAt: row.created_at,
        expiresAt: row.expires_at,
      });
    }

    setIncomingChallenges(challenges);
  }, [guestId]);

  const sendFriendRequest = useCallback(async (friendCode: string): Promise<{ success: boolean; message: string }> => {
    if (!guestId) return { success: false, message: 'Not initialized' };
    if (friendCode === guestId) return { success: false, message: 'Cannot add yourself' };

    // Check if player exists
    const { data: playerData } = await supabase
      .from('player_stats')
      .select('guest_id')
      .eq('guest_id', friendCode)
      .maybeSingle();

    if (!playerData) {
      return { success: false, message: 'Player not found' };
    }

    // Check if already friends or pending
    const { data: existingData } = await supabase
      .from('friends')
      .select('*')
      .or(`and(requester_guest_id.eq.${guestId},addressee_guest_id.eq.${friendCode}),and(requester_guest_id.eq.${friendCode},addressee_guest_id.eq.${guestId})`)
      .maybeSingle();

    if (existingData) {
      if (existingData.status === 'accepted') {
        return { success: false, message: 'Already friends' };
      }
      if (existingData.status === 'pending') {
        return { success: false, message: 'Request already pending' };
      }
    }

    const { error } = await supabase
      .from('friends')
      .insert({
        requester_guest_id: guestId,
        addressee_guest_id: friendCode,
        status: 'pending',
      });

    if (error) {
      console.error('Error sending friend request:', error);
      return { success: false, message: 'Failed to send request' };
    }

    await fetchFriends();
    return { success: true, message: 'Friend request sent!' };
  }, [guestId, fetchFriends]);

  const acceptFriendRequest = useCallback(async (friendId: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', friendId);

    if (error) {
      console.error('Error accepting friend request:', error);
      return;
    }

    await fetchFriends();
  }, [fetchFriends]);

  const declineFriendRequest = useCallback(async (friendId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendId);

    if (error) {
      console.error('Error declining friend request:', error);
      return;
    }

    await fetchFriends();
  }, [fetchFriends]);

  const removeFriend = useCallback(async (friendId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendId);

    if (error) {
      console.error('Error removing friend:', error);
      return;
    }

    await fetchFriends();
  }, [fetchFriends]);

  const challengeFriend = useCallback(async (friendGuestId: string, selectedTheme: Theme): Promise<{ success: boolean; gameId?: string }> => {
    if (!guestId) return { success: false };

    // Create a new game
    const { data: newGame, error: gameError } = await supabase
      .from('online_games')
      .insert({
        player1_guest_id: guestId,
        player2_guest_id: friendGuestId,
        player1_theme: selectedTheme as unknown as Json,
        status: 'waiting',
      })
      .select()
      .single();

    if (gameError || !newGame) {
      console.error('Error creating challenge game:', gameError);
      return { success: false };
    }

    // Create the challenge
    const { error: challengeError } = await supabase
      .from('game_challenges')
      .insert({
        challenger_guest_id: guestId,
        challenged_guest_id: friendGuestId,
        game_id: newGame.id,
        status: 'pending',
      });

    if (challengeError) {
      console.error('Error creating challenge:', challengeError);
      return { success: false };
    }

    return { success: true, gameId: newGame.id };
  }, [guestId]);

  const acceptChallenge = useCallback(async (challengeId: string, selectedTheme: Theme): Promise<{ success: boolean; gameId?: string }> => {
    // Get the challenge
    const { data: challenge } = await supabase
      .from('game_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (!challenge || !challenge.game_id) {
      return { success: false };
    }

    // Update challenge status
    await supabase
      .from('game_challenges')
      .update({ status: 'accepted' })
      .eq('id', challengeId);

    // Update game with player 2 theme and set to playing
    await supabase
      .from('online_games')
      .update({
        player2_theme: selectedTheme as unknown as Json,
        status: 'playing',
      })
      .eq('id', challenge.game_id);

    await fetchChallenges();
    return { success: true, gameId: challenge.game_id };
  }, [fetchChallenges]);

  const declineChallenge = useCallback(async (challengeId: string) => {
    const { data: challenge } = await supabase
      .from('game_challenges')
      .select('game_id')
      .eq('id', challengeId)
      .single();

    await supabase
      .from('game_challenges')
      .update({ status: 'declined' })
      .eq('id', challengeId);

    // Delete the game if it exists
    if (challenge?.game_id) {
      await supabase
        .from('online_games')
        .delete()
        .eq('id', challenge.game_id);
    }

    await fetchChallenges();
  }, [fetchChallenges]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!guestId) return;

    fetchFriends();
    fetchChallenges();

    // Subscribe to challenge updates
    const challengeChannel = supabase
      .channel(`challenges_${guestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_challenges',
          filter: `challenged_guest_id=eq.${guestId}`,
        },
        () => {
          fetchChallenges();
        }
      )
      .subscribe();

    challengeChannelRef.current = challengeChannel;

    // Subscribe to friends updates
    const friendsChannel = supabase
      .channel(`friends_${guestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
        },
        () => {
          fetchFriends();
        }
      )
      .subscribe();

    friendsChannelRef.current = friendsChannel;

    return () => {
      if (challengeChannelRef.current) {
        supabase.removeChannel(challengeChannelRef.current);
      }
      if (friendsChannelRef.current) {
        supabase.removeChannel(friendsChannelRef.current);
      }
    };
  }, [guestId, fetchFriends, fetchChallenges]);

  return {
    friends,
    pendingRequests,
    incomingChallenges,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    challengeFriend,
    acceptChallenge,
    declineChallenge,
    guestId,
  };
};
