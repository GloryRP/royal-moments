import React, { useState, useRef } from 'react';
import { 
  Heart, 
  Download, 
  Maximize2, 
  Clock, 
  MoreVertical, 
  Trash2,
  MessageCircle,
  Check
} from 'lucide-react';
import { formatMediaDate } from '../utils/formatDate';

export function PhotoCard({
  item,
  isFavourited,
  favouriteCount,
  onToggleFavourite,
  onOpenLightbox,
  onDownload,
  onRequestDelete,
  isSelectMode,
  isSelected,
  onToggleSelect,
  onLongPress
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Long-press detection (Mobile touch & Desktop click-and-hold)
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const startCoordRef = useRef({ x: 0, y: 0 });

  const startLongPressTimer = (x, y) => {
    isLongPressRef.current = false;
    startCoordRef.current = { x, y };
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(50); } catch (e) {}
      }
      if (onLongPress) {
        onLongPress(item.id);
      }
    }, 450);
  };

  const cancelLongPressTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.action-button') || e.target.closest('.menu-container')) return;
    const touch = e.touches[0];
    startLongPressTimer(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!timerRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - startCoordRef.current.x);
    const dy = Math.abs(touch.clientY - startCoordRef.current.y);
    if (dx > 10 || dy > 10) {
      cancelLongPressTimer(); // User is scrolling
    }
  };

  const handleTouchEnd = () => {
    cancelLongPressTimer();
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.action-button') || e.target.closest('.menu-container')) return;
    startLongPressTimer(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!timerRef.current) return;
    const dx = Math.abs(e.clientX - startCoordRef.current.x);
    const dy = Math.abs(e.clientY - startCoordRef.current.y);
    if (dx > 10 || dy > 10) {
      cancelLongPressTimer();
    }
  };

  const handleMouseUp = () => {
    cancelLongPressTimer();
  };

  const handleCardClick = (e) => {
    if (isLongPressRef.current) {
      e.stopPropagation();
      isLongPressRef.current = false;
      return;
    }
    if (isSelectMode) {
      onToggleSelect(item.id);
      return;
    }
    if (e.target.closest('.action-button') || e.target.closest('.menu-container')) return;
    onOpenLightbox(item);
  };

  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const mediaUrl = item.url || item.file_path;
    const text = encodeURIComponent(
      `Look at this photo from Prabhudas & Somya's Engagement Ceremony! 💍✨\n\nView here: ${mediaUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 select-none ${
        isSelected
          ? 'ring-3 sm:ring-4 ring-gold-500 border-gold-500 shadow-royal-lg scale-[0.98]'
          : 'border-gold-200/60 shadow-sm hover:shadow-royal-lg'
      }`}
    >
      {/* Media Container with Google Photos style aspect ratio */}
      <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden bg-royal-cream">
        {/* Skeleton loading animation */}
        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-royal-sand via-royal-cream to-royal-sand animate-pulse" />
        )}

        <img
          src={item.url || item.file_path}
          alt={item.file_name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isSelectMode ? '' : 'group-hover:scale-105'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageLoaded(true);
            setHasError(true);
          }}
          loading="lazy"
        />

        {/* Fallback broken image indicator */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-royal-sand/40 text-royal-espresso/60 p-2 text-center">
            <span className="text-xl mb-1">🖼️</span>
            <span className="text-[10px] font-sans">Unable to load</span>
          </div>
        )}

        {/* Multi-Select Checkbox Badge (Top Left) */}
        {isSelectMode && (
          <div className="absolute top-2 left-2 z-20">
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                isSelected
                  ? 'bg-gold-500 border-white text-white shadow-md scale-110'
                  : 'bg-black/35 border-white/90 text-transparent'
              }`}
            >
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </div>
          </div>
        )}

        {/* Top Right Actions: 3-dots Menu + Favourite Button (When not in select mode) */}
        {!isSelectMode && (
          <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 flex items-center gap-1 sm:gap-1.5">
            {/* Quick Favourite */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite(item.id);
              }}
              className="action-button p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-md border border-gold-300/50 text-royal-espresso hover:text-red-600 transition-all shadow-sm active:scale-90"
              aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                  isFavourited ? 'fill-red-500 text-red-500' : 'text-royal-espresso/70'
                }`}
              />
            </button>

            {/* 3-Dots Menu Trigger */}
            <div className="relative menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="action-button p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-md border border-gold-300/50 text-royal-espresso hover:text-gold-800 transition-all shadow-sm"
                aria-label="More options"
              >
                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* 3-Dots Dropdown Menu */}
              {menuOpen && (
                <div 
                  className="absolute right-0 top-9 sm:top-10 w-44 bg-white rounded-xl shadow-xl border border-gold-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full px-3.5 py-2 text-left text-xs font-sans text-royal-espresso hover:bg-gold-50 flex items-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Share to WhatsApp</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDownload(item);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-sans text-royal-espresso hover:bg-gold-50 flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-gold-700" />
                    <span>Download Original</span>
                  </button>

                  <div className="my-1 border-t border-gold-100" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (onRequestDelete) onRequestDelete(item);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-sans text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Delete Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop Hover Gradient Overlay */}
        {!isSelectMode && (
          <div className="absolute inset-0 bg-gradient-to-t from-royal-espresso/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex flex-col justify-end p-3 text-white pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <span className="text-[11px] font-sans text-gold-200 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" /> Tap to view
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(item);
                }}
                className="action-button p-1.5 rounded-full bg-white/20 hover:bg-gold-500 hover:text-white backdrop-blur-md text-white transition-all shadow-sm"
                aria-label="Download original file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clean Bottom Date Strip - Compact & Refined */}
      <div className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-white flex items-center justify-between text-[10px] sm:text-[11px] text-royal-espresso/50 font-sans border-t border-gold-100/60">
        <div className="flex items-center gap-1 truncate mr-1">
          <Clock className="w-3 h-3 text-gold-600/70 shrink-0" />
          <span className="truncate">{formatMediaDate(item.created_at)}</span>
        </div>
        {favouriteCount > 0 && (
          <span className="flex items-center gap-0.5 text-gold-700 font-medium shrink-0">
            <Heart className="w-2.5 h-2.5 fill-gold-500 text-gold-600" />
            {favouriteCount}
          </span>
        )}
      </div>
    </div>
  );
}
