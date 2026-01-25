import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { jsonResponse } from '../../../lib/api-utils';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { data, error } = await supabase
      .from('WordWeb_feedback')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        closed_at,
        author_id,
        labels:WordWeb_feedback_label(
          label:WordWeb_label(id, name, color)
        ),
        comments:WordWeb_comment(
          id,
          text,
          created_at,
          author_id
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return jsonResponse({ error: 'Feedback not found' }, 404);
    }

    return jsonResponse({ data });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
