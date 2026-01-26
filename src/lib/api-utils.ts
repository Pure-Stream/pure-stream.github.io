import type { APIContext } from 'astro';
import { createServerSupabaseClient } from './supabase';

export async function requireAuth(context: APIContext) {
  const accessToken = context.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    console.error('[API Auth Error]', {
      path: context.url.pathname,
      error: 'No access token in cookies',
      timestamp: new Date().toISOString()
    });

    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const supabase = createServerSupabaseClient(context);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    console.error('[API Auth Error]', {
      path: context.url.pathname,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    throw new Response(JSON.stringify({
      error: 'Authentication failed',
      details: import.meta.env.DEV ? error.message : undefined
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!user) {
    console.error('[API Auth Error]', {
      path: context.url.pathname,
      error: 'No user in session',
      timestamp: new Date().toISOString()
    });

    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log('[API Auth Success]', {
    userId: user.id,
    email: user.email,
    path: context.url.pathname
  });

  return user;
}

export function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
