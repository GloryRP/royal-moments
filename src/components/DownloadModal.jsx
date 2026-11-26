import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FolderArchive, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  FileText
} from 'lucide-react';
import { downloadAlbumZip } from '../services/downloadService';
import { siteConfig } from '../config/siteConfig';
import toast from 'react-hot-toast';

export function DownloadModal({ isOpen, onClose, mediaItems = [] }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressState, setProgressState] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const totalCount = mediaItems.length;
  const isLargeAlbum = totalCount > siteConfig.download.warningThresholdCount;

  const handleStartZipDownload = async () => {
    if (totalCount === 0) {
      toast.error('No memories available to download.');
      return;
    }

    setIsDownloading(true);
    setIsComplete(false);
    setProgressState({ percent: 5, current: 0, total: totalCount, status: 'Initializing archive...' });

    try {
      const result = await downloadAlbumZip(mediaItems, (prog) => {
        setProgressState(prog);
      });

      setIsComplete(true);
      toast.success('Album ZIP archive downloaded successfully!', {
        icon: '🎁',
        duration: 4000
      });
    } catch (err) {
      console.error('ZIP creation failed:', err);
      toast.error(`Download error: ${err.message || 'Unable to build ZIP file.'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-gold-300/80 shadow-2xl p-6 sm:p-8 text-royal-espresso">
        {/* Close Button */}
        {!isDownloading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-royal-espresso/60 hover:text-royal-espresso hover:bg-gold-50 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gold-100 border border-gold-300 text-gold-700 flex items-center justify-center">
            <FolderArchive className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-semibold text-royal-espresso">
              {siteConfig.download.title}
            </h3>
            <p className="font-sans text-xs text-royal-espresso/70">
              {totalCount} precious {totalCount === 1 ? 'memory' : 'memories'} available
            </p>
          </div>
        </div>

        <p className="font-sans text-sm text-royal-espresso/70 mb-6 leading-relaxed">
          {siteConfig.download.description} All photos will be saved in their original pristine quality into an organized ZIP archive.
        </p>

        {/* High item count memory alert if applicable */}
        {isLargeAlbum && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Note on Large Album:</strong> {siteConfig.download.warningMemoryNotice}
            </div>
          </div>
        )}

        {/* Progress Display */}
        {isDownloading && progressState && (
          <div className="mb-6 p-4 rounded-xl bg-gold-50/70 border border-gold-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="font-medium text-royal-espresso flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-600" />
                {progressState.status || `Packaging file ${progressState.current} of ${progressState.total}...`}
              </span>
              <span className="font-semibold text-gold-800">{progressState.percent}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-gold-200 overflow-hidden">
              <div
                className="h-full bg-gold-600 transition-all duration-300"
                style={{ width: `${progressState.percent}%` }}
              />
            </div>

            {progressState.currentFileName && (
              <p className="text-[11px] text-royal-espresso/60 truncate font-mono">
                {progressState.currentFileName}
              </p>
            )}
          </div>
        )}

        {/* Completion State */}
        {isComplete && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <strong>Archive ready!</strong> Your browser download has initiated. Check your Downloads folder.
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {!isDownloading && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-gold-200 text-xs font-sans font-medium text-royal-espresso hover:bg-gold-50 transition"
            >
              {isComplete ? 'Done' : 'Cancel'}
            </button>
          )}

          <button
            onClick={handleStartZipDownload}
            disabled={isDownloading || totalCount === 0}
            className="px-6 py-2.5 rounded-full bg-gold-600 hover:bg-gold-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-sans font-semibold uppercase tracking-wider shadow-royal transition flex items-center gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Packaging Album...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Download Complete ZIP
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
