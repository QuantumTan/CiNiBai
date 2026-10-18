import { useSyncExternalStore } from 'react';

/**
 * Hook to check if a media query matches using useSyncExternalStore.
 * e.g. useMediaQuery('(min-width: 768px)') returns true on tablets and up.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    () => false
  );
}
