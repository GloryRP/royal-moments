import React from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Heart, 
  ArrowUpDown, 
  Camera, 
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { PhotoCard } from './PhotoCard';
import { siteConfig } from '../config/siteConfig';

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
  const scrollToUpload = () => {
    const el = document.getElementById('upload');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="gallery" className="py-20 relative bg-royal-ivory">
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
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all ${
                filter === 'all'
                  ? 'bg-gold-600 text-white shadow-sm'
                  : 'bg-white text-royal-espresso/80 border border-gold-200 hover:border-gold-400'
              }`}
            >
              All Moments
            </button>

            <button
              onClick={() => setFilter('photos')}
              className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                filter === 'photos'
                  ? 'bg-gold-600 text-white shadow-sm'
                  : 'bg-white text-royal-espresso/80 border border-gold-200 hover:border-gold-400'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Photos Only
            </button>

            <button
              onClick={() => setFilter('videos')}
              className={`px-4 py-2 rounded-full text-xs font-sans font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                filter === 'videos'
                  ? 'bg-gold-600 text-white shadow-sm'
                  : 'bg-white text-royal-espresso/80 border border-gold-200 hover:border-gold-400'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Videos Only
            </button>

            <button
              onClick={() => setFilter('favourites')}
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

          {/* Right Controls: Sort Order & Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-gold-200 rounded-full px-3 py-1.5 text-xs text-royal-espresso font-sans">
              <ArrowUpDown className="w-3.5 h-3.5 text-gold-600" />
              <span className="text-royal-espresso/60 mr-1">Sort:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="font-medium text-gold-800 hover:text-gold-900 capitalize"
              >
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
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

        {/* Gallery Grid State: Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-white border border-gold-100 shadow-sm animate-pulse"
              >
                <div className="aspect-[4/5] bg-royal-sand/50" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-royal-sand/60 rounded w-3/4" />
                  <div className="h-3 bg-royal-sand/40 rounded w-1/2" />
                </div>
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
                : 'No Memories in this View Yet'}
            </h3>
            <p className="font-sans text-sm text-royal-espresso/60 max-w-md mx-auto mb-6">
              {filter === 'favourites'
                ? siteConfig.favourites.emptyMessage
                : 'Be the first family member to upload a cherished photograph or video from the celebration!'}
            </p>
            {filter === 'favourites' ? (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-2.5 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-sans text-xs uppercase tracking-wider font-semibold shadow-sm transition"
              >
                View All Memories
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

        {/* Gallery Grid: Populated Items */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
