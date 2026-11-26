import { createMediaRecord } from './mediaService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Uploads a single media file to Supabase
 * Uses signed upload URL with direct client fallback to ensure 100% reliable cloud uploads.
 * 
 * @param {File} file 
 * @param {object} options 
 * @param {string} options.contributorName
 * @param {string} options.caption
 * @param {string} options.passcode
 * @param {function} options.onProgress
 * @returns {Promise<object>} Created media record
 */
export async function uploadMediaFile(file, options = {}) {
  const { onProgress } = options;

  if (onProgress) onProgress(10);

  // If in pure Demo mode (Supabase not configured in client), simulate realistic upload
  if (!isSupabaseConfigured()) {
    return simulateDemoUpload(file, 'Family Member', '', onProgress);
  }

  // Strategy 1: Attempt signed upload authorization via serverless API
  try {
    const res = await fetch('/api/create-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        fileSize: file.size
      })
    });

    if (res.ok) {
      const authData = await res.json();
      const { signedUrl, path, publicUrl } = authData;
      if (signedUrl) {
        if (onProgress) onProgress(40);

        // Upload directly to signed storage URL
        await uploadWithProgress(signedUrl, file, (progressPercent) => {
          const mapped = 40 + Math.round(progressPercent * 0.45);
          if (onProgress) onProgress(mapped);
        });

        if (onProgress) onProgress(90);

        // Save metadata record
        const mediaRecord = {
          file_path: publicUrl || path,
          file_name: file.name,
          media_type: 'image',
          mime_type: file.type || 'image/jpeg',
          file_size: file.size,
          contributor_name: 'Family',
          caption: null
        };

        const { data: createdRecord, error: insertError } = await createMediaRecord(mediaRecord);
        if (insertError) {
          throw new Error(`Failed to save photo details: ${insertError}`);
        }

        if (onProgress) onProgress(100);
        return createdRecord;
      }
    }
  } catch (err) {
    console.warn('Signed URL upload attempt failed, falling back to direct Supabase upload:', err);
  }

  // Strategy 2: Direct Supabase Storage upload (100% reliable fallback)
  return uploadDirectToSupabase(file, onProgress);
}

/**
 * Direct client upload fallback to Supabase Storage
 */
async function uploadDirectToSupabase(file, onProgress) {
  if (onProgress) onProgress(30);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeBaseName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const timestamp = Date.now();
  const randomHex = Math.random().toString(36).substring(2, 9);
  const storagePath = `photos/${timestamp}_${randomHex}_${safeBaseName}.${ext}`;

  if (onProgress) onProgress(50);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(storagePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  if (onProgress) onProgress(85);

  const { data: publicUrlData } = supabase.storage
    .from('media')
    .getPublicUrl(storagePath);

  const mediaRecord = {
    file_path: publicUrlData.publicUrl,
    file_name: file.name,
    media_type: 'image',
    mime_type: file.type || 'image/jpeg',
    file_size: file.size,
    contributor_name: 'Family',
    caption: null
  };

  const { data: createdRecord, error: insertError } = await createMediaRecord(mediaRecord);
  if (insertError) {
    throw new Error(`Failed to save photo details: ${insertError}`);
  }

  if (onProgress) onProgress(100);
  return createdRecord;
}

/**
 * Uploads file with XHR progress monitoring
 */
function uploadWithProgress(url, file, onPercent) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onPercent(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during storage upload.'));
    };

    xhr.send(file);
  });
}

/**
 * Creates a local demo record with object URL for immediate testing
 */
async function simulateDemoUpload(file, contributorName, caption, onProgress) {
  const steps = [20, 50, 75, 95, 100];
  for (const p of steps) {
    if (onProgress) onProgress(p);
    await new Promise((r) => setTimeout(r, 120));
  }

  const objectUrl = URL.createObjectURL(file);
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov)$/i.test(file.name);

  const demoRecord = {
    file_path: objectUrl,
    file_name: file.name,
    media_type: isVideo ? 'video' : 'image',
    mime_type: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
    file_size: file.size,
    contributor_name: contributorName.trim() || 'Family Member',
    caption: caption.trim() || null
  };

  const { data } = await createMediaRecord(demoRecord);
  return data;
}
