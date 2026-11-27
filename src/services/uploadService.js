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
 * @param {AbortSignal} [options.signal] Optional signal to cancel upload
 * @returns {Promise<object>} Created media record
 */
export async function uploadMediaFile(file, options = {}) {
  const { onProgress, signal } = options;

  if (signal?.aborted) {
    throw new DOMException('Upload cancelled by user', 'AbortError');
  }

  if (onProgress) onProgress(10);

  // If in pure Demo mode (Supabase not configured in client), simulate upload
  if (!isSupabaseConfigured()) {
    return simulateDemoUpload(file, 'Family Member', '', onProgress, signal);
  }

  const mimeType = getStandardMimeType(file);
  const storagePath = generateStoragePath(file);

  // Strategy 1: Direct Supabase Storage REST API upload with real-time XHR progress
  // (Fastest, zero-latency direct upload directly from client to Supabase Storage)
  try {
    const record = await uploadWithRetry(
      () => uploadDirectWithXhr(storagePath, file, mimeType, onProgress, signal),
      3,
      signal
    );
    return record;
  } catch (directXhrErr) {
    if (signal?.aborted || directXhrErr?.name === 'AbortError') {
      throw directXhrErr;
    }
    console.warn('Direct XHR upload attempt failed, trying Supabase SDK upload:', directXhrErr);
  }

  if (signal?.aborted) {
    throw new DOMException('Upload cancelled by user', 'AbortError');
  }

  // Strategy 2: Supabase Storage JavaScript Client upload
  try {
    const record = await uploadDirectViaSdk(storagePath, file, mimeType, onProgress, signal);
    return record;
  } catch (sdkErr) {
    if (signal?.aborted || sdkErr?.name === 'AbortError') {
      throw sdkErr;
    }
    console.warn('Supabase SDK upload failed, trying Signed URL upload fallback:', sdkErr);
  }

  if (signal?.aborted) {
    throw new DOMException('Upload cancelled by user', 'AbortError');
  }

  // Strategy 3: Serverless Signed URL authorization upload
  return uploadViaSignedUrl(file, mimeType, onProgress, signal);
}

/**
 * Executes an async upload function with automatic retry on transient failure
 */
async function uploadWithRetry(uploadFn, maxAttempts = 3, signal) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Upload cancelled by user', 'AbortError');
    }

    try {
      return await uploadFn();
    } catch (err) {
      if (signal?.aborted || err?.name === 'AbortError') {
        throw err;
      }
      lastError = err;
      if (attempt < maxAttempts) {
        // Wait 1.2s * attempt before retrying transient mobile connection drop
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(resolve, attempt * 1200);
          if (signal) {
            const abortHandler = () => {
              clearTimeout(timeoutId);
              reject(new DOMException('Upload cancelled by user', 'AbortError'));
            };
            signal.addEventListener('abort', abortHandler, { once: true });
          }
        });
      }
    }
  }
  throw lastError;
}

/**
 * Direct upload via Supabase Storage REST API using XMLHttpRequest for fine-grained progress
 */
function uploadDirectWithXhr(storagePath, file, mimeType, onProgress, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException('Upload cancelled by user', 'AbortError'));
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const uploadEndpoint = `${supabaseUrl}/storage/v1/object/media/${storagePath}`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadEndpoint);
    xhr.setRequestHeader('apikey', anonKey);
    xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`);
    xhr.setRequestHeader('Content-Type', mimeType);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.timeout = 90000; // 90 seconds timeout for mobile network resilience

    const handleAbort = () => {
      xhr.abort();
      reject(new DOMException('Upload cancelled by user', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', handleAbort, { once: true });
    }

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }
    };

    xhr.upload.onprogress = (e) => {
      if (signal?.aborted) return;
      if (e.lengthComputable && onProgress) {
        // Map upload progress into 10% - 85% range
        const percent = 10 + Math.round((e.loaded / e.total) * 75);
        onProgress(Math.min(85, percent));
      }
    };

    xhr.onload = async () => {
      cleanup();
      if (signal?.aborted) {
        return reject(new DOMException('Upload cancelled by user', 'AbortError'));
      }

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
      cleanup();
      if (signal?.aborted) {
        return reject(new DOMException('Upload cancelled by user', 'AbortError'));
      }
      reject(new Error('Network error during upload. Please check your internet connection.'));
    };

    xhr.ontimeout = () => {
      cleanup();
      if (signal?.aborted) {
        return reject(new DOMException('Upload cancelled by user', 'AbortError'));
      }
      reject(new Error('Upload timed out. Mobile connection was too slow.'));
    };

    xhr.onabort = () => {
      cleanup();
      reject(new DOMException('Upload cancelled by user', 'AbortError'));
    };

    xhr.send(file);
  });
}

/**
 * Direct upload using standard Supabase Storage JS Client
 */
async function uploadDirectViaSdk(storagePath, file, mimeType, onProgress, signal) {
  if (signal?.aborted) {
    throw new DOMException('Upload cancelled by user', 'AbortError');
  }

  if (onProgress) onProgress(40);

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false
    });

  if (signal?.aborted) {
    throw new DOMException('Upload cancelled by user', 'AbortError');
  }

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
async function uploadViaSignedUrl(file, mimeType, onProgress, signal) {
  if (signal?.aborted) {
    throw new DOMException('Upload cancelled by user', 'AbortError');
  }

  if (onProgress) onProgress(30);

  const res = await fetch('/api/create-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: mimeType,
      fileSize: file.size
    }),
    signal
  });

  if (signal?.aborted) {
    throw new DOMException('Upload cancelled by user', 'AbortError');
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Upload authorization failed (${res.status}): ${errText || res.statusText}`);
  }

  const { signedUrl, path, publicUrl } = await res.json();
  if (!signedUrl) {
    throw new Error('Server did not return a valid signed upload URL.');
  }

  if (signal?.aborted) {
    throw new DOMException('Upload cancelled by user', 'AbortError');
  }

  if (onProgress) onProgress(50);

  // Upload directly to signed storage URL
  await uploadWithProgress(signedUrl, file, mimeType, (percent) => {
    const mapped = 50 + Math.round(percent * 0.4);
    if (onProgress) onProgress(mapped);
  }, signal);

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
function uploadWithProgress(url, file, mimeType, onPercent, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException('Upload cancelled by user', 'AbortError'));
    }

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', mimeType);
    xhr.timeout = 90000;

    const handleAbort = () => {
      xhr.abort();
      reject(new DOMException('Upload cancelled by user', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', handleAbort, { once: true });
    }

    const cleanup = () => {
      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }
    };

    xhr.upload.onprogress = (e) => {
      if (signal?.aborted) return;
      if (e.lengthComputable && onPercent) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onPercent(percent);
      }
    };

    xhr.onload = () => {
      cleanup();
      if (signal?.aborted) {
        return reject(new DOMException('Upload cancelled by user', 'AbortError'));
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      cleanup();
      if (signal?.aborted) {
        return reject(new DOMException('Upload cancelled by user', 'AbortError'));
      }
      reject(new Error('Network error occurred during storage upload.'));
    };

    xhr.ontimeout = () => {
      cleanup();
      if (signal?.aborted) {
        return reject(new DOMException('Upload cancelled by user', 'AbortError'));
      }
      reject(new Error('Storage upload timed out.'));
    };

    xhr.onabort = () => {
      cleanup();
      reject(new DOMException('Upload cancelled by user', 'AbortError'));
    };

    xhr.send(file);
  });
}

/**
 * Creates a local demo record with object URL for preview mode
 */
async function simulateDemoUpload(file, contributorName, caption, onProgress, signal) {
  const steps = [20, 50, 75, 95, 100];
  for (const p of steps) {
    if (signal?.aborted) {
      throw new DOMException('Upload cancelled by user', 'AbortError');
    }
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
