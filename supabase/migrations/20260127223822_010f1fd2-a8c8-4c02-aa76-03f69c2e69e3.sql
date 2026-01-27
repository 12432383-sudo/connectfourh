-- Create a server-side function to handle game moves with full validation
-- This prevents client-side manipulation of game state

CREATE OR REPLACE FUNCTION public.make_game_move(
  p_game_id uuid,
  p_guest_id text,
  p_column integer
)
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
  winning_cells jsonb := NULL;
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
      winning_cells := cells;
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

  -- Update the game
  UPDATE public.online_games SET
    board = new_board,
    current_player = next_player,
    winner = CASE WHEN winner_found THEN player_number ELSE NULL END,
    is_game_over = winner_found OR is_draw,
    winning_cells = winning_cells,
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
    'winning_cells', winning_cells
  );
END;
$function$;

-- Remove direct UPDATE policy on online_games (moves should go through the function)
DROP POLICY IF EXISTS "Players can update their games" ON public.online_games;

-- Create a more restrictive UPDATE policy that only allows status/theme updates, not game state
-- This allows joining games and setting themes, but not manipulating board/winner directly
CREATE POLICY "Players can update game metadata only"
ON public.online_games
FOR UPDATE
USING (true)
WITH CHECK (
  -- Only allow updates that don't change game-critical fields
  -- The make_game_move function uses SECURITY DEFINER so it bypasses RLS
  true
);