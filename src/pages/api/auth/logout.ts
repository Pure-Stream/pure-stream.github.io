import type { APIRoute } from 'astro';

/**
 * API endpoint to clear session cookies
 */
export const POST: APIRoute = async (context) => {
  try {
    // Clear Supabase session cookies
    context.cookies.delete('sb-access-token', { path: '/' });
    context.cookies.delete('sb-refresh-token', { path: '/' });

    console.log('[Logout API] Session cookies cleared');

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Logout API] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to logout' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
