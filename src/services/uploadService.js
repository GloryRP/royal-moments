import { createMediaRecord } from './mediaService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Normalizes file MIME types across mobile browsers and cameras
 * (e.g. Android cameras often report .jpg as 'image/jpg' or empty, which can fail strict storage filters)
 */
export function getStandardMimeType(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  if (ext === 'avif') return 'image/avif';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'mov') return 'video/quicktime';
  return file.type || 'image/jpeg';
}

/**
 * Generates a clean, unique cloud storage path for a file
 */
function generateStoragePath(file) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeBaseName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const timestamp = Date.now();
  const randomHex = Math.random().toString(36).substring(2, 9);
  return `photos/${timestamp}_${randomHex}_${safeBaseName}.${ext}`;
}

/**
 * Uploads a single media file to Supabase with automatic retry and multi-strategy fallbacks
 * 
 * @param {File} file 
 * @param {object} options 
 * @param {string} options.contributorName
 * @param {string} options.caption
 * @param {function} options.onProgress
 * @returns {Promise<object>} Created media record
 */
export async function uploadMediaFile(file, options = {}) {
  const { onProgress } = options;

  if (onProgress) onProgress(10);

  // If in pure Demo mode (Supabase not configured in client), simulate upload
  if (!isSupabaseConfigured()) {
    return simulateDemoUpload(file, 'Family Member', '', onProgress);
  }

  const mimeType = getStandardMimeType(file);
  const storagePath = generateStoragePath(file);

  // Strategy 1: Direct Supabase Storage REST API upload with real-time XHR progress
  // (Fastest, zero-latency direct upload directly from client to Supabase Storage)
  try {
    const record = await uploadWithRetry(() => uploadDirectWithXhr(storagePath, file, mimeType, onProgress), 3);
    return record;
  } catch (directXhrErr) {
    console.warn('Direct XHR upload attempt failed, trying Supabase SDK upload:', directXhrErr);
  }

  // Strategy 2: Supabase Storage JavaScript Client upload
  try {
    const record = await uploadDirectViaSdk(storagePath, file, mimeType, onProgress);
    return record;
  } catch (sdkErr) {
    console.warn('Supabase SDK upload failed, trying Signed URL upload fallback:', sdkErr);
  }

  // Strategy 3: Serverless Signed URL authorization upload
  return uploadViaSignedUrl(file, mimeType, onProgress);
}

/**
 * Executes an async upload function with automatic retry on transient failure
 */
async function uploadWithRetry(uploadFn, maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await uploadFn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        // Wait 1.2s * attempt before retrying transient mobile connection drop
        await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
      }
    }
  }
  throw lastError;
}

/**
 * Direct upload via Supabase Storage REST API using XMLHttpRequest for fine-grained progress
 */
function uploadDirectWithXhr(storagePath, file, mimeType, onProgress) {
  return new Promise((resolve, reject) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const uploadEndpoint = `${supabaseUrl}/storage/v1/object/media/${storagePath}`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadEndpoint);
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`);
    xhr.setRequestHeader('Content-Type', mimeType);
    xhr.setRequestHeader('x-upsert', 'false');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        // Map upload progress into 10% - 85% range
        const percent = 10 + Math.round((e.loaded / e.total) * 75);
        onProgress(Math.min(85, percent));
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(90);

        try {
          const { data: publicUrlData } = supabase.storage
            .from('media')
            .getPublicUrl(storagePath);

          const mediaRecord = {
            file_path: publicUrlData.publicUrl,
            file_name: file.name,
            media_type: mimeType.startsWith('video/') ? 'video' : 'image',
            mime_type: mimeType,
            file_size: file.size,
            contributor_name: 'Family',
            caption: null
          };

          const { data: createdRecord, error: insertError } = await createMediaRecord(mediaRecord);
          if (insertError) {
            reject(new Error(`Failed to save photo details: ${insertError}`));
            return;
          }

          if (onProgress) onProgress(100);
          resolve(createdRecord);
        } catch (dbErr) {
          reject(dbErr);
        }
      } else {
        try {
          const errResponse = JSON.parse(xhr.responseText);
          reject(new Error(errResponse.message || errResponse.error || `Upload failed (status ${xhr.status})`));
        } catch {
          reject(new Error(`Storage upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload. Please check your internet connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out. Please try again.'));
    };

    xhr.send(file);
  });
}

/**
 * Direct upload using standard Supabase Storage JS Client
 */
async function uploadDirectViaSdk(storagePath, file, mimeType, onProgress) {
  if (onProgress) onProgress(40);

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false
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
    media_type: mimeType.startsWith('video/') ? 'video' : 'image',
    mime_type: mimeType,
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
 * Serverless Signed URL authorization upload fallback
 */
async function uploadViaSignedUrl(file, mimeType, onProgress) {
  if (onProgress) onProgress(30);

  const res = await fetch('/api/create-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: mimeType,
      fileSize: file.size
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Upload authorization failed (${res.status}): ${errText || res.statusText}`);
  }

  const { signedUrl, path, publicUrl } = await res.json();
  if (!signedUrl) {
    throw new Error('Server did not return a valid signed upload URL.');
  }

  if (onProgress) onProgress(50);

  // Upload directly to signed storage URL
  await uploadWithProgress(signedUrl, file, mimeType, (percent) => {
    const mapped = 50 + Math.round(percent * 0.4);
    if (onProgress) onProgress(mapped);
  });

  if (onProgress) onProgress(92);

  const mediaRecord = {
    file_path: publicUrl || path,
    file_name: file.name,
    media_type: mimeType.startsWith('video/') ? 'video' : 'image',
    mime_type: mimeType,
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
 * Uploads file to signed URL with XHR progress monitoring
 */
function uploadWithProgress(url, file, mimeType, onPercent) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', mimeType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onPercent) {
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
 * Creates a local demo record with object URL for preview mode
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
