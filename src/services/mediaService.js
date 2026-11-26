import { supabase, isSupabaseConfigured, INITIAL_DEMO_MEDIA } from '../lib/supabase';

const LOCAL_STORAGE_MEDIA_KEY = 'royal_moments_local_media';

/**
 * Retrieves all uploaded media records
 * @returns {Promise<{ data: Array, error: string | null, isDemo: boolean }>}
 */
export async function fetchMediaList() {
  if (!isSupabaseConfigured()) {
    // Check if user uploaded items locally in demo mode
    const localSaved = getLocalDemoMedia();
    return {
      data: localSaved.length > 0 ? localSaved : INITIAL_DEMO_MEDIA,
      error: null,
      isDemo: true
    };
  }

  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase media fetch error:', error);
      const localSaved = getLocalDemoMedia();
      return {
        data: localSaved.length > 0 ? localSaved : INITIAL_DEMO_MEDIA,
        error: error.message,
        isDemo: true
      };
    }

    // Resolve storage public URLs if necessary
    const resolvedMedia = (data || []).map((item) => {
      let resolvedUrl = item.file_path;
      if (item.file_path && !item.file_path.startsWith('http')) {
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(item.file_path);
        resolvedUrl = publicUrlData.publicUrl;
      }
      return {
        ...item,
        url: resolvedUrl,
        isDemo: false
      };
    });

    return {
      data: resolvedMedia,
      error: null,
      isDemo: false
    };
  } catch (err) {
    console.error('Unexpected error fetching media:', err);
    return {
      data: INITIAL_DEMO_MEDIA,
      error: err.message,
      isDemo: true
    };
  }
}

/**
 * Inserts a new media record into Supabase
 */
export async function createMediaRecord(record) {
  if (!isSupabaseConfigured()) {
    // Save to local demo storage
    const localMedia = getLocalDemoMedia();
    const newRecord = {
      id: 'local_' + Date.now(),
      ...record,
      created_at: new Date().toISOString(),
      isDemo: true
    };
    localMedia.unshift(newRecord);
    try {
      localStorage.setItem(LOCAL_STORAGE_MEDIA_KEY, JSON.stringify(localMedia));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    return { data: newRecord, error: null };
  }

  const { data, error } = await supabase
    .from('media')
    .insert([record])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { data, error: null };
}

/**
 * Helper to retrieve locally saved demo items
 */
export function getLocalDemoMedia() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MEDIA_KEY);
    if (!raw) return INITIAL_DEMO_MEDIA;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_MEDIA;
  } catch (e) {
    return INITIAL_DEMO_MEDIA;
  }
}
