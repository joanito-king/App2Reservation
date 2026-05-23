import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || user?.email === 'joanitotresor@gmail.com';

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        // Use setTimeout to run this in the next tick, avoiding Supabase client deadlock
        setTimeout(() => {
          if (isMounted) fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (emailOrPhone, password) => {
    const trimmed = emailOrPhone.trim();
    const isPhone = !trimmed.includes('@') && /^[+\d\s\-()]{7,15}$/.test(trimmed);
    let email = trimmed;

    if (isPhone) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('phone', trimmed)
        .maybeSingle();
      if (error || !data?.email) throw new Error('Aucun compte associé à ce numéro.');
      email = data.email;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Supabase signInWithPassword error:', error);
        throw error;
      }
      return data;
    } catch (e) {
      console.error('signIn exception:', e);
      throw e;
    }
  };

  const signUp = async ({ fullName, email, phone, password, adminSecret }) => {
    const role = adminSecret && adminSecret === import.meta.env.VITE_ADMIN_PASSWORD ? 'admin' : 'client';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone || null, role } }
    });
    if (error) throw error;
    if (data.user && phone) {
      await supabase.from('user_profiles')
        .upsert({ id: data.user.id, email, full_name: fullName, phone, role });
    }
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isAuthenticated, signIn, signUp, signOut, refetchProfile: () => user && fetchProfile(user.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
