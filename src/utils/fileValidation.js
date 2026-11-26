import { siteConfig } from '../config/siteConfig';

/**
 * Validates a photo file before upload (images only, no file size limit)
 * @param {File} file
 * @returns {{ valid: boolean, error?: string, isVideo: boolean, mediaType: string }}
 */
export function validateMediaFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const { allowedImageTypes } = siteConfig.upload;
  const isImage = allowedImageTypes.includes(file.type.toLowerCase()) || 
                  /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);

  if (!isImage) {
    return {
      valid: false,
      error: `"${file.name}" is not an image. Please upload photos (JPG, PNG, WEBP, or HEIC).`,
      isVideo: false
    };
  }

  // No size limit enforced
  return {
    valid: true,
    isVideo: false,
    mediaType: 'image'
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
