-- Ruleaza asta in Supabase SQL Editor

-- Tabela profiles (useri)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  credits INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 0,
  trial_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela pages (paginile generate)
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  product_name TEXT,
  price INTEGER,
  hero_image TEXT,
  page_data JSONB,
  views INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pentru slug (acces rapid la pagina publica)
CREATE INDEX pages_slug_idx ON pages(slug);
CREATE INDEX pages_user_idx ON pages(user_id);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policies profiles
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies pages
CREATE POLICY "Users see own pages" ON pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pages" ON pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can see pages by slug" ON pages FOR SELECT USING (true);

-- Functie: scade 1 credit la generare pagina
CREATE OR REPLACE FUNCTION decrement_credits(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET credits = credits - 1, total_pages = total_pages + 1
  WHERE id = user_id AND credits > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Functie: adauga credite dupa plata (apelata de webhook Stripe)
CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_credits INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET credits = credits + p_credits WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: creeaza profil automat la signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, credits, trial_used)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    1,
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
