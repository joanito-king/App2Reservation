-- ============================================================
-- SCRIPT SQL COMPLET — À EXÉCUTER DANS SUPABASE SQL EDITOR
-- https://supabase.com/dashboard → SQL Editor
-- ============================================================

-- 1. Créer la table restaurant_tables si elle n'existe pas
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id TEXT NOT NULL DEFAULT '1',
  number INTEGER NOT NULL,
  pos_x FLOAT NOT NULL DEFAULT 50,
  pos_y FLOAT NOT NULL DEFAULT 50,
  capacity INTEGER NOT NULL DEFAULT 2,
  is_available BOOLEAN NOT NULL DEFAULT true,
  shape TEXT NOT NULL DEFAULT 'shape-square',
  is_vip BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la table reservations si elle n'existe pas
CREATE TABLE IF NOT EXISTS reservations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id TEXT NOT NULL DEFAULT '1',
  table_id TEXT,
  customer_name TEXT,
  phone TEXT,
  time TEXT,
  guests INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activer le Realtime sur les deux tables
ALTER TABLE restaurant_tables REPLICA IDENTITY FULL;
ALTER TABLE reservations REPLICA IDENTITY FULL;

-- 4. DÉSACTIVER RLS (pour usage interne/prototype)
--    OU utiliser les policies ci-dessous

ALTER TABLE restaurant_tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- ALTERNATIVE : Si vous voulez garder RLS actif,
-- remplacez les lignes DISABLE par ces POLICIES :
-- ============================================================
-- ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon" ON restaurant_tables
--   FOR ALL USING (true) WITH CHECK (true);
--
-- ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for anon" ON reservations
--   FOR ALL USING (true) WITH CHECK (true);
-- ============================================================

-- 5. Vider les anciennes données (optionnel - pour repartir propre)
-- DELETE FROM restaurant_tables;
-- DELETE FROM reservations;
