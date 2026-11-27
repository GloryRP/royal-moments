import React, { useState, useRef } from 'react';
import { 
  Heart, 
  Download, 
  MoreVertical, 
  Trash2,
  Check,
  GripVertical,
  ChevronLeft,
  ChevronRight
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
  isReorderMode = false,
  reorderIndex = 0,
  canMoveEarlier = false,
  canMoveLater = false,
  onMoveEarlier,
  onMoveLater,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
  className = ''
}) {
  const [hasError, setHasError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Long-press detection (Mobile touch & Desktop click-and-hold)
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const startCoordRef = useRef({ x: 0, y: 0 });

  const startLongPressTimer = (x, y) => {
    if (isReorderMode) return;
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
    if (isReorderMode) return;
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
    if (isReorderMode) return;
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
    if (isReorderMode) {
      return; // Lightbox disabled in reorder mode
    }
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

  return (
    <div
      data-photo-id={item.id}
      draggable={isReorderMode}
      onDragStart={isReorderMode ? (e) => onDragStart && onDragStart(e, item.id) : undefined}
      onDragOver={isReorderMode ? (e) => onDragOver && onDragOver(e, item.id) : undefined}
      onDrop={isReorderMode ? (e) => onDrop && onDrop(e, item.id) : undefined}
      onDragEnd={isReorderMode ? onDragEnd : undefined}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`group relative overflow-hidden bg-royal-sand/20 select-none w-full rounded-sm transition-all duration-150 ${
        isReorderMode
          ? 'cursor-grab active:cursor-grabbing border-2 border-gold-400 shadow-md'
          : 'cursor-pointer hover:opacity-95'
      } ${
        isDragOver ? 'ring-4 ring-gold-500 scale-[1.03] shadow-2xl z-30' : ''
      } ${
        isDragging ? 'opacity-40 scale-95 border-2 border-dashed border-gold-500' : ''
      } ${
        isSelected
          ? 'ring-2 sm:ring-3 ring-gold-500 shadow-md scale-[0.98]'
          : ''
      } ${className}`}
    >
      {/* 100% complete full image with natural proportions (never cropped or expanded) */}
      <img
        src={item.url || item.file_path}
        alt={item.file_name}
        className="w-full h-auto block select-none pointer-events-none"
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

      {/* Reorder Mode Badges & Controls */}
      {isReorderMode && (
        <>
          {/* Position Number Badge (Top Left) */}
          <div className="absolute top-1.5 left-1.5 z-20 px-2 py-0.5 rounded-md bg-black/85 text-gold-300 font-cinzel font-bold text-xs shadow-md border border-gold-400/50">
            #{reorderIndex + 1}
          </div>

          {/* Drag Handle Indicator (Top Right) */}
          <div className="absolute top-1.5 right-1.5 z-20 p-1.5 rounded-md bg-black/85 text-gold-300 shadow-md border border-gold-400/50 flex items-center justify-center">
            <GripVertical className="w-3.5 h-3.5 text-gold-300" />
          </div>

          {/* Quick-Shift Control Bar (Bottom) for 1-Tap Mobile/Desktop Shifts */}
          <div className="absolute inset-x-0 bottom-0 bg-black/90 backdrop-blur-xs py-1.5 px-2 flex items-center justify-between text-white z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onMoveEarlier) onMoveEarlier();
              }}
              disabled={!canMoveEarlier}
              className="px-2 py-1 rounded bg-white/15 hover:bg-gold-600 active:scale-95 disabled:opacity-25 disabled:hover:bg-white/15 transition text-xs font-sans font-semibold flex items-center gap-0.5 cursor-pointer"
              title="Move photo earlier"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[10px]">Earlier</span>
            </button>

            <span className="text-[10px] text-gold-300 font-sans tracking-wider uppercase font-semibold">
              Drag / Shift
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onMoveLater) onMoveLater();
              }}
              disabled={!canMoveLater}
              className="px-2 py-1 rounded bg-white/15 hover:bg-gold-600 active:scale-95 disabled:opacity-25 disabled:hover:bg-white/15 transition text-xs font-sans font-semibold flex items-center gap-0.5 cursor-pointer"
              title="Move photo later"
            >
              <span className="text-[10px]">Later</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* Multi-Select Checkbox Badge (Top Left) */}
      {!isReorderMode && isSelectMode && (
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
      {!isReorderMode && !isSelectMode && (
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
              <Download className="w-3.5 h-3.5 text-white" />
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
                <MoreVertical className="w-3.5 h-3.5 text-white" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 bottom-8 sm:bottom-9 w-44 bg-white rounded-xl shadow-2xl border border-gold-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
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
