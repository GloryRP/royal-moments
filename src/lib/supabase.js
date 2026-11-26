import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.includes('...')
  );
};

// Initialize client only if valid configuration is present
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial rich sample memories for local preview / demo mode
export const INITIAL_DEMO_MEDIA = [
  {
    id: 'demo-1',
    file_path: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
    file_name: 'The_Proposal_Moment.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 4200000,
    contributor_name: 'Uncle Thomas',
    caption: 'The moment she said yes! Heartfelt tears and pure happiness.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-2',
    file_path: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=85',
    file_name: 'Diamond_Ring_Exchange.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 3800000,
    contributor_name: 'Aunt Eleanor',
    caption: 'Exchanging the engagement rings under the chandelier.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-3',
    file_path: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85',
    file_name: 'Celebration_Toast.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 5100000,
    contributor_name: 'Cousin Marcus',
    caption: 'Champagne toast with both families united.',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-4',
    file_path: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=85',
    file_name: 'Grand_Palace_Entrance.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 6400000,
    contributor_name: 'Grandpa Arthur',
    caption: 'Walking together down the grand floral stairs.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-5',
    file_path: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=85',
    file_name: 'Garden_First_Dance.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 4900000,
    contributor_name: 'Sister Clara',
    caption: 'Their first slow dance in the royal courtyard.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-6',
    file_path: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=85',
    file_name: 'Candid_Laughter.jpg',
    media_type: 'image',
    mime_type: 'image/jpeg',
    file_size: 3200000,
    contributor_name: 'Brother Leo',
    caption: 'Spontaneous candid laugh during the speeches.',
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
    isDemo: true
  },
  {
    id: 'demo-7',
    file_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    file_name: 'Ring_Ceremony_Highlights.mp4',
    media_type: 'video',
    mime_type: 'video/mp4',
    file_size: 15400000,
    contributor_name: 'Best Man David',
    caption: 'Short clip of the blessings and clapping!',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    isDemo: true
  }
];
