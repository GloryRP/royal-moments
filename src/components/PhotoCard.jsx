import React, { useState, useRef } from 'react';
import { 
  Heart, 
  Download, 
  MoreVertical, 
  Trash2,
  MessageCircle,
  Check
} from 'lucide-react';

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
  onLongPress,
  className = ''
}) {
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
      className={`group relative cursor-pointer overflow-hidden bg-royal-sand/30 select-none w-full aspect-[4/5] ${
        isSelected
          ? 'ring-2 sm:ring-3 ring-gold-500 shadow-md scale-[0.98]'
          : 'hover:opacity-95'
      } ${className}`}
    >
      {/* Seamless edge-to-edge photo with zero vertical gaps */}
      <img
        src={item.url || item.file_path}
        alt={item.file_name}
        className="w-full h-full object-cover object-center select-none"
        onError={() => setHasError(true)}
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
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-all ${
              isSelected
                ? 'bg-gold-500 border-white text-white shadow-md scale-110'
                : 'bg-black/40 border-white/90 text-transparent'
            }`}
          >
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar with Direct 1-Tap Download Icon and Favourite Heart */}
      {!isSelectMode && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-6 pb-1.5 px-1.5 sm:px-2 flex items-center justify-between text-white transition-opacity duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 z-20">
          {/* Favourite Heart & Count */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite(item.id);
            }}
            className="action-button p-1 sm:p-1.5 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 transition-all flex items-center gap-1 backdrop-blur-sm"
            aria-label={isFavourited ? 'Remove favourite' : 'Add favourite'}
          >
            <Heart
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
                isFavourited ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
            {favouriteCount > 0 && (
              <span className="text-[10px] font-sans font-medium text-white/90 pr-0.5">
                {favouriteCount}
              </span>
            )}
          </button>

          {/* Right Actions: Direct 1-Tap Download Icon + 3-Dots Menu */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Direct 1-Tap Download Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(item);
              }}
              className="action-button p-1 sm:p-1.5 rounded-full bg-black/40 hover:bg-gold-600 active:scale-90 transition-all text-white backdrop-blur-sm shadow-sm"
              title="Download original photo"
              aria-label="Download original photo"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </button>

            {/* 3-Dots Menu Trigger */}
            <div className="relative menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="action-button p-1 sm:p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-all text-white backdrop-blur-sm"
                aria-label="More options"
              >
                <MoreVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 bottom-8 sm:bottom-9 w-44 bg-white rounded-xl shadow-2xl border border-gold-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
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
        </div>
      )}
    </div>
  );
}
