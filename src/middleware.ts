import { defineMiddleware } from 'astro:middleware';
import { createServerSupabaseClient } from './lib/supabase';
import { PROTECTED_ROUTES, ROUTES } from './config/constants';

export const onRequest = defineMiddleware(async (context, next) => {
  // Create server-side Supabase client with cookie support
  const supabase = createServerSupabaseClient(context);

  // Debug logging
  const pathname = context.url.pathname;
  console.log(`[Middleware] Path: ${pathname}`);

  // Log cookies received in request
  const cookieHeader = context.request.headers.get('cookie');
  console.log(`[Middleware] Cookie header: ${cookieHeader || '(none)'}`);

  let user = null;

  // Get the session from cookies
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session && !error) {
      user = session.user;
      console.log(`[Middleware] User authenticated: ${user.email}`);
    } else {
      console.log(`[Middleware] No session found`);
      if (error) {
        console.log(`[Middleware] Session error: ${error.message}`);
      }
    }
  } catch (err) {
    console.error('[Middleware] Error getting session:', err);
  }

  // Attach user to locals so it's available in pages
  context.locals.user = user;

  // Protect authenticated routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    console.log(`[Middleware] Protected route without user, redirecting to login`);
    // Redirect to login if not authenticated
    return context.redirect(ROUTES.LOGIN);
  }

  return next();
});
