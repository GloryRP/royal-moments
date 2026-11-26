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
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MessageCircle, 
  MoreVertical, 
  Trash2, 
  Share2,
  Play,
  Pause
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
  onDownload,
  onRequestDelete,
  initialSlideshow = false
}) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [initialPinchDist, setInitialPinchDist] = useState(null);
  const [isSlideshowRunning, setIsSlideshowRunning] = useState(initialSlideshow);
  
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const panStartPos = useRef({ x: 0, y: 0 });

  // Sync current index when selected item changes
  useEffect(() => {
    if (item && items.length > 0) {
      const idx = items.findIndex((m) => m.id === item.id);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [item, items]);

  // Sync slideshow state
  useEffect(() => {
    setIsSlideshowRunning(initialSlideshow);
  }, [initialSlideshow, isOpen]);

  // Reset zoom on item switch or close
  useEffect(() => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setMenuOpen(false);
    isDragging.current = false;
  }, [currentIndex, isOpen]);

  const currentItem = items[currentIndex] || item;

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Slideshow auto-advance (every 3.5 seconds)
  useEffect(() => {
    if (!isOpen || !isSlideshowRunning || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isOpen, isSlideshowRunning, items.length]);

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
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Touch handlers for Swipe and Pinch-to-zoom + Multi-directional Pan
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch gesture start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDist(dist);
    } else if (e.touches.length === 1) {
      if (zoomScale > 1) {
        // 1 finger while zoomed in: Pan to any part of the photo
        isDragging.current = true;
        dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        panStartPos.current = { ...panPosition };
      } else {
        // 1 finger while unzoomed: Swipe between photos
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
      }
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDist) {
      // Pinch zooming
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / initialPinchDist;
      setZoomScale((prev) => {
        const next = Math.min(4, Math.max(1, prev * (ratio > 1 ? 1.04 : 0.96)));
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    } else if (e.touches.length === 1) {
      if (zoomScale > 1 && isDragging.current) {
        // Pan freely across any corner, face, or detail
        const deltaX = e.touches[0].clientX - dragStartPos.current.x;
        const deltaY = e.touches[0].clientY - dragStartPos.current.y;
        setPanPosition({
          x: panStartPos.current.x + deltaX,
          y: panStartPos.current.y + deltaY
        });
      } else if (zoomScale === 1) {
        setTouchEnd(e.targetTouches[0].clientX);
      }
    }
  };

  const onTouchEnd = () => {
    setInitialPinchDist(null);
    isDragging.current = false;
    if (zoomScale > 1) return; // Don't swipe while zoomed in

    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
  };

  // Mouse Drag handlers for Desktop
  const handleMouseDown = (e) => {
    if (zoomScale > 1 && e.button === 0) {
      isDragging.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      panStartPos.current = { ...panPosition };
    }
  };

  const handleMouseMove = (e) => {
    if (zoomScale > 1 && isDragging.current) {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      setPanPosition({
        x: panStartPos.current.x + deltaX,
        y: panStartPos.current.y + deltaY
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Double-tap or double-click to toggle zoom & target tapped location
  const handleDoubleTap = (e) => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(2.5);
      if (e?.clientX && e?.clientY) {
        const midX = window.innerWidth / 2;
        const midY = window.innerHeight / 2;
        setPanPosition({
          x: (midX - e.clientX) * 1.2,
          y: (midY - e.clientY) * 1.2
        });
      }
    }
  };

  // Direct WhatsApp share
  const handleWhatsAppShare = () => {
    if (!currentItem) return;
    setMenuOpen(false);
    const mediaUrl = currentItem.url || currentItem.file_path;
    const text = encodeURIComponent(
      `Check out this beautiful photo from Prabhudas & Somya's Engagement Ceremony! 💍✨\n\n"${currentItem.caption || currentItem.file_name}"\n\nView memory here: ${mediaUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!isOpen || !currentItem) return null;

  const isVideo = currentItem.media_type === 'video';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slideshow Active Progress Indicator */}
        {isSlideshowRunning && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-40 overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.5, ease: 'linear' }}
              className="h-full bg-gold-400"
            />
          </div>
        )}

        {/* Top Floating Control Bar */}
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-5 flex items-center justify-between z-30 bg-gradient-to-b from-black/85 via-black/45 to-transparent">
          <div className="text-white/80 font-sans text-xs sm:text-sm">
            <span className="font-serif italic text-gold-300">
              {currentIndex + 1} of {items.length || 1}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Slideshow Play / Pause Button */}
            {items.length > 1 && (
              <button
                onClick={() => setIsSlideshowRunning(!isSlideshowRunning)}
                className={`p-2 sm:p-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md ${
                  isSlideshowRunning
                    ? 'bg-gold-500 text-white ring-2 ring-gold-300 animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isSlideshowRunning ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isSlideshowRunning ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span className="hidden sm:inline text-xs font-semibold">
                  {isSlideshowRunning ? 'Playing' : 'Slideshow'}
                </span>
              </button>
            )}

            {/* Direct WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="p-2 sm:p-2.5 rounded-full bg-emerald-700/80 hover:bg-emerald-600 text-white transition-all shadow-md flex items-center gap-1.5"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="hidden sm:inline text-xs font-semibold">Share</span>
            </button>

            {/* Reset Zoom Pill (Visible on mobile & desktop when zoomed in) */}
            {!isVideo && zoomScale > 1 && (
              <button
                onClick={() => {
                  setZoomScale(1);
                  setPanPosition({ x: 0, y: 0 });
                }}
                className="px-2.5 py-1.5 rounded-full bg-gold-600/90 hover:bg-gold-500 text-white text-[11px] font-sans font-medium flex items-center gap-1 shadow-md transition"
                title="Reset zoom to 100%"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            {/* Zoom Controls (Images only) */}
            {!isVideo && (
              <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/10">
                <button
                  onClick={() => setZoomScale((z) => {
                    const next = Math.max(1, z - 0.5);
                    if (next === 1) setPanPosition({ x: 0, y: 0 });
                    return next;
                  })}
                  disabled={zoomScale <= 1}
                  className="p-1.5 text-white/80 hover:text-white disabled:opacity-40 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-gold-200 px-1">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(4, z + 0.5))}
                  disabled={zoomScale >= 4}
                  className="p-1.5 text-white/80 hover:text-white disabled:opacity-40 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

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
              className="p-2 sm:p-2.5 rounded-full bg-gold-600 hover:bg-gold-500 text-white transition-all shadow-md"
              title="Download original"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* 3-Dots Options Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                title="More options"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 w-48 bg-royal-card rounded-xl shadow-2xl border border-gold-300 py-2 z-40 text-royal-espresso">
                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full px-4 py-2 text-left text-xs font-sans hover:bg-gold-50 flex items-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDownload(currentItem);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-sans hover:bg-gold-50 flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-gold-700" />
                    <span>Download File</span>
                  </button>

                  <div className="my-1 border-t border-gold-200/50" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (onRequestDelete) onRequestDelete(currentItem);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-sans text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Delete (Requires nov22)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
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

        {/* Main Content Area with Pinch/Double-tap Zoom & Free Multi-directional Pan */}
        <div 
          className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-6 pb-16 sm:pb-20 overflow-hidden cursor-default"
          onDoubleClick={!isVideo ? handleDoubleTap : undefined}
          onMouseDown={!isVideo ? handleMouseDown : undefined}
          onMouseMove={!isVideo ? handleMouseMove : undefined}
          onMouseUp={!isVideo ? handleMouseUp : undefined}
          onMouseLeave={!isVideo ? handleMouseUp : undefined}
        >
          <div className="relative max-h-full max-w-full flex items-center justify-center overflow-hidden">
            {isVideo ? (
              <video
                src={currentItem.url || currentItem.file_path}
                controls
                autoPlay
                playsInline
                className="max-h-[76vh] max-w-[90vw] sm:max-w-[80vw] rounded-lg shadow-2xl object-contain bg-black"
              />
            ) : (
              <img
                src={currentItem.url || currentItem.file_path}
                alt={currentItem.file_name}
                className="max-h-[76vh] max-w-[94vw] sm:max-w-[88vw] object-contain rounded-xl shadow-2xl select-none"
                style={{
                  transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0px) scale(${zoomScale})`,
                  cursor: zoomScale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'zoom-in',
                  touchAction: 'none'
                }}
                draggable={false}
              />
            )}
          </div>
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

        {/* Bottom Details Drawer - Clean (No Caption, No "Family Member") */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white z-20">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-white/70 font-sans">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              <span>{formatMediaDate(currentItem.created_at)}</span>
            </div>

            {/* Mobile zoom & swipe hint */}
            <div className="text-[10px] text-white/50 tracking-wider uppercase font-sans">
              Double-tap or pinch to zoom • Swipe to browse
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
