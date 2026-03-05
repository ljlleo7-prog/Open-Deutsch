import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => {
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
      setItem: (key, value) => {
        // We need to set the cookie on the parent domain if we are in production
        // However, for local development, we just use localhost
        // But since we want to share auth with GPS-Homepage, we might need to be careful
        // The original code had specific logic for geeksproductionstudio.com
        // We will keep it generic for now or copy the logic if needed
        // Since we are running on localhost for now, simple cookie setting should work
        // But if we want to share with a live site, we need to match the domain logic
        
        // For now, let's just use localStorage to be safe for a standalone app, 
        // BUT the requirement says "repeatingly use the SSO auth from GPS-Homepage".
        // If GPS-Homepage sets a cookie on a shared domain, we should read it.
        // If we are on different domains (e.g. localhost:5173 vs localhost:3000), cookies might not be shared easily without specific config.
        // However, if we are just using the same Supabase project, we can just sign in again or use the same session if possible.
        // The GPS-Homepage code used custom cookie storage. I will replicate it to be safe.
        
        const isProd = window.location.hostname.endsWith('geeksproductionstudio.com');
        const domain = isProd ? '.geeksproductionstudio.com' : window.location.hostname;
        const maxAge = 60 * 60 * 24 * 365; // 1 year
        document.cookie = `${key}=${encodeURIComponent(value)}; domain=${domain}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
      },
      removeItem: (key) => {
        const isProd = window.location.hostname.endsWith('geeksproductionstudio.com');
        const domain = isProd ? '.geeksproductionstudio.com' : window.location.hostname;
        document.cookie = `${key}=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure`;
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
