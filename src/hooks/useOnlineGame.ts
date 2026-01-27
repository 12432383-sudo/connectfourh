import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGuestId } from './useGuestId';
import { Theme } from '@/types/theme';
import { Json } from '@/integrations/supabase/types';

export type OnlineGameStatus = 'idle' | 'searching' | 'matched' | 'playing' | 'finished';

interface OnlineGame {
  id: string;
  player1_guest_id: string;
  player2_guest_id: string | null;
  board: number[][];
  current_player: number;
  winner: number | null;
  is_game_over: boolean;
  winning_cells: [number, number][] | null;
  last_move: { row: number; col: number } | null;
  player1_theme: Theme | null;
  player2_theme: Theme | null;
  status: string;
}

export const useOnlineGame = (selectedTheme: Theme) => {
  const guestId = useGuestId();
  const [status, setStatus] = useState<OnlineGameStatus>('idle');
  const [game, setGame] = useState<OnlineGame | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [opponentTheme, setOpponentTheme] = useState<Theme | null>(null);
  const queueEntryRef = useRef<string | null>(null);
  const gameChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (queueEntryRef.current) {
        supabase.from('matchmaking_queue').delete().eq('id', queueEntryRef.current);
      }
      if (gameChannelRef.current) {
        supabase.removeChannel(gameChannelRef.current);
      }
    };
  }, []);

  const findMatch = useCallback(async () => {
    if (!guestId) return;
    
    setStatus('searching');

    // First, look for waiting players
    const { data: waitingPlayers } = await supabase
      .from('matchmaking_queue')
      .select('*')
      .eq('status', 'waiting')
      .neq('guest_id', guestId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (waitingPlayers && waitingPlayers.length > 0) {
      const opponent = waitingPlayers[0];
      
      // Create a new game
      const { data: newGame, error: gameError } = await supabase
        .from('online_games')
        .insert({
          player1_guest_id: opponent.guest_id,
          player2_guest_id: guestId,
          player1_theme: null, // Will be set by player 1
          player2_theme: selectedTheme as unknown as Json,
          status: 'playing',
        })
        .select()
        .single();

      if (gameError || !newGame) {
        console.error('Error creating game:', gameError);
        setStatus('idle');
        return;
      }

      // Update opponent's queue entry
      await supabase
        .from('matchmaking_queue')
        .update({ status: 'matched', game_id: newGame.id })
        .eq('id', opponent.id);

      setPlayerNumber(2);
      setGame({
        ...newGame,
        board: (newGame.board as Json) as number[][],
        winning_cells: newGame.winning_cells as [number, number][] | null,
        last_move: newGame.last_move as { row: number; col: number } | null,
        player1_theme: newGame.player1_theme as unknown as Theme | null,
        player2_theme: newGame.player2_theme as unknown as Theme | null,
      });
      setStatus('playing');
      subscribeToGame(newGame.id);
    } else {
      // No waiting players, join the queue
      const { data: queueEntry, error: queueError } = await supabase
        .from('matchmaking_queue')
        .insert({
          guest_id: guestId,
          status: 'waiting',
        })
        .select()
        .single();

      if (queueError || !queueEntry) {
        console.error('Error joining queue:', queueError);
        setStatus('idle');
        return;
      }

      queueEntryRef.current = queueEntry.id;

      // Subscribe to queue updates
      const channel = supabase
        .channel(`queue_${queueEntry.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'matchmaking_queue',
            filter: `id=eq.${queueEntry.id}`,
          },
          async (payload) => {
            const updated = payload.new as { status: string; game_id: string | null };
            if (updated.status === 'matched' && updated.game_id) {
              // We've been matched!
              const { data: gameData } = await supabase
                .from('online_games')
                .select('*')
                .eq('id', updated.game_id)
                .single();

              if (gameData) {
                // Update our theme
                await supabase
                  .from('online_games')
                  .update({ player1_theme: selectedTheme as unknown as Json })
                  .eq('id', gameData.id);

              setPlayerNumber(1);
                setGame({
                  ...gameData,
                  board: (gameData.board as Json) as number[][],
                  winning_cells: gameData.winning_cells as [number, number][] | null,
                  last_move: gameData.last_move as { row: number; col: number } | null,
                  player1_theme: selectedTheme,
                  player2_theme: gameData.player2_theme as unknown as Theme | null,
                });
                setOpponentTheme(gameData.player2_theme as unknown as Theme | null);
                setStatus('playing');
                subscribeToGame(gameData.id);
              }

              // Clean up queue subscription
              supabase.removeChannel(channel);

              // Delete queue entry
              await supabase.from('matchmaking_queue').delete().eq('id', queueEntry.id);
              queueEntryRef.current = null;
            }
          }
        )
        .subscribe();
    }
  }, [guestId, selectedTheme]);

  const subscribeToGame = useCallback((gameId: string) => {
    if (gameChannelRef.current) {
      supabase.removeChannel(gameChannelRef.current);
    }

    const channel = supabase
      .channel(`game_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'online_games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const updated = payload.new;
          setGame(prev => {
            if (!prev) return null;
            return {
              ...prev,
              board: (updated.board as Json) as number[][],
              current_player: updated.current_player as number,
              winner: updated.winner as number | null,
              is_game_over: updated.is_game_over as boolean,
              winning_cells: updated.winning_cells as [number, number][] | null,
              last_move: updated.last_move as { row: number; col: number } | null,
              player1_theme: updated.player1_theme as Theme | null,
              player2_theme: updated.player2_theme as Theme | null,
              status: updated.status as string,
            };
          });

          // Update status based on game state
          if (updated.is_game_over) {
            setStatus('finished');
          } else if (updated.status === 'playing') {
            setStatus('playing');
          }

          // Update opponent theme if it changed
          const oppTheme = playerNumber === 1 
            ? updated.player2_theme 
            : updated.player1_theme;
          if (oppTheme) {
            setOpponentTheme(oppTheme as unknown as Theme);
          }
        }
      )
      .subscribe();

    gameChannelRef.current = channel;
  }, [playerNumber]);

  const makeMove = useCallback(async (col: number) => {
    if (!game || game.is_game_over || !guestId) return;
    if (game.current_player !== playerNumber) return;

    try {
      // Use server-side validated function for game moves
      const { data, error } = await supabase.rpc('make_game_move', {
        p_game_id: game.id,
        p_guest_id: guestId,
        p_column: col
      });

      if (error) {
        console.error('Move error:', error.message);
        return;
      }

      // The game state will be updated via the realtime subscription
      // No need to manually update local state here
    } catch (err) {
      console.error('Move failed:', err);
    }
  }, [game, playerNumber, guestId]);

  const cancelSearch = useCallback(async () => {
    if (queueEntryRef.current) {
      await supabase.from('matchmaking_queue').delete().eq('id', queueEntryRef.current);
      queueEntryRef.current = null;
    }
    setStatus('idle');
  }, []);

  const leaveGame = useCallback(async () => {
    if (gameChannelRef.current) {
      supabase.removeChannel(gameChannelRef.current);
      gameChannelRef.current = null;
    }
    setGame(null);
    setStatus('idle');
    setOpponentTheme(null);
  }, []);

  const joinGame = useCallback(async (gameId: string) => {
    if (!guestId) return;

    const { data: gameData, error } = await supabase
      .from('online_games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error || !gameData) {
      console.error('Error fetching game:', error);
      setStatus('idle');
      return;
    }

    // Determine player number
    const isPlayer1 = gameData.player1_guest_id === guestId;
    const isPlayer2 = gameData.player2_guest_id === guestId;

    if (!isPlayer1 && !isPlayer2) {
      console.error('Not a player in this game');
      setStatus('idle');
      return;
    }

    setPlayerNumber(isPlayer1 ? 1 : 2);
    setGame({
      ...gameData,
      board: (gameData.board as Json) as number[][],
      winning_cells: gameData.winning_cells as [number, number][] | null,
      last_move: gameData.last_move as { row: number; col: number } | null,
      player1_theme: gameData.player1_theme as unknown as Theme | null,
      player2_theme: gameData.player2_theme as unknown as Theme | null,
    });

    // Set opponent theme
    const oppTheme = isPlayer1 ? gameData.player2_theme : gameData.player1_theme;
    if (oppTheme) {
      setOpponentTheme(oppTheme as unknown as Theme);
    }

    // If game is waiting (challenge sent), set to matched status
    if (gameData.status === 'waiting') {
      setStatus('matched');
    } else {
      setStatus(gameData.is_game_over ? 'finished' : 'playing');
    }

    subscribeToGame(gameId);
  }, [guestId, subscribeToGame]);

  return {
    status,
    game,
    playerNumber,
    opponentTheme,
    findMatch,
    makeMove,
    cancelSearch,
    leaveGame,
    joinGame,
  };
};

// Helper function to check for a win
function checkWin(board: number[][], row: number, col: number, player: number): { winner: boolean; winningCells: [number, number][] | null } {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (const [dr, dc] of directions) {
    const cells: [number, number][] = [[row, col]];
    
    // Check in positive direction
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= 6 || c < 0 || c >= 7) break;
      if (board[r][c] !== player) break;
      cells.push([r, c]);
    }
    
    // Check in negative direction
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= 6 || c < 0 || c >= 7) break;
      if (board[r][c] !== player) break;
      cells.push([r, c]);
    }
    
    if (cells.length >= 4) {
      return { winner: true, winningCells: cells };
    }
  }

  return { winner: false, winningCells: null };
}
