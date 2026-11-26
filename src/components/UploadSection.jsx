import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Loader2,
  FileUp
} from 'lucide-react';
import { validateMediaFile, formatFileSize } from '../utils/fileValidation';
import { uploadMediaFile } from '../services/uploadService';
import { siteConfig } from '../config/siteConfig';
import toast from 'react-hot-toast';

export function UploadSection({ onUploadSuccess }) {
  const [filesQueue, setFilesQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

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
      e.target.value = '';
    }
  };

  const processSelectedFiles = (selectedFiles) => {
    const validQueueItems = [];

    for (const file of selectedFiles) {
      const validation = validateMediaFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validQueueItems.push({
        file,
        id: Math.random().toString(36).substring(2, 9),
        previewUrl,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        errorMessage: null
      });
    }

    if (validQueueItems.length > 0) {
      setFilesQueue((prev) => [...prev, ...validQueueItems]);
      toast.success(`Selected ${validQueueItems.length} ${validQueueItems.length === 1 ? 'photo' : 'photos'}. Tap Upload to add.`);
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
      toast.error('Please select at least one photo to upload.');
      return;
    }

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

      setFilesQueue((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], status: 'uploading', progress: 10 };
        return copy;
      });

      try {
        const uploadedRecord = await uploadMediaFile(currentItem.file, {
          onProgress: (percent) => {
            setFilesQueue((prev) => {
              const copy = [...prev];
              copy[i] = { ...copy[i], progress: percent };
              return copy;
            });
            const baseProgress = (completedCount / totalFiles) * 100;
            const singleItemShare = (1 / totalFiles) * percent;
            setOverallProgress(Math.min(100, Math.round(baseProgress + singleItemShare)));
          }
        });

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

    if (failedCount === 0) {
      toast.success('Photos uploaded successfully! Thank you for sharing.', {
        icon: '✨',
        duration: 4000
      });
      setTimeout(() => {
        setFilesQueue([]);
        setOverallProgress(0);
      }, 1200);
    } else {
      toast.error(`${failedCount} photo(s) failed to upload.`);
    }
  };

  return (
    <section id="upload" className="py-16 sm:py-20 relative bg-royal-cream/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-cinzel font-semibold tracking-widest uppercase mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Share Memories
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-royal-espresso mb-2">
            {siteConfig.upload.title}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-royal-espresso/70 max-w-md mx-auto">
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
              accept="image/jpeg,image/png,image/webp,image/heic,.jpg,.jpeg,.png,.webp,.heic"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold-100/80 border border-gold-300 text-gold-700 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-105 transition-transform">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-gold-600 animate-pulse" />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl text-royal-espresso mb-1.5">
              Choose photos or drag &amp; drop here
            </h3>
            <p className="font-sans text-xs sm:text-sm text-royal-espresso/60 max-w-md mx-auto mb-3">
              Tap anywhere in this box to select photos directly from your phone gallery or computer.
            </p>

            <span className="inline-flex items-center gap-1.5 text-xs text-gold-700 font-medium bg-gold-50 px-3 py-1 rounded-full border border-gold-200/60">
              <ImageIcon className="w-3.5 h-3.5" /> High-resolution photos supported (no size limit)
            </span>
          </div>

          {/* Action Zone: Selected Preview & Upload Button */}
          {filesQueue.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-gold-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif text-base font-semibold text-royal-espresso">
                  Selected Photos ({filesQueue.length})
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

              {/* Photos Queue Preview */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-60 overflow-y-auto p-1 mb-4">
                {filesQueue.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative rounded-lg overflow-hidden border border-gold-200 bg-royal-cream group shadow-sm aspect-square"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />

                    {/* File size badge */}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-sans">
                      {formatFileSize(item.size)}
                    </div>

                    {/* Status Overlays */}
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

                    {/* Remove button */}
                    {!isUploading && item.status === 'pending' && (
                      <button
                        onClick={() => removeFileFromQueue(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Overall Progress Bar */}
              {isUploading && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans text-royal-espresso">
                    <span>Uploading photos to album...</span>
                    <span className="font-semibold text-gold-700">{overallProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gold-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Direct Upload Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading}
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-gold-600 hover:bg-gold-700 disabled:opacity-50 text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-royal hover:shadow-royal-lg transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      <span>Upload {filesQueue.length} {filesQueue.length === 1 ? 'Photo' : 'Photos'} Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
