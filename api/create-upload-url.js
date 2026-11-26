import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Serverless Function: Secure Upload Authorization
 * 
 * Generates restricted short-lived signed upload URLs for photos (no size limits)
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
    const { fileName, mimeType } = req.body || {};

    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ error: 'Valid fileName is required.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({
        error: 'Server Supabase credentials not configured.',
        configured: false
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Generate unique storage path for photo
    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const safeBaseName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 9);
    const storagePath = `photos/${timestamp}_${randomHex}_${safeBaseName}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .createSignedUploadUrl(storagePath, 3600);

    if (uploadError) {
      return res.status(500).json({ error: `Storage error: ${uploadError.message}` });
    }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath);

    return res.status(200).json({
      success: true,
      path: uploadData.path,
      token: uploadData.token,
      signedUrl: uploadData.signedUrl,
      publicUrl: publicUrlData.publicUrl
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred during upload authorization.'
    });
  }
}
