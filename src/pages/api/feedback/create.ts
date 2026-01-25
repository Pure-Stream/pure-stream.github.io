import type { APIRoute } from 'astro';
import { createServerSupabaseClient } from '../../../lib/supabase';
import { requireAuth, jsonResponse } from '../../../lib/api-utils';

export const POST: APIRoute = async (context) => {
  try {
    const user = await requireAuth(context);
    const supabase = createServerSupabaseClient(context);
    const body = await context.request.json();

    const { title, description, labelIds } = body;

    // Validate
    if (!title || title.length < 5) {
      console.warn('[Validation Error]', {
        error: 'Title too short',
        titleLength: title?.length || 0,
        userId: user.id,
        path: context.url.pathname
      });
      return jsonResponse({ error: 'Title must be at least 5 characters' }, 400);
    }

    if (!description || description.length < 10) {
      console.warn('[Validation Error]', {
        error: 'Description too short',
        descriptionLength: description?.length || 0,
        userId: user.id,
        path: context.url.pathname
      });
      return jsonResponse({ error: 'Description must be at least 10 characters' }, 400);
    }

    // Create feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('WordWeb_feedback')
      .insert({
        title,
        description,
        author_id: user.id,
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('[Database Error - Create Feedback]', {
        error: feedbackError.message,
        code: feedbackError.code,
        details: feedbackError.details,
        hint: feedbackError.hint,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      return jsonResponse({
        error: 'Failed to create feedback',
        details: import.meta.env.DEV ? feedbackError.message : undefined
      }, 500);
    }

    console.log('[Feedback Created]', {
      feedbackId: feedback.id,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    // Add labels if provided
    if (labelIds && Array.isArray(labelIds) && labelIds.length > 0) {
      const { error: labelError } = await supabase
        .from('WordWeb_feedback_label')
        .insert(
          labelIds.map((labelId: string) => ({
            feedback_id: feedback.id,
            label_id: labelId,
          }))
        );

      if (labelError) {
        console.error('[Database Error - Add Labels]', {
          feedbackId: feedback.id,
          error: labelError.message,
          labelIds,
          timestamp: new Date().toISOString()
        });
        // Don't fail the whole request if labels fail
      }
    }

    return jsonResponse({ data: feedback }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Error creating feedback:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
