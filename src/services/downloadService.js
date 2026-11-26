import JSZip from 'jszip';

/**
 * Downloads a single media item preserving its original resolution and name
 * @param {object} item
 * @returns {Promise<void>}
 */
export async function downloadIndividualFile(item) {
  if (!item || !item.file_path) {
    throw new Error('Media file URL not found.');
  }

  const safeFileName = sanitizeFileName(item.file_name || 'royal-moment-photo.jpg');

  try {
    const response = await fetch(item.file_path, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    triggerBrowserDownload(blobUrl, safeFileName);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1500);
  } catch (err) {
    // If CORS prevents direct blob fetch, fallback to window.open or link click
    console.warn('Direct fetch failed, falling back to direct anchor download:', err);
    triggerBrowserDownload(item.file_path, safeFileName);
  }
}

/**
 * Downloads the complete album as an organized ZIP archive
 * @param {Array<object>} mediaList
 * @param {function} onProgress callback with { percent, current, total, currentFileName }
 * @returns {Promise<void>}
 */
export async function downloadAlbumZip(mediaList, onProgress) {
  if (!mediaList || mediaList.length === 0) {
    throw new Error('No memories available to download.');
  }

  const zip = new JSZip();
  const photosFolder = zip.folder('Photos');
  const videosFolder = zip.folder('Videos');

  const total = mediaList.length;
  let completed = 0;
  let failed = 0;

  // Process items sequentially or in small concurrency batches (3 at a time) to protect browser memory
  const BATCH_SIZE = 3;
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = mediaList.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (item) => {
        const isVideo = item.media_type === 'video';
        const targetFolder = isVideo ? videosFolder : photosFolder;
        const baseName = sanitizeFileName(item.file_name || `${isVideo ? 'video' : 'photo'}_${item.id}`);

        try {
          if (onProgress) {
            onProgress({
              percent: Math.round((completed / total) * 85),
              current: completed + 1,
              total,
              currentFileName: item.file_name
            });
          }

          const response = await fetch(item.file_path, { mode: 'cors' });
          if (!response.ok) {
            throw new Error(`Fetch failed for ${item.file_name}`);
          }

          const blob = await response.blob();
          targetFolder.file(baseName, blob);
          completed++;
        } catch (err) {
          console.warn(`Failed to include ${item.file_name} in zip:`, err);
          failed++;
          completed++;
        }
      })
    );
  }

  if (completed === failed) {
    throw new Error('Unable to download files. Network or CORS restriction prevented file loading.');
  }

  if (onProgress) {
    onProgress({
      percent: 90,
      current: total,
      total,
      status: 'Generating ZIP archive...'
    });
  }

  // Generate the zip blob with deflate compression
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress({
          percent: 90 + Math.round(metadata.percent * 0.1),
          current: total,
          total,
          status: 'Compressing archive...'
        });
      }
    }
  );

  const archiveUrl = window.URL.createObjectURL(zipBlob);
  const zipName = `Royal_Moments_Engagement_Album_${new Date().toISOString().slice(0, 10)}.zip`;
  triggerBrowserDownload(archiveUrl, zipName);
  setTimeout(() => window.URL.revokeObjectURL(archiveUrl), 3000);

  return { total, successCount: total - failed, failedCount: failed };
}

/**
 * Triggers a native browser file download
 */
function triggerBrowserDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Strips unsafe characters from filenames
 */
function sanitizeFileName(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '_');
}
