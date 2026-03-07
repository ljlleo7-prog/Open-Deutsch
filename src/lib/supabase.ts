import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Use Service Role Key in Node environment if available to bypass RLS
const supabaseKey = (!isBrowser && supabaseServiceKey) ? supabaseServiceKey : supabaseAnonKey;

const storage = isBrowser ? {
  getItem: (key: string) => {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    const isProd = window.location.hostname.endsWith('geeksproductionstudio.com');
    const domain = isProd ? '.geeksproductionstudio.com' : window.location.hostname;
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    document.cookie = `${key}=${encodeURIComponent(value)}; domain=${domain}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
  },
  removeItem: (key: string) => {
    const isProd = window.location.hostname.endsWith('geeksproductionstudio.com');
    const domain = isProd ? '.geeksproductionstudio.com' : window.location.hostname;
    document.cookie = `${key}=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure`;
  },
} : undefined; // Default memory storage in Node

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
