import { useState, useEffect, useCallback } from 'react';
import { getVisitorId } from '../utils/visitorId';
import { getFavourites, toggleFavourite as toggleFavService } from '../services/favouriteService';
import toast from 'react-hot-toast';

export function useFavourites() {
  const [visitorId, setVisitorId] = useState('');
  const [favouritesSet, setFavouritesSet] = useState(new Set());
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize visitor id & load favourites
  useEffect(() => {
    const id = getVisitorId();
    setVisitorId(id);

    async function load() {
      setIsLoading(true);
      try {
        const { visitorFavs, counts: loadedCounts } = await getFavourites(id);
        setFavouritesSet(visitorFavs);
        setCounts(loadedCounts);
      } catch (err) {
        console.error('Failed to load favourites:', err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const isFavourited = useCallback(
    (mediaId) => favouritesSet.has(mediaId),
    [favouritesSet]
  );

  const getFavouriteCount = useCallback(
    (mediaId) => counts[mediaId] || 0,
    [counts]
  );

  const toggle = useCallback(
    async (mediaId) => {
      if (!visitorId) return;

      const currentStatus = favouritesSet.has(mediaId);

      // Optimistic update
      setFavouritesSet((prev) => {
        const next = new Set(prev);
        if (currentStatus) {
          next.delete(mediaId);
        } else {
          next.add(mediaId);
        }
        return next;
      });

      setCounts((prev) => {
        const currentCount = prev[mediaId] || 0;
        return {
          ...prev,
          [mediaId]: currentStatus ? Math.max(0, currentCount - 1) : currentCount + 1
        };
      });

      try {
        const result = await toggleFavService(mediaId, visitorId, currentStatus);
        if (result.isFavourited) {
          toast.success('Added to your favourites', {
            icon: '❤️',
            style: {
              background: '#FAF6F0',
              color: '#2E231D',
              border: '1px solid #DFC278'
            }
          });
        } else {
          toast('Removed from favourites', {
            icon: '🤍',
            style: {
              background: '#FAF6F0',
              color: '#2E231D',
              border: '1px solid #E8DED1'
            }
          });
        }
      } catch (err) {
        // Rollback on unexpected error
        setFavouritesSet((prev) => {
          const next = new Set(prev);
          if (currentStatus) {
            next.add(mediaId);
          } else {
            next.delete(mediaId);
          }
          return next;
        });
        toast.error('Could not update favourite status');
      }
    },
    [visitorId, favouritesSet]
  );

  return {
    visitorId,
    favouritesSet,
    favouriteCount: favouritesSet.size,
    isFavourited,
    getFavouriteCount,
    toggleFavourite: toggle,
    isLoading
  };
}
