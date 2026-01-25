import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { requireAuth, jsonResponse } from '../../../lib/api-utils';

export const POST: APIRoute = async (context) => {
  try {
    const user = await requireAuth(context);
    const body = await context.request.json();

    const { title, description, labelIds } = body;

    // Validate
    if (!title || title.length < 5) {
      return jsonResponse({ error: 'Title must be at least 5 characters' }, 400);
    }

    if (!description || description.length < 10) {
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
      return jsonResponse({ error: feedbackError.message }, 500);
    }

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
        console.error('Error adding labels:', labelError);
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
