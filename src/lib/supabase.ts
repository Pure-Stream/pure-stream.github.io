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
        // Get all cookies from the request
        const cookies: { name: string; value: string }[] = [];
        const cookieHeader = context.request.headers.get('cookie') || '';

        // Parse cookie header string
        cookieHeader.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) {
            cookies.push({
              name: name.trim(),
              value: decodeURIComponent(value.trim()),
            });
          }
        });

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
