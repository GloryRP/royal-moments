import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  ArrowUpDown, 
  Camera, 
  RefreshCw, 
  CheckSquare, 
  Download, 
  Loader2, 
  Play,
  ArrowLeftRight,
  GripVertical,
  Save,
  X
} from 'lucide-react';
import { PhotoCard } from './PhotoCard';
import { downloadAlbumZip } from '../services/downloadService';
import { saveMediaOrder } from '../services/mediaService';
import { siteConfig } from '../config/siteConfig';
import toast from 'react-hot-toast';

export function Gallery({
  items = [],
  isLoading,
  error,
  isDemo,
  filter,
  setFilter,
  sortOrder,
  setSortOrder,
  favouriteCount,
  isFavourited,
  getFavouriteCount,
  onToggleFavourite,
  onOpenLightbox,
  onStartSlideshow,
  onDownload,
  onRequestDelete,
  onRefresh,
  onReorderMedia,
  isReorderMode = false,
  setIsReorderMode
}) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);

  // Reorder State
  const [reorderList, setReorderList] = useState([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Initialize reorderList when Reorder mode is triggered from navbar
  useEffect(() => {
    if (isReorderMode) {
      if (filter !== 'all') {
        setFilter('all');
      }
      setIsSelectMode(false);
      setSelectedIds(new Set());
      setReorderList([...items]);
      toast('Reorder mode active: Drag photos or tap Earlier / Later', {
        icon: '🔀',
        duration: 3500
      });
      const el = document.getElementById('gallery');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isReorderMode]);

  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') return 'mobile';
    if (window.innerWidth >= 1024) return 'desktop';
    if (window.innerWidth >= 640) return 'tablet';
    return 'mobile';
  });

  // Track window size for responsive grid columns (strictly 2 columns on mobile)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 1024) {
        setScreenSize('desktop');
      } else if (window.innerWidth >= 640) {
        setScreenSize('tablet');
      } else {
        setScreenSize('mobile');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Number of columns: strictly 2 on mobile, 3 on tablet, 4 on desktop
  const numColumns = screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 3 : 4;
  const gridColsClass = numColumns === 2 ? 'grid-cols-2' : numColumns === 3 ? 'grid-cols-3' : 'grid-cols-4';

  const activeItems = isReorderMode ? reorderList : items;

  // Distribute items row-wise across columns (e.g. 2 cols -> Col 0 gets 1, 3, 5; Col 1 gets 2, 4, 6)
  // This guarantees horizontal order: [1] [2], then [3] [4], then [5] [6], etc.
  const columnBuckets = Array.from({ length: numColumns }, () => []);
  activeItems.forEach((item, index) => {
    columnBuckets[index % numColumns].push({ item, index });
  });

  const scrollToUpload = () => {
    const el = document.getElementById('upload');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Long-press activates select mode and adds target photo immediately
  const handleLongPress = (id) => {
    if (isReorderMode) return;
    setIsSelectMode(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    toast.success('Select mode active — tap photos to choose', {
      id: 'select-mode-toast',
      icon: '☑️',
      duration: 2500
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleDownloadSelected = async () => {
    const selectedItems = items.filter((item) => selectedIds.has(item.id));
    if (selectedItems.length === 0) {
      toast.error('Please select at least one photo to download.');
      return;
    }

    setIsDownloadingSelected(true);
    setDownloadProgress({ percent: 10, current: 0, total: selectedItems.length });

    try {
      await downloadAlbumZip(selectedItems, (prog) => {
        setDownloadProgress(prog);
      });
      toast.success(`Downloaded ${selectedItems.length} selected photos as ZIP!`, {
        icon: '🎁'
      });
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(`Download failed: ${err.message}`);
    } finally {
      setIsDownloadingSelected(false);
      setDownloadProgress(null);
    }
  };

  // Reorder Handlers
  const handleStartReorder = () => {
    if (filter !== 'all') {
      setFilter('all');
    }
    setIsSelectMode(false);
    setSelectedIds(new Set());
    setReorderList([...items]);
    setIsReorderMode(true);
    toast('Reorder mode: Drag photos or tap Earlier / Later buttons', {
      icon: '🔀',
      duration: 3500
    });
  };

  const handleCancelReorder = () => {
    if (setIsReorderMode) setIsReorderMode(false);
    setReorderList([]);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleMoveItem = (fromIndex, toIndex) => {
    if (fromIndex < 0 || fromIndex >= reorderList.length || toIndex < 0 || toIndex >= reorderList.length) return;
    setReorderList((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
    if (sourceId && sourceId !== targetId) {
      const fromIdx = reorderList.findIndex((i) => i.id === sourceId);
      const toIdx = reorderList.findIndex((i) => i.id === targetId);
      if (fromIdx !== -1 && toIdx !== -1) {
        handleMoveItem(fromIdx, toIdx);
      }
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleSaveReorder = async () => {
    setIsSavingOrder(true);
    try {
      const orderedIds = reorderList.map((item) => item.id);
      await saveMediaOrder(orderedIds);
      if (onReorderMedia) {
        onReorderMedia(reorderList);
      }
      if (setIsReorderMode) setIsReorderMode(false);
      setReorderList([]);
      toast.success('Gallery order saved successfully! ✨', {
        duration: 4000
      });
    } catch (err) {
      toast.error(`Failed to save order: ${err.message}`);
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <section id="gallery" className="py-14 sm:py-20 relative bg-royal-ivory pb-28 w-full max-w-full overflow-hidden">
      <div className="w-full max-w-full mx-auto px-1 sm:px-3 md:px-4">
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 px-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-cinzel font-semibold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Treasured Collection
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-royal-espresso mb-3">
            {siteConfig.gallery.title}
          </h2>
          <p className="font-sans text-xs sm:text-base text-royal-espresso/70 leading-relaxed">
            {siteConfig.gallery.subtitle}
          </p>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 sm:mb-8 pb-3 border-b border-gold-200/60 w-full px-1">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setFilter('all');
                if (isSelectMode) setSelectedIds(new Set());
              }}
              disabled={isReorderMode}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all ${
                filter === 'all'
                  ? 'bg-gold-600 text-white shadow-sm'
                  : 'bg-white text-royal-espresso/80 border border-gold-200 hover:border-gold-400'
              } ${isReorderMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              All Photos
            </button>

            <button
              onClick={() => {
                setFilter('favourites');
                if (isSelectMode) setSelectedIds(new Set());
              }}
              disabled={isReorderMode}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                filter === 'favourites'
                  ? 'bg-gold-600 text-white shadow-sm'
                  : 'bg-white text-royal-espresso/80 border border-gold-200 hover:border-gold-400'
              } ${isReorderMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 ${favouriteCount > 0 ? 'fill-gold-500 text-gold-600' : ''}`} />
              Favourites
              {favouriteCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-gold-200 text-gold-900 rounded-full text-[10px] font-semibold">
                  {favouriteCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Controls: Slideshow, Select Photos, Sort Order & Refresh */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {/* Play Slideshow Button */}
            {items.length > 0 && !isSelectMode && !isReorderMode && (
              <button
                onClick={onStartSlideshow}
                className="px-3 py-1.5 rounded-full text-xs font-sans font-medium transition flex items-center gap-1.5 bg-white border border-gold-200 text-royal-espresso hover:border-gold-400 hover:bg-gold-50 shadow-sm"
                title="Play Slideshow from beginning"
              >
                <Play className="w-3.5 h-3.5 text-gold-600 fill-gold-500" />
                <span>Slideshow</span>
              </button>
            )}

            {/* Multi-Select Toggle Button */}
            {items.length > 0 && !isReorderMode && (
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) setSelectedIds(new Set());
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition flex items-center gap-1.5 ${
                  isSelectMode
                    ? 'bg-gold-600 text-white shadow-sm'
                    : 'bg-white border border-gold-200 text-royal-espresso hover:border-gold-400'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-gold-500" />
                <span>{isSelectMode ? 'Cancel' : 'Select'}</span>
              </button>
            )}

            {/* Sort Toggle */}
            {!isReorderMode && (
              <div className="flex items-center gap-1 bg-white border border-gold-200 rounded-full px-2.5 py-1.5 text-xs text-royal-espresso font-sans">
                <ArrowUpDown className="w-3 h-3 text-gold-600" />
                <button
                  onClick={() => setSortOrder(sortOrder === 'oldest' ? 'newest' : 'oldest')}
                  className="font-medium text-gold-800 hover:text-gold-900 capitalize"
                  title={sortOrder === 'oldest' ? 'Showing custom / first added order' : 'Showing newest first'}
                >
                  {sortOrder === 'oldest' ? 'First Added' : 'Newest'}
                </button>
              </div>
            )}

            {/* Refresh */}
            {!isReorderMode && (
              <button
                onClick={onRefresh}
                className="p-1.5 sm:p-2 rounded-full bg-white border border-gold-200 text-royal-espresso/70 hover:text-gold-700 hover:border-gold-400 transition"
                aria-label="Refresh gallery"
                title="Refresh gallery"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Reorder Mode Banner */}
        {isReorderMode && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gold-100 via-royal-cream to-gold-100 border border-gold-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-royal-espresso animate-in slide-in-from-top-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-200 border border-gold-400 flex items-center justify-center shrink-0">
                <GripVertical className="w-5 h-5 text-gold-800" />
              </div>
              <div>
                <span className="font-serif text-sm sm:text-base font-bold text-royal-espresso block leading-tight">
                  Reorder Mode Active ({reorderList.length} photos)
                </span>
                <span className="text-[11px] sm:text-xs text-royal-espresso/75 font-sans block mt-0.5">
                  Drag photos or tap <strong>Earlier / Later</strong> to arrange. Tap <strong>Save Order</strong> when finished.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={handleCancelReorder}
                disabled={isSavingOrder}
                className="px-4 py-2 rounded-full bg-white border border-gold-300 text-royal-espresso hover:bg-gold-50 text-xs font-sans font-semibold transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveReorder}
                disabled={isSavingOrder}
                className="px-5 py-2 rounded-full bg-gold-600 hover:bg-gold-700 disabled:opacity-50 text-white text-xs font-sans font-semibold tracking-wider uppercase shadow-royal flex items-center gap-1.5 transition"
              >
                {isSavingOrder ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className={`w-full grid ${gridColsClass} gap-1.5 sm:gap-2.5 items-start`}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-full h-64 bg-royal-sand/30 rounded-sm animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && activeItems.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl border-2 border-dashed border-gold-200 bg-white/60 max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 rounded-full bg-gold-100/70 border border-gold-300 text-gold-700 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-gold-600" />
            </div>
            <h3 className="font-serif text-2xl text-royal-espresso mb-2">
              {filter === 'favourites'
                ? 'No Favourites Saved Yet'
                : 'No Photos Uploaded Yet'}
            </h3>
            <p className="font-sans text-sm text-royal-espresso/60 max-w-md mx-auto mb-6">
              {filter === 'favourites'
                ? siteConfig.favourites.emptyMessage
                : 'Be the first family member to upload a photo from Prabhudas & Soumya’s engagement!'}
            </p>
            {filter === 'favourites' ? (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-2.5 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-sans text-xs uppercase tracking-wider font-semibold shadow-sm transition"
              >
                View All Photos
              </button>
            ) : (
              <button
                onClick={scrollToUpload}
                className="px-6 py-2.5 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-sans text-xs uppercase tracking-wider font-semibold shadow-sm transition"
              >
                Upload First Photo
              </button>
            )}
          </div>
        )}

        {/* Populated Gallery: Row-wise order (1 2 / 3 4 / 5 6 ...) with 100% complete natural photos */}
        {!isLoading && activeItems.length > 0 && (
          <div className={`w-full grid ${gridColsClass} gap-1.5 sm:gap-2.5 items-start`}>
            {columnBuckets.map((bucket, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1.5 sm:gap-2.5 w-full">
                {bucket.map(({ item, index }) => (
                  <PhotoCard
                    key={item.id}
                    item={item}
                    isFavourited={isFavourited(item.id)}
                    favouriteCount={getFavouriteCount(item.id)}
                    onToggleFavourite={onToggleFavourite}
                    onOpenLightbox={onOpenLightbox}
                    onDownload={onDownload}
                    onRequestDelete={onRequestDelete}
                    isSelectMode={isSelectMode}
                    isSelected={selectedIds.has(item.id)}
                    onToggleSelect={handleToggleSelect}
                    onLongPress={handleLongPress}
                    isReorderMode={isReorderMode}
                    reorderIndex={index}
                    canMoveEarlier={index > 0}
                    canMoveLater={index < activeItems.length - 1}
                    onMoveEarlier={() => handleMoveItem(index, index - 1)}
                    onMoveLater={() => handleMoveItem(index, index + 1)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedId === item.id}
                    isDragOver={dragOverId === item.id}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Sticky Bottom Bar for Multi-Select Download */}
      {isSelectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg bg-royal-card/95 backdrop-blur-md border border-gold-300 shadow-2xl rounded-2xl p-3 sm:p-4 text-royal-espresso animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xs sm:text-base font-semibold text-royal-espresso">
                {selectedIds.size} of {items.length} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-[11px] font-sans text-gold-700 hover:text-gold-900 underline ml-1"
              >
                {selectedIds.size === items.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-full border border-gold-200 text-xs font-sans text-royal-espresso hover:bg-gold-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDownloadSelected}
                disabled={selectedIds.size === 0 || isDownloadingSelected}
                className="px-3.5 sm:px-4 py-2 rounded-full bg-gold-600 hover:bg-gold-700 disabled:opacity-50 text-white text-xs font-sans font-semibold uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
              >
                {isDownloadingSelected ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Packaging...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ({selectedIds.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
