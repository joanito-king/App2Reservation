import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
  ].filter(Boolean).join(' et ');
  throw new Error(`Supabase n'est pas configuré : ${missing} requis. Ajoute ces variables dans Netlify > Site settings > Build & deploy > Environment.`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
