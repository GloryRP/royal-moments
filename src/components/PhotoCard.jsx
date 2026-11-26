import React, { useState } from 'react';
import { 
  Heart, 
  Play, 
  Download, 
  Maximize2, 
  User, 
  Clock, 
  MoreVertical, 
  Share2, 
  Trash2,
  MessageCircle
} from 'lucide-react';
import { formatMediaDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

export function PhotoCard({
  item,
  isFavourited,
  favouriteCount,
  onToggleFavourite,
  onOpenLightbox,
  onDownload,
  onRequestDelete
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isVideo = item.media_type === 'video';

  const handleCardClick = (e) => {
    if (e.target.closest('.action-button') || e.target.closest('.menu-container')) return;
    onOpenLightbox(item);
  };

  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const mediaUrl = item.url || item.file_path;
    const text = encodeURIComponent(
      `Look at this beautiful memory from Prabhudas & Somya's Engagement Ceremony! 💍✨\n\n"${item.caption || item.file_name}"\n\nView here: ${mediaUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-royal-card border border-gold-200/60 shadow-sm hover:shadow-royal-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Media Container with aspect ratio */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-royal-cream">
        {/* Skeleton loading animation */}
        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-royal-sand via-royal-cream to-royal-sand animate-pulse" />
        )}

        {/* Image / Video preview */}
        {isVideo ? (
          <div className="relative w-full h-full bg-royal-espresso flex items-center justify-center">
            <video
              src={item.url || item.file_path}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoadedData={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(true);
                setHasError(true);
              }}
              muted
              playsInline
              preload="metadata"
            />
            {/* Center Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-royal-espresso/70 backdrop-blur-md border border-gold-300/80 text-gold-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-white transition-all shadow-lg">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
            {/* Video badge */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-royal-espresso/70 backdrop-blur-sm text-[10px] font-sans font-medium text-gold-200 uppercase tracking-wider flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-current" /> Video
            </div>
          </div>
        ) : (
          <img
            src={item.url || item.file_path}
            alt={item.caption || item.file_name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setHasError(true);
            }}
            loading="lazy"
          />
        )}

        {/* Fallback broken image indicator */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-royal-sand/40 text-royal-espresso/60 p-4 text-center">
            <span className="text-2xl mb-1">🖼️</span>
            <span className="text-xs font-sans">Unable to load media</span>
          </div>
        )}

        {/* Top Right Actions: 3-dots Menu + Favourite Button */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {/* Quick Favourite */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite(item.id);
            }}
            className="action-button p-2 rounded-full bg-royal-ivory/85 backdrop-blur-md border border-gold-300/50 text-royal-espresso hover:text-red-600 transition-all shadow-sm active:scale-90"
            aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
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
              className="action-button p-2 rounded-full bg-royal-ivory/85 backdrop-blur-md border border-gold-300/50 text-royal-espresso hover:text-gold-800 transition-all shadow-sm"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* 3-Dots Dropdown Menu */}
            {menuOpen && (
              <div 
                className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-gold-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
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
                  <span>Delete Memory</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-royal-espresso/80 via-royal-espresso/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <span className="text-[11px] font-sans text-gold-200 flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" /> Tap to view full size
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(item);
              }}
              className="action-button p-2 rounded-full bg-white/20 hover:bg-gold-500 hover:text-white backdrop-blur-md text-white transition-all shadow-sm"
              aria-label="Download original file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer: Metadata & Contributor Info */}
      <div className="p-3 sm:p-4 bg-white">
        {item.caption && (
          <p className="font-serif text-sm text-royal-espresso line-clamp-2 mb-2 leading-snug">
            "{item.caption}"
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-royal-espresso/60 font-sans">
          <div className="flex items-center gap-1 truncate max-w-[140px]">
            <User className="w-3 h-3 text-gold-600 flex-shrink-0" />
            <span className="truncate font-medium text-royal-espresso/80">
              {item.contributor_name || 'Family Member'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {favouriteCount > 0 && (
              <span className="flex items-center gap-0.5 text-gold-700 font-medium">
                <Heart className="w-2.5 h-2.5 fill-gold-500 text-gold-600" />
                {favouriteCount}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-gold-600/70" />
              <span>{formatMediaDate(item.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
