-- ============================================================
-- VÉLA Platform — Schema Complet v2
-- Exécuter dans Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROFILS UTILISATEURS (liés à Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT DEFAULT '',
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client', -- 'client' ou 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger : auto-créer le profil à chaque inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine TEXT DEFAULT '',
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  menu_image_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  rating FLOAT DEFAULT 4.5,
  opening_hours TEXT DEFAULT '12h-14h30 | 19h-23h',
  phone TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLATS DU MENU
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price FLOAT NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Plat',
  image_url TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLES (déjà existante — pas de changement de structure)
-- restaurant_id reste TEXT (on utilisera l'id numérique converti en string)

-- 5. RÉSERVATIONS — ajout user_id
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS restaurant_name TEXT DEFAULT '';

-- 6. REALTIME
ALTER TABLE user_profiles REPLICA IDENTITY FULL;
ALTER TABLE restaurants REPLICA IDENTITY FULL;
ALTER TABLE menu_items REPLICA IDENTITY FULL;

-- 7. ROW LEVEL SECURITY

-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_own" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON user_profiles;
DROP POLICY IF EXISTS "admins_read_all" ON user_profiles;
CREATE POLICY "users_read_own" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admins_read_all" ON user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- restaurants: lecture publique, écriture admin seulement
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_restaurants" ON restaurants;
DROP POLICY IF EXISTS "admins_write_restaurants" ON restaurants;
CREATE POLICY "public_read_restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "admins_write_restaurants" ON restaurants FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- menu_items: lecture publique, écriture admin
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_menu" ON menu_items;
DROP POLICY IF EXISTS "admins_write_menu" ON menu_items;
CREATE POLICY "public_read_menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "admins_write_menu" ON menu_items FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tables et réservations : ouvertes (prototype)
ALTER TABLE restaurant_tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

-- 8. STORAGE BUCKETS (via Dashboard > Storage ou commandes suivantes)
-- Créer manuellement dans Supabase Dashboard :
--   Bucket: 'restaurant-images'  → Public: true
--   Bucket: 'menu-photos'        → Public: true
-- Ou via SQL (si extension storage activée) :
-- INSERT INTO storage.buckets (id, name, public) VALUES ('restaurant-images', 'restaurant-images', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('menu-photos', 'menu-photos', true) ON CONFLICT DO NOTHING;

-- Policies storage (à créer dans Dashboard > Storage > Policies)
-- Pour 'restaurant-images' : SELECT pour all, INSERT/UPDATE/DELETE pour authenticated
-- Pour 'menu-photos' : SELECT pour all, INSERT/UPDATE/DELETE pour authenticated
