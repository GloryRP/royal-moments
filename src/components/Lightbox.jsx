import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Download, 
  User, 
  Clock, 
  Maximize, 
  FileText,
  Share2
} from 'lucide-react';
import { formatMediaDate } from '../utils/formatDate';
import { formatFileSize } from '../utils/fileValidation';
import toast from 'react-hot-toast';

export function Lightbox({
  item,
  items = [],
  isOpen,
  onClose,
  isFavourited,
  favouriteCount,
  onToggleFavourite,
  onDownload
}) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync current index when selected item changes
  useEffect(() => {
    if (item && items.length > 0) {
      const idx = items.findIndex((m) => m.id === item.id);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [item, items]);

  const currentItem = items[currentIndex] || item;

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation & Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Touch Swipe for mobile devices
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const handleShare = async () => {
    if (!currentItem) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Royal Moments — Engagement Memory',
          text: currentItem.caption || `Engagement moment shared by ${currentItem.contributor_name}`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Gallery link copied to clipboard!');
    }
  };

  if (!isOpen || !currentItem) return null;

  const isVideo = currentItem.media_type === 'video';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Top Floating Control Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="text-white/80 font-sans text-xs sm:text-sm">
            <span className="font-serif italic text-gold-300">
              {currentIndex + 1} of {items.length || 1}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              aria-label="Share memory"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Favourite button */}
            <button
              onClick={() => onToggleFavourite(currentItem.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              aria-label="Toggle favourite"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isFavourited(currentItem.id) ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
              <span className="text-xs font-semibold">
                {favouriteCount(currentItem.id) > 0 ? favouriteCount(currentItem.id) : ''}
              </span>
            </button>

            {/* Download Original button */}
            <button
              onClick={() => onDownload(currentItem)}
              className="p-2.5 rounded-full bg-gold-600 hover:bg-gold-500 text-white transition-all shadow-md"
              aria-label="Download original"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Previous Button (Desktop) */}
        {items.length > 1 && (
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Main Content Area */}
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-12 pb-24 sm:pb-28">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-full max-w-full flex items-center justify-center overflow-hidden"
          >
            {isVideo ? (
              <video
                src={currentItem.url || currentItem.file_path}
                controls
                autoPlay
                playsInline
                className="max-h-[72vh] max-w-[90vw] sm:max-w-[80vw] rounded-lg shadow-2xl object-contain bg-black"
              />
            ) : (
              <img
                src={currentItem.url || currentItem.file_path}
                alt={currentItem.caption || currentItem.file_name}
                className="max-h-[72vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-lg shadow-2xl select-none"
              />
            )}
          </motion.div>
        </div>

        {/* Next Button (Desktop) */}
        {items.length > 1 && (
          <button
            onClick={handleNext}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Bottom Details Drawer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white z-20">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              {currentItem.caption && (
                <p className="font-serif italic text-base sm:text-lg text-gold-100 max-w-2xl">
                  "{currentItem.caption}"
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/70 font-sans">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  <strong className="text-white/90">{currentItem.contributor_name || 'Family Member'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold-400" />
                  {formatMediaDate(currentItem.created_at)}
                </span>
                {currentItem.file_size && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(currentItem.file_size)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Mobile swipe hint */}
            <div className="sm:hidden text-[10px] text-white/50 tracking-wider uppercase font-sans">
              Swipe left / right to browse
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
