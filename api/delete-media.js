import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Serverless Function: Passcode-Protected Media Deletion
 * 
 * Verifies organizer passcode ('nov22') before removing media records
 * from Supabase Storage and PostgreSQL database using service_role key.
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
    const { id, filePath, passcode } = req.body || {};

    // 1. Verify Passcode ('nov22' or custom env)
    const validPasscode = process.env.ADMIN_DELETE_PASSCODE || 'nov22';
    if (!passcode || passcode.trim().toLowerCase() !== validPasscode.toLowerCase()) {
      return res.status(401).json({
        error: 'Invalid organizer passcode. Only authorized family organizers can delete memories.'
      });
    }

    if (!id) {
      return res.status(400).json({ error: 'Media ID is required.' });
    }

    // 2. Initialize Supabase Admin Client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({
        error: 'Server Supabase credentials not configured.',
        configured: false
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 3. Delete from Supabase Storage if a storage path is available
    if (filePath && !filePath.startsWith('blob:')) {
      let storagePath = filePath;
      // Extract relative path if full URL was provided
      if (filePath.includes('/storage/v1/object/public/media/')) {
        storagePath = filePath.split('/storage/v1/object/public/media/')[1];
      }
      try {
        await supabase.storage.from('media').remove([storagePath]);
      } catch (storageErr) {
        console.warn('Storage file deletion warning:', storageErr);
      }
    }

    // 4. Delete row from PostgreSQL database
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    return res.status(200).json({ success: true, id });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
