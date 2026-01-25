import type { APIRoute } from 'astro';
import { supabase } from '../../../../../lib/supabase';
import { requireAuth, jsonResponse } from '../../../../../lib/api-utils';

export const POST: APIRoute = async (context) => {
  try {
    const user = await requireAuth(context);
    const { text } = await context.request.json();

    // Validate
    if (!text || text.trim().length === 0) {
      return jsonResponse({ error: 'Comment text is required' }, 400);
    }

    if (text.length > 2000) {
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
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ data }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error creating comment:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
