import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';

interface SessionBody {
  accessToken: string;
  refreshToken: string;
}

/**
 * API endpoint to set session cookies from the client
 * Receives session tokens from client-side auth and sets them as cookies
 */
export const POST: APIRoute = async (context) => {
  try {
    const body = (await context.request.json()) as SessionBody;
    const { accessToken, refreshToken } = body;

    console.log('[Session API] Received tokens, setting cookies');
    console.log('[Session API] Access token length:', accessToken.length);
    console.log('[Session API] Refresh token:', refreshToken ? 'present' : 'missing');

    // Set the tokens as HTTP-only cookies
    // Supabase expects these cookie names
    const isProduction = context.url.hostname !== 'localhost' && context.url.hostname !== '127.0.0.1';
    console.log('[Session API] Is production:', isProduction);
    console.log('[Session API] Hostname:', context.url.hostname);

    const accessTokenCookie = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    };

    context.cookies.set('sb-access-token', accessToken, accessTokenCookie);
    console.log('[Session API] Set sb-access-token cookie');

    if (refreshToken) {
      context.cookies.set('sb-refresh-token', refreshToken, accessTokenCookie);
      console.log('[Session API] Set sb-refresh-token cookie');
    }

    console.log('[Session API] Cookies set successfully');

    // Return success - cookies will be available on next request
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Session cookies set',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Session API] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to set session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
