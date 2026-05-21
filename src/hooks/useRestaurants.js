import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    try {
      const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
      if (error) console.error('Supabase error:', error);
      setRestaurants(data || []);
    } catch (e) {
      console.error('Fetch error:', e);
      setRestaurants([]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    let sub;
    try {
      sub = supabase.channel('restaurants_ch')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, fetch)
        .subscribe();
    } catch (err) {
      console.error('Realtime subscription error:', err);
    }
    return () => {
      if (sub) supabase.removeChannel(sub);
    };
  }, []);

  const addRestaurant = async (restaurant) => {
    const { data, error } = await supabase.from('restaurants').insert([restaurant]).select().single();
    if (error) throw error;
    return data;
  };

  const updateRestaurant = async (id, updates) => {
    const { error } = await supabase.from('restaurants').update(updates).eq('id', id);
    if (error) throw error;
  };

  const deleteRestaurant = async (id) => {
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (error) throw error;
  };

  return { restaurants, loading, addRestaurant, updateRestaurant, deleteRestaurant, refetch: fetch };
}

export function useRestaurant(id) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data } = await supabase.from('restaurants').select('*').eq('id', id).single();
      setRestaurant(data || null);
      setLoading(false);
    };
    fetch();
  }, [id]);

  return { restaurant, loading, setRestaurant };
}
