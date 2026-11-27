import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchMediaList } from '../services/mediaService';
import { siteConfig } from '../config/siteConfig';

export function useGallery(favouritesSet) {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'photos' | 'videos' | 'favourites'
  const [sortOrder, setSortOrder] = useState(siteConfig.gallery.defaultSort || 'oldest'); // 'oldest' (insertion order) | 'newest'

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr, isDemo: demoFlag } = await fetchMediaList();
      if (fetchErr) {
        setError(fetchErr);
      }
      setMedia(data || []);
      setIsDemo(demoFlag);
    } catch (err) {
      setError(err.message || 'Failed to load gallery memories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const addMediaItem = useCallback((newRecord) => {
    // Preserve insertion order: new uploads append to the end of the collection
    setMedia((prev) => {
      const nextOrder = prev.length + 1;
      return [...prev, { ...newRecord, display_order: nextOrder }];
    });
  }, []);

  const removeMediaItem = useCallback((id) => {
    setMedia((prev) => prev.filter(m => m.id !== id));
  }, []);

  const reorderMedia = useCallback((newOrderedList) => {
    setMedia(newOrderedList.map((item, idx) => ({ ...item, display_order: idx + 1 })));
  }, []);

  // Filter & Sort
  const filteredMedia = useMemo(() => {
    let result = [...media];

    // 1. Filter
    if (filter === 'favourites') {
      result = result.filter((item) => favouritesSet && favouritesSet.has(item.id));
    }

    // 2. Sort: by display_order first, then fallback to created_at
    result.sort((a, b) => {
      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return sortOrder === 'newest' ? orderB - orderA : orderA - orderB;
      }
      const dateA = new Date(a.created_at).getTime() || 0;
      const dateB = new Date(b.created_at).getTime() || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [media, filter, sortOrder, favouritesSet]);

  const photoCount = useMemo(() => media.filter(m => m.media_type === 'image').length, [media]);
  const videoCount = useMemo(() => media.filter(m => m.media_type === 'video').length, [media]);

  return {
    media,
    setMedia,
    reorderMedia,
    filteredMedia,
    totalCount: media.length,
    photoCount,
    videoCount,
    isLoading,
    error,
    isDemo,
    filter,
    setFilter,
    sortOrder,
    setSortOrder,
    refreshGallery: loadMedia,
    addMediaItem,
    removeMediaItem
  };
}
