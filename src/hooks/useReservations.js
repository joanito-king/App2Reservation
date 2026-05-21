import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useReservations(restaurantId = 'default') {
  const [reservations, setReservations] = useState([]);

  const fetch = async () => {
    try {
      let query = supabase.from('reservations').select('*');
      if (restaurantId && restaurantId !== 'default') {
        query = query.eq('restaurant_id', restaurantId);
      }
      const { data } = await query.order('created_at', { ascending: false });
      if (data) {
        setReservations(data.map(r => ({
          id: r.id.toString(),
          tableId: r.table_id?.toString(),
          tableNumber: r.table_number,
          customerName: r.customer_name,
          phone: r.phone,
          time: r.time,
          guests: r.guests,
          status: r.status,
          restaurantId: r.restaurant_id,
          restaurantName: r.restaurant_name,
          userId: r.user_id,
          createdAt: r.created_at
        })));
      }
    } catch {}
  };

  useEffect(() => {
    fetch();
    const sub = supabase.channel(`res_${restaurantId}_${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [restaurantId]);

  const addReservation = async (reservation) => {
    const { data, error } = await supabase.from('reservations').insert([{
      restaurant_id: reservation.restaurantId,
      restaurant_name: reservation.restaurantName || '',
      table_id: reservation.tableId,
      table_number: reservation.tableNumber,
      customer_name: reservation.name || reservation.customerName,
      phone: reservation.phone,
      time: reservation.time,
      guests: reservation.guests,
      status: 'pending',
      user_id: reservation.userId || null
    }]).select().single();
    if (error) throw error;
    return data;
  };

  const updateReservationStatus = async (id, status) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      await supabase.from('reservations').update({ status }).eq('id', parseInt(id));
    } catch {}
  };

  const getUserReservations = async (userId) => {
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data || []).map(r => ({
      id: r.id.toString(),
      tableNumber: r.table_number,
      customerName: r.customer_name,
      phone: r.phone,
      time: r.time,
      guests: r.guests,
      status: r.status,
      restaurantId: r.restaurant_id,
      restaurantName: r.restaurant_name,
      createdAt: r.created_at
    }));
  };

  return { reservations, addReservation, updateReservationStatus, getUserReservations };
}
