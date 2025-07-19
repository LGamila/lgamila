import { useStorage } from '@plasmohq/storage/hook';
import type { Streamer } from '@/lib/types';
import { StreamerCard } from './streamer-card';

export function StreamerList({ streamers, favoriteOnly = false, offlineOnly = false }: { streamers: Streamer[], favoriteOnly?: boolean, offlineOnly?: boolean }) {
  const [favorites, setFavorites] = useStorage<Streamer['id'][]>(
    'favorites',
    []
  );

  const filteredStreamers = streamers.filter((streamer) => {
    if (favoriteOnly) {
      return favorites.includes(streamer.id);
    }
    if (offlineOnly) {
      return !streamer.isLive;
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-4 overflow-y-auto h-[320px]">
      {filteredStreamers.length === 0 && (
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No streamers found.
          </p>
        </div>
      )}
      {filteredStreamers.map((streamer) => (
        <StreamerCard
          isFavorite={favorites.includes(streamer.id)}
          key={streamer.id}
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
