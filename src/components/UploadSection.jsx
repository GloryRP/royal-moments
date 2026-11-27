import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Loader2,
  FileUp,
  XCircle,
  RotateCcw,
  StopCircle
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
  const abortControllerRef = useRef(null);
  const isCancelledRef = useRef(false);

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

  const handleCancelUpload = () => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
    }

    setIsUploading(false);
    setFilesQueue((prev) =>
      prev.map((item) =>
        item.status === 'uploading'
          ? { ...item, status: 'pending', progress: 0 }
          : item
      )
    );

    toast('Upload cancelled.', {
      icon: '⏹️',
      duration: 3500
    });
  };

  const handleRetryFailed = () => {
    setFilesQueue((prev) =>
      prev.map((item) =>
        item.status === 'failed'
          ? { ...item, status: 'pending', progress: 0, errorMessage: null }
          : item
      )
    );
    // Trigger upload on next tick
    setTimeout(() => {
      handleUploadAll();
    }, 50);
  };

  const handleClearAll = () => {
    filesQueue.forEach((item) => {
      if (item.previewUrl) {
        try { URL.revokeObjectURL(item.previewUrl); } catch (e) {}
      }
    });
    setFilesQueue([]);
    setOverallProgress(0);
  };

  const handleUploadAll = async () => {
    const queueToProcess = filesQueue.filter((item) => item.status !== 'completed');
    if (queueToProcess.length === 0) {
      toast.error('Please select at least one photo to upload.');
      return;
    }

    isCancelledRef.current = false;
    abortControllerRef.current = new AbortController();
    setIsUploading(true);

    // Request wake lock to prevent mobile screen sleep during multi-photo upload
    let wakeLock = null;
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (e) {
      // Non-critical if wakeLock is denied or unsupported
    }

    const totalFiles = filesQueue.length;
    let completedCount = filesQueue.filter((item) => item.status === 'completed').length;
    let failedCount = 0;
    let wasCancelled = false;

    try {
      for (let i = 0; i < totalFiles; i++) {
        if (isCancelledRef.current || abortControllerRef.current?.signal.aborted) {
          wasCancelled = true;
          break;
        }

        const currentItem = filesQueue[i];
        if (currentItem.status === 'completed') {
          continue;
        }

        setFilesQueue((prev) => {
          const copy = [...prev];
          copy[i] = { ...copy[i], status: 'uploading', progress: 10, errorMessage: null };
          return copy;
        });

        try {
          const uploadedRecord = await uploadMediaFile(currentItem.file, {
            signal: abortControllerRef.current.signal,
            onProgress: (percent) => {
              if (isCancelledRef.current || abortControllerRef.current?.signal.aborted) return;
              setFilesQueue((prev) => {
                const copy = [...prev];
                if (copy[i]) copy[i] = { ...copy[i], progress: percent };
                return copy;
              });
              const baseProgress = (completedCount / totalFiles) * 100;
              const singleItemShare = (1 / totalFiles) * percent;
              setOverallProgress(Math.min(100, Math.round(baseProgress + singleItemShare)));
            }
          });

          // Free memory
          if (currentItem.previewUrl) {
            try { URL.revokeObjectURL(currentItem.previewUrl); } catch (e) {}
          }

          setFilesQueue((prev) => {
            const copy = [...prev];
            if (copy[i]) copy[i] = { ...copy[i], status: 'completed', progress: 100 };
            return copy;
          });

          completedCount++;
          if (onUploadSuccess && uploadedRecord) {
            onUploadSuccess(uploadedRecord);
          }
        } catch (err) {
          if (isCancelledRef.current || abortControllerRef.current?.signal.aborted || err?.name === 'AbortError') {
            wasCancelled = true;
            setFilesQueue((prev) => {
              const copy = [...prev];
              if (copy[i]) copy[i] = { ...copy[i], status: 'pending', progress: 0 };
              return copy;
            });
            break;
          }

          failedCount++;
          setFilesQueue((prev) => {
            const copy = [...prev];
            if (copy[i]) {
              copy[i] = {
                ...copy[i],
                status: 'failed',
                errorMessage: err.message || 'Upload failed'
              };
            }
            return copy;
          });

          // PAUSE upload immediately on first error so user has Cancel / Retry option
          toast.error(`Upload paused: "${currentItem.name}" failed. Tap "Cancel" or "Retry".`, {
            duration: 6000
          });
          break; // Stop immediately to give user control!
        }
      }
    } finally {
      if (wakeLock) {
        try { await wakeLock.release(); } catch (e) {}
      }
      setIsUploading(false);
    }

    if (wasCancelled) {
      return;
    }

    // Check final status
    setFilesQueue((currentQueue) => {
      const allCompleted = currentQueue.length > 0 && currentQueue.every((item) => item.status === 'completed');
      if (allCompleted && failedCount === 0) {
        toast.success('All photos uploaded successfully! Thank you for sharing.', {
          icon: '✨',
          duration: 4000
        });
        setTimeout(() => {
          handleClearAll();
        }, 1500);
      }
      return currentQueue;
    });
  };

  const failedItems = filesQueue.filter((item) => item.status === 'failed');
  const pendingItems = filesQueue.filter((item) => item.status === 'pending');
  const completedItems = filesQueue.filter((item) => item.status === 'completed');

  return (
    <section id="upload" className="py-16 sm:py-20 relative bg-royal-cream/60 w-full max-w-full overflow-hidden">
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
                  {completedItems.length > 0 && (
                    <span className="ml-2 text-xs font-sans text-green-700 font-normal">
                      ({completedItems.length} uploaded)
                    </span>
                  )}
                </span>
                
                {isUploading ? (
                  <button
                    onClick={handleCancelUpload}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-xs font-sans font-semibold transition"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    Cancel Upload
                  </button>
                ) : (
                  <button
                    onClick={handleClearAll}
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
                      <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white p-2 text-center">
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
                      <div className="absolute inset-0 bg-red-700/85 flex flex-col items-center justify-center text-white p-1 text-center">
                        <AlertCircle className="w-5 h-5 text-white mb-0.5" />
                        <span className="text-[9px] leading-tight font-medium">Failed</span>
                      </div>
                    )}

                    {/* Remove button (allowed when not uploading for pending or failed files) */}
                    {!isUploading && item.status !== 'completed' && (
                      <button
                        onClick={() => removeFileFromQueue(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition"
                        aria-label="Remove photo"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Pause on Error Banner */}
              {failedItems.length > 0 && !isUploading && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">
                        Upload paused: {failedItems.length} {failedItems.length === 1 ? 'photo' : 'photos'} had an interruption
                      </p>
                      <p className="text-[11px] text-amber-800/80">
                        You can retry failed photos, resume pending ones, or cancel and clear.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleRetryFailed}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Failed
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition"
                    >
                      Cancel &amp; Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Overall Progress Bar */}
              {isUploading && (
                <div className="mb-4 space-y-2 p-3 bg-gold-50/70 rounded-xl border border-gold-200">
                  <div className="flex items-center justify-between text-xs font-sans text-royal-espresso">
                    <span className="font-medium flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 text-gold-600 animate-spin" />
                      Uploading photos to gallery...
                    </span>
                    <span className="font-bold text-gold-700">{overallProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gold-200/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons: Cancel Upload vs Upload Now */}
              <div className="flex flex-wrap items-center justify-end gap-2.5">
                {isUploading ? (
                  <button
                    onClick={handleCancelUpload}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Upload</span>
                  </button>
                ) : (
                  <>
                    {failedItems.length > 0 && (
                      <button
                        onClick={handleRetryFailed}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retry Failed ({failedItems.length})</span>
                      </button>
                    )}

                    <button
                      onClick={handleUploadAll}
                      disabled={pendingItems.length === 0 && failedItems.length === 0}
                      className="w-full sm:w-auto px-7 py-3 rounded-full bg-gold-600 hover:bg-gold-700 disabled:opacity-50 text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-royal hover:shadow-royal-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FileUp className="w-4 h-4" />
                      <span>
                        Upload {pendingItems.length > 0 ? `${pendingItems.length} ` : ''}
                        {(pendingItems.length === 1 || filesQueue.length === 1) ? 'Photo' : 'Photos'} Now
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
