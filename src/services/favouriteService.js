import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_FAVOURITES_KEY = 'royal_moments_visitor_favourites';

/**
 * Loads favourites for the current visitor
 * @param {string} visitorId
 * @returns {Promise<{ visitorFavs: Set<string>, counts: Record<string, number> }>}
 */
export async function getFavourites(visitorId) {
  if (!isSupabaseConfigured()) {
    return getLocalFavourites();
  }

  try {
    // 1. Fetch visitor's personal favourites
    const { data: myFavs, error: myError } = await supabase
      .from('favourites')
      .select('media_id')
      .eq('visitor_id', visitorId);

    if (myError) {
      console.warn('Error fetching visitor favourites:', myError);
      return getLocalFavourites();
    }

    const visitorSet = new Set((myFavs || []).map(f => f.media_id));

    // 2. Fetch all counts
    const { data: allFavs, error: allError } = await supabase
      .from('favourites')
      .select('media_id');

    const counts = {};
    if (!allError && allFavs) {
      for (const row of allFavs) {
        counts[row.media_id] = (counts[row.media_id] || 0) + 1;
      }
    }

    return {
      visitorFavs: visitorSet,
      counts
    };
  } catch (err) {
    console.error('Favourites service failure:', err);
    return getLocalFavourites();
  }
}

/**
 * Toggles a favourite status for a given media
 * @param {string} mediaId
 * @param {string} visitorId
 * @param {boolean} currentStatus
 */
export async function toggleFavourite(mediaId, visitorId, currentStatus) {
  if (!isSupabaseConfigured()) {
    return toggleLocalFavourite(mediaId, currentStatus);
  }

  try {
    if (currentStatus) {
      // Remove favourite
      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('media_id', mediaId)
        .eq('visitor_id', visitorId);

      if (error) throw error;
      return { success: true, isFavourited: false };
    } else {
      // Add favourite
      const { error } = await supabase
        .from('favourites')
        .insert([{ media_id: mediaId, visitor_id: visitorId }]);

      if (error) {
        // If already exists, treat as success
        if (error.code === '23505') {
          return { success: true, isFavourited: true };
        }
        throw error;
      }
      return { success: true, isFavourited: true };
    }
  } catch (err) {
    console.warn('Supabase favourite toggle failed, falling back to local:', err);
    return toggleLocalFavourite(mediaId, currentStatus);
  }
}

/**
 * Local storage fallback for favourites
 */
function getLocalFavourites() {
  if (typeof window === 'undefined') {
    return { visitorFavs: new Set(), counts: {} };
  }
  try {
    const raw = localStorage.getItem(LOCAL_FAVOURITES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const visitorFavs = new Set(arr);
    const counts = {};
    arr.forEach(id => {
      counts[id] = 1;
    });
    return { visitorFavs, counts };
  } catch (e) {
    return { visitorFavs: new Set(), counts: {} };
  }
}

function toggleLocalFavourite(mediaId, currentStatus) {
  try {
    const raw = localStorage.getItem(LOCAL_FAVOURITES_KEY);
    let arr = raw ? JSON.parse(raw) : [];
    if (currentStatus) {
      arr = arr.filter(id => id !== mediaId);
    } else {
      if (!arr.includes(mediaId)) {
        arr.push(mediaId);
      }
    }
    localStorage.setItem(LOCAL_FAVOURITES_KEY, JSON.stringify(arr));
    return { success: true, isFavourited: !currentStatus };
  } catch (e) {
    return { success: true, isFavourited: !currentStatus };
  }
}
