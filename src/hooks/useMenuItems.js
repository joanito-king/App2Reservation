import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useMenuItems(restaurantId) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!restaurantId) return;
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category')
      .order('name');
    setMenuItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!restaurantId) return;
    fetch();
    const sub = supabase.channel(`menu_${restaurantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [restaurantId]);

  const uploadPhoto = async (file) => {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('menu-photos').upload(filename, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('menu-photos').getPublicUrl(filename);
    return data.publicUrl;
  };

  const addMenuItem = async (item, photoFile) => {
    let image_url = item.image_url || '';
    if (photoFile) image_url = await uploadPhoto(photoFile);
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ ...item, restaurant_id: restaurantId, image_url }])
      .select().single();
    if (error) throw error;
    return data;
  };

  const updateMenuItem = async (id, updates, photoFile) => {
    let image_url = updates.image_url;
    if (photoFile) image_url = await uploadPhoto(photoFile);
    const { error } = await supabase
      .from('menu_items')
      .update({ ...updates, image_url })
      .eq('id', id);
    if (error) throw error;
  };

  const deleteMenuItem = async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  };

  return { menuItems, loading, addMenuItem, updateMenuItem, deleteMenuItem, refetch: fetch };
}
