import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const MOCK_INITIAL_TABLES = [
  // ===== TOP HORIZONTAL ROW =====
  { id: '1',  number: 1,  x: 9.5, y: 19,   capacity: 4, isAvailable: false, shape: 'shape-wide-h', isVip: false }, // red wide
  { id: '2',  number: 2,  x: 26,  y: 19,   capacity: 4, isAvailable: true,  shape: 'shape-h',      isVip: false },
  { id: '3',  number: 3,  x: 38,  y: 19,   capacity: 4, isAvailable: true,  shape: 'shape-h',      isVip: false },
  { id: '4',  number: 4,  x: 50,  y: 19,   capacity: 4, isAvailable: true,  shape: 'shape-h',      isVip: false },
  { id: '5',  number: 5,  x: 63,  y: 19,   capacity: 4, isAvailable: true,  shape: 'shape-h',      isVip: false },

  // ===== SECOND ROW =====
  { id: '6',  number: 6,  x: 7.5, y: 27,   capacity: 4, isAvailable: false, shape: 'shape-v',      isVip: false }, // red vertical
  { id: '7',  number: 7,  x: 16,  y: 24.5, capacity: 2, isAvailable: false, shape: 'shape-sq',     isVip: false }, // red small
  { id: '8',  number: 8,  x: 26,  y: 24.5, capacity: 2, isAvailable: true,  shape: 'shape-sq',     isVip: false },
  { id: '9',  number: 9,  x: 38,  y: 24.5, capacity: 2, isAvailable: true,  shape: 'shape-sq',     isVip: false },
  { id: '10', number: 10, x: 63,  y: 24.5, capacity: 2, isAvailable: true,  shape: 'shape-sq',     isVip: false },

  // ===== GRID ROW A (y≈36) =====
  { id: '11', number: 11, x: 7.5, y: 36,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '12', number: 12, x: 16,  y: 34.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '13', number: 13, x: 28,  y: 34.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '14', number: 14, x: 35,  y: 36,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '15', number: 15, x: 47,  y: 36,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '16', number: 16, x: 55,  y: 34.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '17', number: 17, x: 64,  y: 34.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '18', number: 18, x: 72,  y: 36,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },

  // ===== GRID ROW B (y≈46) =====
  { id: '19', number: 19, x: 7.5, y: 46,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '20', number: 20, x: 16,  y: 44.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '21', number: 21, x: 28,  y: 44.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '22', number: 22, x: 35,  y: 46,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '23', number: 23, x: 47,  y: 46,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '24', number: 24, x: 55,  y: 44.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '25', number: 25, x: 64,  y: 44.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '26', number: 26, x: 72,  y: 46,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },

  // ===== GRID ROW C (y≈56) =====
  { id: '27', number: 27, x: 7.5, y: 56,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '28', number: 28, x: 16,  y: 54.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '29', number: 29, x: 28,  y: 54.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '30', number: 30, x: 35,  y: 56,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '31', number: 31, x: 47,  y: 56,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '32', number: 32, x: 55,  y: 54.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '33', number: 33, x: 64,  y: 54.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '34', number: 34, x: 72,  y: 56,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },

  // ===== GRID ROW D (y≈65, partial) =====
  { id: '35', number: 35, x: 7.5, y: 65,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '36', number: 36, x: 16,  y: 63.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '37', number: 37, x: 64,  y: 63.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '38', number: 38, x: 72,  y: 65,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },
  { id: '39', number: 39, x: 82,  y: 63.5, capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: false },
  { id: '40', number: 40, x: 89,  y: 60,   capacity: 4, isAvailable: true,  shape: 'shape-v',  isVip: false },

  // ===== VIP LEFT CLUSTER =====
  { id: 'v1', number: 41, x: 7.5, y: 73,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v2', number: 42, x: 16,  y: 72,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v3', number: 43, x: 7.5, y: 81,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v4', number: 44, x: 16,  y: 80,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v5', number: 45, x: 7.5, y: 89,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v6', number: 46, x: 16,  y: 88,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v7', number: 47, x: 12,  y: 94.5, capacity: 4, isAvailable: true,  shape: 'shape-h',  isVip: true },

  // ===== VIP CENTER CLUSTER =====
  { id: 'v8',  number: 48, x: 37,  y: 73,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v9',  number: 49, x: 44,  y: 74,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v10', number: 50, x: 50.5,y: 74,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v11', number: 51, x: 57,  y: 73,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v12', number: 52, x: 37,  y: 82,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v13', number: 53, x: 44,  y: 83,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v14', number: 54, x: 50.5,y: 83,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v15', number: 55, x: 57,  y: 82,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },

  // ===== VIP RIGHT CLUSTER =====
  { id: 'v16', number: 56, x: 81,  y: 72,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v17', number: 57, x: 89,  y: 73,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v18', number: 58, x: 81,  y: 80,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v19', number: 59, x: 89,  y: 81,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v20', number: 60, x: 81,  y: 88,   capacity: 2, isAvailable: true,  shape: 'shape-sq', isVip: true },
  { id: 'v21', number: 61, x: 89,  y: 89,   capacity: 6, isAvailable: true,  shape: 'shape-v',  isVip: true },
  { id: 'v22', number: 62, x: 85,  y: 94.5, capacity: 4, isAvailable: true,  shape: 'shape-h',  isVip: true },
];

export function useTables(restaurantId) {
  const storageKey = `tableaura_tables_${restaurantId}`;
  
  const [tables, setTables] = useState(MOCK_INITIAL_TABLES);

  // Load from Supabase on mount
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurant_tables')
          .select('*')
          .eq('restaurant_id', restaurantId);
        
        if (data && data.length > 0) {
          // Map DB columns to our state model
          const formattedTables = data.map(t => ({
            id: t.id.toString(),
            number: t.number,
            label: t.label ?? String(t.number ?? ''),
            x: t.pos_x,
            y: t.pos_y,
            capacity: t.capacity,
            isAvailable: t.is_available,
            shape: t.shape,
            isVip: t.is_vip
          }));
          setTables(formattedTables);
        } else {
          // DB is empty — seed with the default premium layout (without ID)
          const payload = MOCK_INITIAL_TABLES.map(t => ({
            restaurant_id: restaurantId,
            number: t.number,
            label: t.label ?? String(t.number ?? ''),
            pos_x: t.x,
            pos_y: t.y,
            capacity: t.capacity,
            is_available: t.isAvailable !== undefined ? t.isAvailable : true,
            shape: t.shape || 'shape-square',
            is_vip: t.isVip || false
          }));
          const { error: insertErr } = await supabase.from('restaurant_tables').insert(payload);
          if (insertErr) {
            console.warn("Seeding DB failed:", insertErr);
          } else {
            // After seeding, fetch again to get real DB IDs
            const { data: seeded } = await supabase
              .from('restaurant_tables')
              .select('*')
              .eq('restaurant_id', restaurantId);
            if (seeded) {
              setTables(seeded.map(t => ({
                id: t.id.toString(),
                number: t.number,
                label: t.label ?? String(t.number ?? ''),
                x: t.pos_x,
                y: t.pos_y,
                capacity: t.capacity,
                isAvailable: t.is_available,
                shape: t.shape,
                isVip: t.is_vip
              })));
            }
          }
        }
      } catch (err) {
        console.warn("Supabase fetch failed, using local/mock data.", err);
      }
    };
    
    fetchTables();

    // Setup realtime subscription
    const channelName = `tables_channel_${restaurantId}_${Math.random()}`;
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, payload => {
        fetchTables(); // Re-fetch all to ensure sync, or handle payload specifics
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [restaurantId]);

  // Write to localStorage as a fast-load cache (Supabase is the source of truth)
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tables));
  }, [tables, storageKey]);

  const updateTables = (newTables) => {
    setTables(newTables);
  };

  const saveTablesToDb = async (tablesToSave = tables) => {
    try {
      // Clean tables (e.g. check for NaN capacities)
      const cleanTables = tablesToSave.map(t => ({
        ...t,
        capacity: isNaN(parseInt(t.capacity)) ? 2 : parseInt(t.capacity)
      }));

      // Delete existing rows for this restaurant
      const { error: deleteErr } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('restaurant_id', restaurantId);
      if (deleteErr) throw deleteErr;

      // Insert fresh layout
      const payload = cleanTables.map(t => ({
        restaurant_id: restaurantId,
        number: t.number,
        label: t.label ?? String(t.number ?? ''),
        pos_x: t.x,
        pos_y: t.y,
        capacity: t.capacity,
        is_available: t.isAvailable !== undefined ? t.isAvailable : true,
        shape: t.shape || 'shape-square',
        is_vip: t.isVip || false
      }));

      const { error: insertErr } = await supabase.from('restaurant_tables').insert(payload);
      if (insertErr) throw insertErr;

      // Re-fetch to get fresh DB IDs
      const { data: seeded } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', restaurantId);
      if (seeded) {
              setTables(seeded.map(t => ({
                id: t.id.toString(),
                number: t.number,
                label: t.label ?? String(t.number ?? ''),
                x: t.pos_x,
                y: t.pos_y,
                capacity: t.capacity,
                isAvailable: t.is_available,
                shape: t.shape,
                isVip: t.is_vip
              })));
      }
    } catch (err) {
      console.error("Error saving tables to DB:", err);
      throw err;
    }
  };

  const updateTableStatus = async (tableId, isAvailable) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, isAvailable } : t));
    
    try {
      const numericId = parseInt(tableId);
      if (!isNaN(numericId)) {
        await supabase
          .from('restaurant_tables')
          .update({ is_available: isAvailable })
          .eq('id', numericId);
      }
    } catch (err) {}
  };

  const resetToDefaultLayout = () => updateTables(MOCK_INITIAL_TABLES);

  return { tables, updateTables, updateTableStatus, saveTablesToDb, resetToDefaultLayout };
}
