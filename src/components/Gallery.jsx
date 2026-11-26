import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  ArrowUpDown, 
  Camera, 
  RefreshCw,
  CheckSquare,
  Square,
  Download,
  X,
  Loader2
} from 'lucide-react';
import { PhotoCard } from './PhotoCard';
import { downloadAlbumZip } from '../services/downloadService';
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
  onDownload,
  onRequestDelete,
  onRefresh
}) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);

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

  return (
    <section id="gallery" className="py-20 relative bg-royal-ivory pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-cinzel font-semibold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Treasured Collection
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-royal-espresso mb-4">
            {siteConfig.gallery.title}
          </h2>
          <p className="font-sans text-sm sm:text-base text-royal-espresso/70 leading-relaxed">
            {siteConfig.gallery.subtitle}
          </p>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-4 border-b border-gold-200/60">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setFilter('all');
                if (isSelectMode) setSelectedIds(new Set());
              }}
              className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all ${
                filter === 'all'
                  ? 'bg-gold-600 text-white shadow-sm'
                  : 'bg-white text-royal-espresso/80 border border-gold-200 hover:border-gold-400'
              }`}
            >
              All Photos
            </button>

            <button
              onClick={() => {
                setFilter('favourites');
                if (isSelectMode) setSelectedIds(new Set());
              }}
              className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                filter === 'favourites'
                  ? 'bg-gold-600 text-white shadow-sm'
                  : 'bg-white text-royal-espresso/80 border border-gold-200 hover:border-gold-400'
              }`}
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

          {/* Right Controls: Select Photos, Sort Order & Refresh */}
          <div className="flex items-center gap-2.5">
            {/* Multi-Select Toggle Button */}
            {items.length > 0 && (
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  if (isSelectMode) setSelectedIds(new Set());
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition flex items-center gap-1.5 ${
                  isSelectMode
                    ? 'bg-gold-600 text-white shadow-sm'
                    : 'bg-white border border-gold-200 text-royal-espresso hover:border-gold-400'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 text-gold-500" />
                <span>{isSelectMode ? 'Cancel Selection' : 'Select Photos'}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-white border border-gold-200 rounded-full px-3 py-1.5 text-xs text-royal-espresso font-sans">
              <ArrowUpDown className="w-3.5 h-3.5 text-gold-600" />
              <span className="text-royal-espresso/60 mr-1">Sort:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="font-medium text-gold-800 hover:text-gold-900 capitalize"
              >
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </button>
            </div>

            <button
              onClick={onRefresh}
              className="p-2 rounded-full bg-white border border-gold-200 text-royal-espresso/70 hover:text-gold-700 hover:border-gold-400 transition"
              aria-label="Refresh gallery"
              title="Refresh gallery"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gallery Grid State: Loading Skeleton (Google Photos multi-column layout) */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-white border border-gold-100 shadow-sm animate-pulse"
              >
                <div className="aspect-square sm:aspect-[4/5] bg-royal-sand/50" />
              </div>
            ))}
          </div>
        )}

        {/* Gallery Grid State: Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-20 px-4 rounded-2xl border-2 border-dashed border-gold-200 bg-white/60 max-w-2xl mx-auto">
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
                : 'Be the first family member to upload a photo from Prabhudas & Somya’s engagement!'}
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

        {/* Gallery Grid: Populated Items (Google Photos 2-column mobile layout) */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {items.map((item) => (
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Sticky Bottom Bar for Multi-Select Download */}
      {isSelectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-royal-card/95 backdrop-blur-md border border-gold-300 shadow-2xl rounded-2xl p-3 sm:p-4 text-royal-espresso animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm sm:text-base font-semibold text-royal-espresso">
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
                className="px-3 py-1.5 rounded-full border border-gold-200 text-xs font-sans text-royal-espresso hover:bg-gold-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDownloadSelected}
                disabled={selectedIds.size === 0 || isDownloadingSelected}
                className="px-4 py-2 rounded-full bg-gold-600 hover:bg-gold-700 disabled:opacity-50 text-white text-xs font-sans font-semibold uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
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
