import { useStorage } from '@plasmohq/storage/hook';
import type { SortOption, Streamer } from '@/lib/types';
import { sortStreamers } from '@/lib/utils';
import { StreamerCard } from './streamer-card';

export function StreamerList({
  streamers,
  favoriteOnly = false,
  liveOnly = false,
  sortBy = 'default',
}: {
  streamers: Streamer[];
  favoriteOnly?: boolean;
  liveOnly?: boolean;
  sortBy?: SortOption;
}) {
  const [favorites, setFavorites] = useStorage<Streamer['id'][]>(
    'favorites',
    []
  );
  const [blockedStreamers, setBlockedStreamers] = useStorage<Streamer['id'][]>(
    'blocked',
    []
  );

  const filteredAndSortedStreamers = sortStreamers(
    streamers.filter((streamer) => {
      if (favoriteOnly) {
        return (
          favorites.includes(streamer.id) &&
          !blockedStreamers.includes(streamer.id)
        );
      }

      if (liveOnly) {
        return streamer.isLive && !blockedStreamers.includes(streamer.id);
      }
      return true;
    }),
    sortBy
  );

  return (
    <div className="w-full flex flex-col gap-4 overflow-y-auto h-[320px] overflow-x-hidden">
      {filteredAndSortedStreamers.length === 0 && (
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          <p className="text-sm text-muted-foreground">No streamers found.</p>
        </div>
      )}
      {filteredAndSortedStreamers.map((streamer) => (
        <StreamerCard
          isBlocked={blockedStreamers.includes(streamer.id)}
          isFavorite={favorites.includes(streamer.id)}
          key={streamer.id}
          onBlock={(streamer) => {
            setBlockedStreamers((blocked) => {
              const newBlocked = [...blocked];
              if (newBlocked.includes(streamer.id)) {
                newBlocked.splice(newBlocked.indexOf(streamer.id), 1);
              } else {
                newBlocked.push(streamer.id);
              }
              return newBlocked;
            });
          }}
          onFavorite={(streamer) => {
            setFavorites((favorites) => {
              const newFavorites = [...favorites];
              if (newFavorites.includes(streamer.id)) {
                newFavorites.splice(newFavorites.indexOf(streamer.id), 1);
              } else {
                newFavorites.push(streamer.id);
              }
              return newFavorites;
            });
          }}
          streamer={streamer}
        />
      ))}
    </div>
  );
}
