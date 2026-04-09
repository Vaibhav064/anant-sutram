-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  nickname text NOT NULL,
  email text,
  persona_preference text CHECK (persona_preference IN ('psychologist', 'spiritual', 'coach')),
  onboarding_answers jsonb,
  subscription_tier text DEFAULT 'aura' CHECK (subscription_tier IN ('aura', 'shakti', 'moksha')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MOOD_CHECKINS TABLE
CREATE TABLE IF NOT EXISTS public.mood_checkins (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  score integer CHECK (score >= 0 AND score <= 10) NOT NULL,
  context_note text,
  emotion_tags text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- JOURNAL_ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  prompt_text text NOT NULL,
  content text NOT NULL,
  word_count integer,
  ai_reflection text,
  emotion_tags text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HEALERS TABLE
CREATE TABLE IF NOT EXISTS public.healers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  specialty text[] NOT NULL,
  bio text,
  credentials text[],
  languages text[],
  rating decimal(3,2) DEFAULT 0.0,
  review_count integer DEFAULT 0,
  price_quick integer NOT NULL,
  price_full integer NOT NULL,
  price_deep integer NOT NULL,
  is_available_now boolean DEFAULT false,
  next_available timestamp with time zone,
  photo_url text,
  is_verified boolean DEFAULT false
);

-- HEALER_BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.healer_bookings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  healer_id uuid REFERENCES public.healers(id) NOT NULL,
  session_type text CHECK (session_type IN ('quick', 'full', 'deep')),
  format text CHECK (format IN ('chat', 'audio', 'video')),
  scheduled_at timestamp with time zone NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  amount_paid integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- COMMUNITY_POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  anonymous_name text NOT NULL,
  circle text CHECK (circle IN ('anxiety', 'heartbreak', 'work-stress', 'spiritual', 'loneliness')),
  content text NOT NULL,
  relate_count integer DEFAULT 0,
  is_flagged boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CHAT_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  persona text CHECK (persona IN ('psychologist', 'spiritual', 'coach')),
  messages jsonb[] NOT NULL,
  session_date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healer_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- USERS: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- MOOD_CHECKINS: Own only
CREATE POLICY "Users can view own mood check-ins" ON public.mood_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood check-ins" ON public.mood_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- JOURNAL_ENTRIES: Own only
CREATE POLICY "Users can view own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);

-- HEALERS: Anyone can read
CREATE POLICY "Anyone can view healers" ON public.healers FOR SELECT USING (true);

-- HEALER_BOOKINGS: Own only
CREATE POLICY "Users can view own bookings" ON public.healer_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON public.healer_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- COMMUNITY_POSTS: All can read non-flagged. Users write/delete own.
CREATE POLICY "Anyone can view non-flagged posts" ON public.community_posts FOR SELECT USING (is_flagged = false OR auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can update relate count" ON public.community_posts FOR UPDATE USING (true); -- simplified, ideally use RPC for relate increments

-- CHAT_SESSIONS: Own only
CREATE POLICY "Users can view own chats" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);

-- SEED DATA (Healers & Community Posts)
INSERT INTO public.healers (name, specialty, bio, credentials, languages, rating, review_count, price_quick, price_full, price_deep, is_available_now, is_verified) VALUES
('Dr. Aisha', ARRAY['psychologist'], 'Empathetic listener specializing in trauma.', ARRAY['PhD Clinical Psych', '10 yrs exp'], ARRAY['English', 'Hindi'], 4.9, 120, 299, 799, 1499, true, true),
('Guru Raj', ARRAY['spiritual', 'pranic'], 'Guiding paths to inner peace.', ARRAY['Master Pranic Healer'], ARRAY['Hindi', 'Sanskrit'], 4.8, 85, 200, 600, 1100, false, true),
('Coach Mike', ARRAY['coach'], 'Action-oriented life coaching.', ARRAY['ICF Certified', '5 yrs exp'], ARRAY['English'], 4.7, 45, 300, 800, 1500, true, true),
('Amaya', ARRAY['reiki', 'spiritual'], 'Gentle energetic realignment.', ARRAY['Reiki Master'], ARRAY['English'], 4.9, 210, 250, 700, 1200, false, true),
('Dr. Sharma', ARRAY['psychologist'], 'Specialist in CBT and anxiety.', ARRAY['MSc Psychology', '7 yrs exp'], ARRAY['English', 'Hindi'], 4.8, 95, 299, 799, 1499, true, true),
('Anita', ARRAY['coach', 'spiritual'], 'Holistic healing and life redesign.', ARRAY['Certified Life Coach'], ARRAY['English', 'Marathi'], 4.6, 60, 250, 650, 1200, false, false),
('Vikram', ARRAY['pranic'], 'Balancing your energetic centers.', ARRAY['Adv Pranic Healer'], ARRAY['English'], 4.7, 52, 200, 600, 1100, true, true),
('Sara', ARRAY['psychologist'], 'Navigating relationships and stress.', ARRAY['MA Clinical Psych'], ARRAY['English'], 4.9, 115, 299, 799, 1499, false, true);

-- Community Posts (We can't seed these effectively if user auth isn't created. For mock purposes, using a generic UUID would fail FK constraints in `auth.users`, so these must be generated upon usage).
