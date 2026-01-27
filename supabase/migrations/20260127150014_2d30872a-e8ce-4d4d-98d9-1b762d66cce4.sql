-- Create themes table (available themes in the shop)
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  disc_color_p1 TEXT NOT NULL DEFAULT '#ef4444',
  disc_color_p2 TEXT NOT NULL DEFAULT '#facc15',
  disc_shape TEXT NOT NULL DEFAULT 'circle',
  board_color TEXT NOT NULL DEFAULT '#1e3a5f',
  background_gradient TEXT,
  price_coins INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Everyone can read themes (public shop)
CREATE POLICY "Anyone can view themes" 
ON public.themes 
FOR SELECT 
USING (true);

-- Create matchmaking queue table
CREATE TABLE public.matchmaking_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  game_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- Anyone can join the queue
CREATE POLICY "Anyone can join queue"
ON public.matchmaking_queue
FOR INSERT
WITH CHECK (true);

-- Anyone can view the queue
CREATE POLICY "Anyone can view queue"
ON public.matchmaking_queue
FOR SELECT
USING (true);

-- Anyone can update their own queue entry
CREATE POLICY "Users can update own queue entry"
ON public.matchmaking_queue
FOR UPDATE
USING (true);

-- Anyone can delete from queue
CREATE POLICY "Anyone can delete from queue"
ON public.matchmaking_queue
FOR DELETE
USING (true);

-- Create online games table
CREATE TABLE public.online_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_guest_id TEXT NOT NULL,
  player2_guest_id TEXT,
  board JSONB NOT NULL DEFAULT '[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]',
  current_player INTEGER NOT NULL DEFAULT 1,
  winner INTEGER,
  is_game_over BOOLEAN NOT NULL DEFAULT false,
  winning_cells JSONB,
  last_move JSONB,
  player1_theme JSONB,
  player2_theme JSONB,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.online_games ENABLE ROW LEVEL SECURITY;

-- Anyone can create games
CREATE POLICY "Anyone can create games"
ON public.online_games
FOR INSERT
WITH CHECK (true);

-- Anyone can view games
CREATE POLICY "Anyone can view games"
ON public.online_games
FOR SELECT
USING (true);

-- Anyone can update games they're part of
CREATE POLICY "Players can update their games"
ON public.online_games
FOR UPDATE
USING (true);

-- Enable realtime for matchmaking and games
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_games;

-- Insert default themes
INSERT INTO public.themes (name, description, disc_color_p1, disc_color_p2, disc_shape, board_color, background_gradient, is_free) VALUES
('Classic', 'The original Connect 4 look', '#ef4444', '#facc15', 'circle', '#1e40af', 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', true),
('Ocean', 'Deep sea vibes', '#06b6d4', '#8b5cf6', 'circle', '#0c4a6e', 'linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)', false),
('Sunset', 'Warm sunset colors', '#f97316', '#ec4899', 'circle', '#7c2d12', 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)', false),
('Forest', 'Natural green theme', '#22c55e', '#84cc16', 'circle', '#14532d', 'linear-gradient(135deg, #14532d 0%, #166534 100%)', false),
('Neon', 'Cyberpunk glow', '#00ff88', '#ff00ff', 'circle', '#0a0a0a', 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', false),
('Royal', 'Elegant gold and purple', '#fbbf24', '#a855f7', 'circle', '#581c87', 'linear-gradient(135deg, #3b0764 0%, #581c87 100%)', false),
('Ice', 'Frozen winter look', '#7dd3fc', '#e0f2fe', 'circle', '#0c4a6e', 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)', false),
('Fire', 'Blazing hot flames', '#dc2626', '#fbbf24', 'circle', '#450a0a', 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)', false),
('Diamond', 'Premium diamond style', '#38bdf8', '#f0abfc', 'diamond', '#1e1b4b', 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', false),
('Star', 'Shining star discs', '#fcd34d', '#fb923c', 'star', '#1c1917', 'linear-gradient(135deg, #1c1917 0%, #292524 100%)', false),
('Heart', 'Love themed discs', '#f43f5e', '#fb7185', 'heart', '#4c0519', 'linear-gradient(135deg, #4c0519 0%, #881337 100%)', false),
('Galaxy', 'Space adventure', '#c084fc', '#22d3ee', 'circle', '#020617', 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', false);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_matchmaking_queue_updated_at
BEFORE UPDATE ON public.matchmaking_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_online_games_updated_at
BEFORE UPDATE ON public.online_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();