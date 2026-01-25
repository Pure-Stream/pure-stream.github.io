import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { requireAuth, jsonResponse } from '../../../../../lib/api-utils';

export const POST: APIRoute = async (context) => {
  try {
    const user = await requireAuth(context);
    const supabase = createServerSupabaseClient(context);
    const { text } = await context.request.json();

    // Validate
    if (!text || text.trim().length === 0) {
      console.warn('[Validation Error]', {
        error: 'Comment text is empty',
        userId: user.id,
        feedbackId: context.params.id,
        path: context.url.pathname
      });
      return jsonResponse({ error: 'Comment text is required' }, 400);
    }

    if (text.length > 2000) {
      console.warn('[Validation Error]', {
        error: 'Comment text too long',
        textLength: text.length,
        userId: user.id,
        feedbackId: context.params.id,
        path: context.url.pathname
      });
      return jsonResponse({ error: 'Comment text is too long (max 2000 characters)' }, 400);
    }

    // Create comment
    const { data, error } = await supabase
      .from('WordWeb_comment')
      .insert({
        feedback_id: context.params.id,
        author_id: user.id,
        text: text.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Database Error - Create Comment]', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        feedbackId: context.params.id,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      return jsonResponse({
        error: 'Failed to create comment',
        details: import.meta.env.DEV ? error.message : undefined
      }, 500);
    }

    console.log('[Comment Created]', {
      commentId: data.id,
      feedbackId: context.params.id,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    return jsonResponse({ data }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error creating comment:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
