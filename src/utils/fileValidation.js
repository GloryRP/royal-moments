import { siteConfig } from '../config/siteConfig';

/**
 * Validates a file before upload
 * @param {File} file
 * @returns {{ valid: boolean, error?: string, isVideo: boolean }}
 */
export function validateMediaFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const { allowedImageTypes, allowedVideoTypes, maxImageSizeMB, maxVideoSizeMB } = siteConfig.upload;
  const isImage = allowedImageTypes.includes(file.type.toLowerCase()) || 
                  /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);
  const isVideo = allowedVideoTypes.includes(file.type.toLowerCase()) || 
                  /\.(mp4|mov)$/i.test(file.name);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `"${file.name}" has an unsupported format. Please upload JPG, PNG, WEBP, HEIC, MP4, or MOV.`,
      isVideo: false
    };
  }

  const maxSizeBytes = (isVideo ? maxVideoSizeMB : maxImageSizeMB) * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const limitLabel = isVideo ? `${maxVideoSizeMB} MB` : `${maxImageSizeMB} MB`;
    return {
      valid: false,
      error: `"${file.name}" (${formatFileSize(file.size)}) exceeds the maximum allowed size of ${limitLabel}.`,
      isVideo
    };
  }

  return {
    valid: true,
    isVideo,
    mediaType: isVideo ? 'video' : 'image'
  };
}

/**
 * Pretty-formats bytes into human readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
