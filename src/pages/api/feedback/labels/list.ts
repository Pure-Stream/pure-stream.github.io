import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';
import { jsonResponse } from '../../../../lib/api-utils';

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from('WordWeb_label')
      .select('*')
      .order('name');

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ data });
  } catch (error) {
    console.error('Error fetching labels:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
