import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Serverless Function: Secure Upload Authorization
 * 
 * Generates restricted short-lived signed upload URLs using the server-side
 * SUPABASE_SERVICE_ROLE_KEY without ever exposing secrets to frontend clients.
 */
export default async function handler(req, res) {
  // Set CORS headers for security and flexibility
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { fileName, mimeType, fileSize, passcode } = req.body || {};

    // 1. Validate Optional Upload Passcode (Anti-spam protection)
    const requiredPasscode = process.env.UPLOAD_ACCESS_SECRET;
    if (requiredPasscode && passcode !== requiredPasscode) {
      return res.status(401).json({
        error: 'Upload authorization failed: Invalid family passcode.'
      });
    }

    // 2. Validate Parameters
    if (!fileName || typeof fileName !== 'string') {
      return res.status(400).json({ error: 'Valid fileName is required.' });
    }
    if (!mimeType || typeof mimeType !== 'string') {
      return res.status(400).json({ error: 'Valid mimeType is required.' });
    }

    // 3. Validate MIME Types
    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const allowedVideoMimes = ['video/mp4', 'video/quicktime'];
    const isImage = allowedImageMimes.includes(mimeType);
    const isVideo = allowedVideoMimes.includes(mimeType);

    if (!isImage && !isVideo) {
      return res.status(400).json({
        error: `Unsupported file format (${mimeType}). Only JPG, PNG, WEBP, MP4, and MOV are supported.`
      });
    }

    // 4. Validate File Size Limits
    const maxImageSize = 20 * 1024 * 1024; // 20 MB
    const maxVideoSize = 100 * 1024 * 1024; // 100 MB
    const limit = isVideo ? maxVideoSize : maxImageSize;

    if (fileSize && fileSize > limit) {
      return res.status(400).json({
        error: `File size exceeds the limit (${isVideo ? '100 MB' : '20 MB'}).`
      });
    }

    // 5. Initialize Supabase Admin Client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({
        error: 'Server is not configured with Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        configured: false
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 6. Generate Unique, Collision-resistant File Path
    const ext = fileName.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
    const safeBaseName = fileName
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 9);
    const folder = isVideo ? 'videos' : 'photos';
    const storagePath = `${folder}/${timestamp}_${randomHex}_${safeBaseName}.${ext}`;

    // 7. Generate Signed Upload URL
    // Standard Supabase storage createSignedUploadUrl generates a 60-second valid URL with token
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .createSignedUploadUrl(storagePath);

    if (uploadError) {
      return res.status(500).json({
        error: `Storage error: ${uploadError.message}`
      });
    }

    // Public URL for accessing after upload
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
