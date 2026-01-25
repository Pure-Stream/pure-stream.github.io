import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { jsonResponse } from '../../../lib/api-utils';

export const GET: APIRoute = async ({ url }) => {
  const status = url.searchParams.get('status') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50');

  try {
    let query = supabase
      .from('WordWeb_feedback')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        author_id,
        labels:WordWeb_feedback_label(
          label:WordWeb_label(id, name, color)
        ),
        comment_count:WordWeb_comment(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ data });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
