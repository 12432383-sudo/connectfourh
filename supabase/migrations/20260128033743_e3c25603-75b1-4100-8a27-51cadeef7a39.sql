-- Fix the make_game_move function - rename local variable to avoid ambiguity with column name
CREATE OR REPLACE FUNCTION public.make_game_move(p_game_id uuid, p_guest_id text, p_column integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  game_record RECORD;
  player_number INTEGER;
  new_board jsonb;
  row_index INTEGER;
  col_index INTEGER;
  winner_found BOOLEAN := FALSE;
  v_winning_cells jsonb := NULL;  -- Renamed to avoid ambiguity
  is_draw BOOLEAN := FALSE;
  next_player INTEGER;
  direction_checks INTEGER[][] := ARRAY[
    ARRAY[0, 1],   -- horizontal
    ARRAY[1, 0],   -- vertical
    ARRAY[1, 1],   -- diagonal down-right
    ARRAY[1, -1]   -- diagonal down-left
  ];
  dr INTEGER;
  dc INTEGER;
  count INTEGER;
  cells jsonb;
  r INTEGER;
  c INTEGER;
  i INTEGER;
  j INTEGER;
  cell_value INTEGER;
BEGIN
  -- Validate inputs
  IF p_column < 0 OR p_column > 6 THEN
    RAISE EXCEPTION 'Invalid column. Must be between 0 and 6.';
  END IF;

  IF p_guest_id IS NULL OR length(p_guest_id) < 10 THEN
    RAISE EXCEPTION 'Invalid guest_id.';
  END IF;

  -- Get the current game state
  SELECT * INTO game_record FROM public.online_games WHERE id = p_game_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found.';
  END IF;

  IF game_record.is_game_over THEN
    RAISE EXCEPTION 'Game is already over.';
  END IF;

  -- Determine player number and verify it's their turn
  IF game_record.player1_guest_id = p_guest_id THEN
    player_number := 1;
  ELSIF game_record.player2_guest_id = p_guest_id THEN
    player_number := 2;
  ELSE
    RAISE EXCEPTION 'You are not a player in this game.';
  END IF;

  IF game_record.current_player != player_number THEN
    RAISE EXCEPTION 'It is not your turn.';
  END IF;

  -- Parse current board
  new_board := game_record.board;

  -- Find the lowest empty row in the column (row 5 is bottom, row 0 is top)
  row_index := -1;
  FOR r IN REVERSE 5..0 LOOP
    cell_value := (new_board->r->p_column)::integer;
    IF cell_value = 0 THEN
      row_index := r;
      EXIT;
    END IF;
  END LOOP;

  IF row_index = -1 THEN
    RAISE EXCEPTION 'Column is full.';
  END IF;

  -- Make the move - update the board
  new_board := jsonb_set(
    new_board,
    ARRAY[row_index::text, p_column::text],
    to_jsonb(player_number)
  );

  -- Check for win (4 in a row)
  FOR i IN 1..4 LOOP
    dr := direction_checks[i][1];
    dc := direction_checks[i][2];
    cells := jsonb_build_array(jsonb_build_array(row_index, p_column));
    count := 1;
    
    -- Check positive direction
    FOR j IN 1..3 LOOP
      r := row_index + dr * j;
      c := p_column + dc * j;
      IF r >= 0 AND r <= 5 AND c >= 0 AND c <= 6 THEN
        cell_value := (new_board->r->c)::integer;
        IF cell_value = player_number THEN
          count := count + 1;
          cells := cells || jsonb_build_array(jsonb_build_array(r, c));
        ELSE
          EXIT;
        END IF;
      ELSE
        EXIT;
      END IF;
    END LOOP;
    
    -- Check negative direction
    FOR j IN 1..3 LOOP
      r := row_index - dr * j;
      c := p_column - dc * j;
      IF r >= 0 AND r <= 5 AND c >= 0 AND c <= 6 THEN
        cell_value := (new_board->r->c)::integer;
        IF cell_value = player_number THEN
          count := count + 1;
          cells := cells || jsonb_build_array(jsonb_build_array(r, c));
        ELSE
          EXIT;
        END IF;
      ELSE
        EXIT;
      END IF;
    END LOOP;
    
    IF count >= 4 THEN
      winner_found := TRUE;
      v_winning_cells := cells;
      EXIT;
    END IF;
  END LOOP;

  -- Check for draw (board full and no winner)
  IF NOT winner_found THEN
    is_draw := TRUE;
    FOR r IN 0..5 LOOP
      FOR c IN 0..6 LOOP
        cell_value := (new_board->r->c)::integer;
        IF cell_value = 0 THEN
          is_draw := FALSE;
          EXIT;
        END IF;
      END LOOP;
      IF NOT is_draw THEN
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- Determine next player
  IF player_number = 1 THEN
    next_player := 2;
  ELSE
    next_player := 1;
  END IF;

  -- Update the game (use explicit table.column references to avoid ambiguity)
  UPDATE public.online_games SET
    board = new_board,
    current_player = next_player,
    winner = CASE WHEN winner_found THEN player_number ELSE NULL END,
    is_game_over = winner_found OR is_draw,
    winning_cells = v_winning_cells,
    last_move = jsonb_build_object('row', row_index, 'col', p_column),
    status = CASE WHEN winner_found OR is_draw THEN 'finished' ELSE 'playing' END,
    updated_at = now()
  WHERE id = p_game_id;

  -- Return the updated game state
  RETURN jsonb_build_object(
    'success', TRUE,
    'row', row_index,
    'col', p_column,
    'winner', CASE WHEN winner_found THEN player_number ELSE NULL END,
    'is_game_over', winner_found OR is_draw,
    'winning_cells', v_winning_cells
  );
END;
$function$;

-- Create a rate limiting table for tracking actions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id text NOT NULL,
  action_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_guest_action ON public.rate_limits(guest_id, action_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow inserts for rate tracking
CREATE POLICY "Anyone can insert rate limits" ON public.rate_limits FOR INSERT WITH CHECK (true);

-- Allow reads for rate checking
CREATE POLICY "Anyone can view own rate limits" ON public.rate_limits FOR SELECT USING (true);

-- Allow cleanup of old entries
CREATE POLICY "Anyone can delete old rate limits" ON public.rate_limits FOR DELETE USING (created_at < now() - interval '1 hour');

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_guest_id text,
  p_action_type text,
  p_max_requests integer,
  p_window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
  window_start timestamptz;
BEGIN
  -- Input validation
  IF p_guest_id IS NULL OR length(p_guest_id) < 10 THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Invalid guest_id');
  END IF;

  window_start := now() - (p_window_seconds || ' seconds')::interval;

  -- Count recent requests
  SELECT COUNT(*) INTO recent_count
  FROM public.rate_limits
  WHERE guest_id = p_guest_id
    AND action_type = p_action_type
    AND created_at > window_start;

  -- Check if under limit
  IF recent_count >= p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'error', 'Rate limit exceeded. Please wait before trying again.',
      'retry_after', p_window_seconds
    );
  END IF;

  -- Record this request
  INSERT INTO public.rate_limits (guest_id, action_type, created_at)
  VALUES (p_guest_id, p_action_type, now());

  -- Clean up old entries (older than 1 hour)
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '1 hour';

  RETURN jsonb_build_object('allowed', true);
END;
$$;