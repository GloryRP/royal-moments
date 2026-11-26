import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Loader2,
  FileUp
} from 'lucide-react';
import { validateMediaFile, formatFileSize } from '../utils/fileValidation';
import { uploadMediaFile } from '../services/uploadService';
import { siteConfig } from '../config/siteConfig';
import toast from 'react-hot-toast';

const LOCAL_CONTRIBUTOR_NAME_KEY = 'royal_moments_contributor_name';

export function UploadSection({ onUploadSuccess }) {
  const [filesQueue, setFilesQueue] = useState([]);
  const [contributorName, setContributorName] = useState('');
  const [caption, setCaption] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Load remembered contributor name
  useEffect(() => {
    try {
      const savedName = localStorage.getItem(LOCAL_CONTRIBUTOR_NAME_KEY);
      if (savedName) setContributorName(savedName);
    } catch (e) {}
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(Array.from(e.target.files));
      e.target.value = ''; // Reset input to allow re-selecting same file
    }
  };

  const processSelectedFiles = (selectedFiles) => {
    const validQueueItems = [];

    for (const file of selectedFiles) {
      const validation = validateMediaFile(file);
      if (!validation.valid) {
        toast.error(validation.error, { duration: 5000 });
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      validQueueItems.push({
        file,
        id: Math.random().toString(36).substring(2, 9),
        previewUrl,
        isVideo: validation.isVideo,
        name: file.name,
        size: file.size,
        status: 'pending', // 'pending' | 'uploading' | 'completed' | 'failed'
        progress: 0,
        errorMessage: null
      });
    }

    if (validQueueItems.length > 0) {
      setFilesQueue((prev) => [...prev, ...validQueueItems]);
      toast.success(`Added ${validQueueItems.length} memory ${validQueueItems.length === 1 ? 'file' : 'files'} to queue.`);
    }
  };

  const removeFileFromQueue = (index) => {
    setFilesQueue((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadAll = async () => {
    if (filesQueue.length === 0) {
      toast.error('Please select at least one photo or video to upload.');
      return;
    }

    const trimmedName = contributorName.trim() || 'Family Member';
    try {
      localStorage.setItem(LOCAL_CONTRIBUTOR_NAME_KEY, trimmedName);
    } catch (e) {}

    setIsUploading(true);
    setOverallProgress(0);

    const totalFiles = filesQueue.length;
    let completedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < totalFiles; i++) {
      const currentItem = filesQueue[i];
      if (currentItem.status === 'completed') {
        completedCount++;
        continue;
      }

      setCurrentUploadingIndex(i);
      setFilesQueue((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], status: 'uploading', progress: 5 };
        return copy;
      });

      try {
        const uploadedRecord = await uploadMediaFile(currentItem.file, {
          contributorName: trimmedName,
          caption,
          passcode,
          onProgress: (percent) => {
            setFilesQueue((prev) => {
              const copy = [...prev];
              copy[i] = { ...copy[i], progress: percent };
              return copy;
            });
            // Update overall progress
            const baseProgress = (completedCount / totalFiles) * 100;
            const singleItemShare = (1 / totalFiles) * percent;
            setOverallProgress(Math.min(100, Math.round(baseProgress + singleItemShare)));
          }
        });

        // Mark completed
        setFilesQueue((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], status: 'completed', progress: 100 };
          return copy;
        });

        completedCount++;
        if (onUploadSuccess && uploadedRecord) {
          onUploadSuccess(uploadedRecord);
        }
      } catch (err) {
        failedCount++;
        setFilesQueue((prev) => {
          const copy = [...prev];
          copy[i] = {
            ...copy[i],
            status: 'failed',
            errorMessage: err.message || 'Upload failed'
          };
          return copy;
        });
        toast.error(`"${currentItem.name}" failed: ${err.message}`);
      }
    }

    setIsUploading(false);
    setCurrentUploadingIndex(-1);

    if (failedCount === 0) {
      toast.success('All memories uploaded successfully! Thank you for sharing.', {
        icon: '✨',
        duration: 4000
      });
      // Clear completed files from queue
      setTimeout(() => {
        setFilesQueue([]);
        setCaption('');
        setOverallProgress(0);
      }, 1500);
    } else {
      toast.error(`${failedCount} item(s) failed to upload. You can retry.`);
    }
  };

  return (
    <section id="upload" className="py-20 relative bg-royal-cream/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-cinzel font-semibold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Contribute To Album
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-royal-espresso mb-3">
            {siteConfig.upload.title}
          </h2>
          <p className="font-sans text-sm sm:text-base text-royal-espresso/70 max-w-xl mx-auto">
            {siteConfig.upload.subtitle}
          </p>
        </div>

        {/* Upload Container Box */}
        <div className="bg-white rounded-2xl border border-gold-200/80 shadow-royal-lg overflow-hidden">
          {/* Drag & Drop Target Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-12 text-center border-2 border-dashed transition-all cursor-pointer ${
              isDragging
                ? 'border-gold-500 bg-gold-50/60 scale-[0.99]'
                : 'border-gold-300/80 bg-royal-ivory/50 hover:bg-gold-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="w-16 h-16 rounded-full bg-gold-100/80 border border-gold-300 text-gold-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <Upload className="w-8 h-8 text-gold-600 animate-pulse" />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-royal-espresso mb-2">
              Choose photos & videos, or drag & drop here
            </h3>
            <p className="font-sans text-xs sm:text-sm text-royal-espresso/60 max-w-md mx-auto mb-4">
              Upload multiple moments from your phone or computer. High-resolution originals are preserved.
            </p>

            <div className="inline-flex flex-wrap items-center justify-center gap-3 text-xs text-gold-700 font-medium">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Images up to {siteConfig.upload.maxImageSizeMB}MB
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Video className="w-3.5 h-3.5" /> Videos up to {siteConfig.upload.maxVideoSizeMB}MB
              </span>
            </div>
          </div>

          {/* Form Details: Contributor, Caption & Passcode */}
          <div className="p-6 sm:p-8 bg-white border-t border-gold-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-sans text-xs uppercase tracking-wider font-semibold text-royal-espresso/80 mb-1.5">
                  Your Name or Relationship <span className="text-gold-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aunt Sarah, Cousin Mark, Grandma"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gold-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-wider font-semibold text-royal-espresso/80 mb-1.5">
                  Optional Memory Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joyful smile right after ring exchange!"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gold-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Optional Passcode Input if required */}
            {siteConfig.upload.requirePasscode && (
              <div className="mb-4">
                <label className="block font-sans text-xs uppercase tracking-wider font-semibold text-royal-espresso/80 mb-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-gold-600" />
                  Family Passcode
                </label>
                <input
                  type="password"
                  placeholder="Enter secret family upload passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gold-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                  disabled={isUploading}
                />
              </div>
            )}

            {/* File Queue Previews */}
            {filesQueue.length > 0 && (
              <div className="mt-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-base font-semibold text-royal-espresso">
                    Selected Files ({filesQueue.length})
                  </span>
                  {!isUploading && (
                    <button
                      onClick={() => setFilesQueue([])}
                      className="text-xs text-red-600 hover:text-red-700 font-sans underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto p-1">
                  {filesQueue.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative rounded-lg overflow-hidden border border-gold-200 bg-royal-cream group shadow-sm"
                    >
                      {item.isVideo ? (
                        <div className="aspect-square bg-royal-espresso flex flex-col items-center justify-center p-2 text-white">
                          <Video className="w-6 h-6 text-gold-400 mb-1" />
                          <span className="text-[10px] truncate max-w-full text-gold-200">{item.name}</span>
                        </div>
                      ) : (
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="aspect-square w-full object-cover"
                        />
                      )}

                      {/* File size badge */}
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-sans">
                        {formatFileSize(item.size)}
                      </div>

                      {/* Status Overlay */}
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-2">
                          <Loader2 className="w-5 h-5 text-gold-400 animate-spin mb-1" />
                          <span className="text-[10px] font-semibold">{item.progress}%</span>
                        </div>
                      )}

                      {item.status === 'completed' && (
                        <div className="absolute inset-0 bg-gold-700/80 flex items-center justify-center text-white">
                          <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                      )}

                      {item.status === 'failed' && (
                        <div className="absolute inset-0 bg-red-700/80 flex flex-col items-center justify-center text-white p-1 text-center">
                          <AlertCircle className="w-5 h-5 text-white mb-0.5" />
                          <span className="text-[8px] leading-tight">Failed</span>
                        </div>
                      )}

                      {/* Remove button (when not uploading) */}
                      {!isUploading && item.status === 'pending' && (
                        <button
                          onClick={() => removeFileFromQueue(index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition"
                          aria-label="Remove file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Progress Bar */}
            {isUploading && (
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-sans text-royal-espresso">
                  <span>Uploading files to secure royal album...</span>
                  <span className="font-semibold text-gold-700">{overallProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gold-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Action Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleUploadAll}
                disabled={isUploading || filesQueue.length === 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold-600 hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-royal hover:shadow-royal-lg transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading Moments...
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    Upload {filesQueue.length > 0 ? `(${filesQueue.length}) Moments` : 'Now'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
