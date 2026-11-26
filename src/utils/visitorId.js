/**
 * Generates and persists a privacy-conscious visitor identifier in localStorage.
 * Used for tracking device-level likes and favorites without requiring passwords or signups.
 */

const VISITOR_ID_KEY = 'royal_moments_visitor_id';

export function getVisitorId() {
  if (typeof window === 'undefined') return 'server_render_visitor';

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    // Generate UUID v4
    visitorId = 'rm_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    try {
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    } catch (e) {
      console.warn('LocalStorage not available for visitor ID:', e);
    }
  }
  return visitorId;
}
