-- Create friends table for friend relationships
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_guest_id TEXT NOT NULL,
  addressee_guest_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_guest_id, addressee_guest_id)
);

-- Create game challenges table for direct friend challenges
CREATE TABLE public.game_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_guest_id TEXT NOT NULL,
  challenged_guest_id TEXT NOT NULL,
  game_id UUID REFERENCES public.online_games(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes')
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_challenges ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Anyone can view friends"
ON public.friends
FOR SELECT
USING (true);

CREATE POLICY "Anyone can send friend request"
ON public.friends
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update friend status"
ON public.friends
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete friend"
ON public.friends
FOR DELETE
USING (true);

-- Game challenges policies
CREATE POLICY "Anyone can view challenges"
ON public.game_challenges
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create challenge"
ON public.game_challenges
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update challenge"
ON public.game_challenges
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete challenge"
ON public.game_challenges
FOR DELETE
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for challenges
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;