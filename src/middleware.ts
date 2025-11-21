import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';
import { PROTECTED_ROUTES, ROUTES } from './config/constants';

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await getSession(context.request);

  // Attach session to locals so it's available in pages
  context.locals.session = session;

  // Protect authenticated routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // Redirect to login if not authenticated
    return context.redirect(ROUTES.LOGIN);
  }

  return next();
});
