import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Serverless Function: Update Media Display Order
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { orderedIds } = req.body || {};

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: 'Array of orderedIds is required.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({ error: 'Server Supabase credentials not configured.' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase.rpc('update_media_order', {
      p_ordered_ids: orderedIds
    });

    if (error) {
      // Fallback to iterative updates if rpc encounters an issue
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase
          .from('media')
          .update({ display_order: i + 1 })
          .eq('id', orderedIds[i]);
      }
    }

    return res.status(200).json({ success: true, count: orderedIds.length });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update order' });
  }
}
