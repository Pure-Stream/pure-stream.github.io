import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';
import { PROTECTED_ROUTES, ROUTES } from './config/constants';

export const onRequest = defineMiddleware(async (context, next) => {
  // Get access token from cookies
  const accessToken = context.cookies.get('sb-access-token')?.value;
  const refreshToken = context.cookies.get('sb-refresh-token')?.value;

  let user = null;

  // If we have tokens, try to get the user
  if (accessToken) {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(accessToken);
      if (authUser && !error) {
        user = authUser;
      }
    } catch (err) {
      console.error('Auth error in middleware:', err);
    }
  }

  // Attach user to locals so it's available in pages
  context.locals.user = user;

  // Protect authenticated routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    // Redirect to login if not authenticated
    return context.redirect(ROUTES.LOGIN);
  }

  return next();
});
