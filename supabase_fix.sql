-- Copiez SEULEMENT ces 4 lignes dans Supabase SQL Editor et cliquez Run :
ALTER TABLE restaurant_tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables REPLICA IDENTITY FULL;
ALTER TABLE reservations REPLICA IDENTITY FULL;
