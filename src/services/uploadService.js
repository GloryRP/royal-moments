import { createMediaRecord } from './mediaService';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * Uploads a single media file to Supabase via authorized signed upload URL
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
  const { contributorName = 'Family Member', caption = '', passcode = '', onProgress } = options;

  if (onProgress) onProgress(10);

  // If in pure Demo mode (Supabase not configured in client), simulate realistic upload
  if (!isSupabaseConfigured()) {
    return simulateDemoUpload(file, contributorName, caption, onProgress);
  }

  // Step 1: Request signed upload authorization from serverless backend
  if (onProgress) onProgress(25);

  let authResponse;
  try {
    const res = await fetch('/api/create-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        fileSize: file.size,
        passcode: passcode.trim()
      })
    });

    const data = await res.json();
    if (!res.ok) {
      if (data.missingEnv || !data.configured) {
        console.warn('Backend environment not configured, switching to local demo mode for this upload.');
        return simulateDemoUpload(file, contributorName, caption, onProgress);
      }
      throw new Error(data.error || 'Failed to authorize upload.');
    }

    authResponse = data;
  } catch (err) {
    // If running in development without api route or connection error
    if (err.message.includes('Failed to fetch') || err.message.includes('404')) {
      console.warn('Upload API not reachable directly, attempting demo upload:', err);
      return simulateDemoUpload(file, contributorName, caption, onProgress);
    }
    throw err;
  }

  const { signedUrl, path, publicUrl } = authResponse;
  if (onProgress) onProgress(50);

  // Step 2: Upload binary directly to Supabase Storage signed URL
  // Use XMLHttpRequest or fetch to support PUT
  await uploadWithProgress(signedUrl, file, (progressPercent) => {
    // Map storage upload from 50% to 90%
    const mapped = 50 + Math.round(progressPercent * 0.4);
    if (onProgress) onProgress(mapped);
  });

  if (onProgress) onProgress(92);

  // Step 3: Insert metadata record into Supabase PostgreSQL
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov)$/i.test(file.name);
  const mediaRecord = {
    file_path: publicUrl || path,
    file_name: file.name,
    media_type: isVideo ? 'video' : 'image',
    mime_type: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
    file_size: file.size,
    contributor_name: contributorName.trim() || 'Family Member',
    caption: caption.trim() || null
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
