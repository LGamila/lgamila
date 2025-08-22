/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: <explanation> */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SortOption, Streamer } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortStreamers(streamers: Streamer[], sortBy: SortOption) {
  return streamers.sort((a, b) => {
    switch (sortBy) {
      case 'viewers-desc':
        // Live streamers first, then sorted by viewer count descending
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return b.viewerCount - a.viewerCount;
      case 'viewers-asc':
        // Live streamers first, then sorted by viewer count ascending
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return a.viewerCount - b.viewerCount;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        // Default sort: live streamers first (sorted by viewers desc), then offline
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        if (a.isLive && b.isLive) return b.viewerCount - a.viewerCount;
        return a.name.localeCompare(b.name);
    }
  });
}
