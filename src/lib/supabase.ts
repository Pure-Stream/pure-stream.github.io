import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AstroGlobal } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client (for browser use)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Server-side Supabase client factory (for SSR with cookie support)
export const createServerSupabaseClient = (context: AstroGlobal) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Get Supabase auth cookies directly from Astro's cookie API
        const cookies: { name: string; value: string }[] = [];

        const accessToken = context.cookies.get('sb-access-token')?.value;
        if (accessToken) {
          cookies.push({ name: 'sb-access-token', value: accessToken });
        }

        const refreshToken = context.cookies.get('sb-refresh-token')?.value;
        if (refreshToken) {
          cookies.push({ name: 'sb-refresh-token', value: refreshToken });
        }

        return cookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options);
        });
      },
    },
  });
};
