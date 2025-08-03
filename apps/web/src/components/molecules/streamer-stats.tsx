import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/constants';
import { queryClient } from '@/store';

interface Streamer {
  id: string;
  name: string;
  isLive: boolean;
  livePlatform: string | null;
  viewerCount: number;
}

interface StreamerData {
  streamers: Streamer[];
}

async function fetchStreamers(): Promise<StreamerData> {
  const response = await fetch(`${API_URL}/api/streamers`);
  if (!response.ok) {
    throw new Error('Failed to fetch streamers');
  }
  return response.json();
}

function StreamerStatsClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['streamers'],
    queryFn: fetchStreamers,
  });

  const totalStreamers = data?.streamers.length || 0;
  const liveStreamers = data?.streamers.filter((s) => s.isLive).length || 0;
  const viewers =
    data?.streamers.reduce((acc, s) => acc + s.viewerCount, 0) || 0;

  if (error) {
    // Fallback to static numbers if API fails
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="space-y-2">
          <div className="text-4xl font-bold text-accent">50+</div>
          <div className="text-muted-foreground">Streamers Supported</div>
        </div>
        <div className="space-y-2">
          <div className="text-4xl font-bold text-accent">2</div>
          <div className="text-muted-foreground">Platforms Supported</div>
        </div>
        <div className="space-y-2">
          <div className="text-4xl font-bold text-accent">∞</div>
          <div className="text-muted-foreground">Potential to Unlock</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div className="space-y-2">
        <div className="text-4xl font-bold text-accent">
          {isLoading ? '...' : totalStreamers}
        </div>
        <div className="text-muted-foreground">Streamers Supported</div>
      </div>
      <div className="space-y-2">
        <div className="text-4xl font-bold text-accent">
          {isLoading ? '...' : liveStreamers}
        </div>
        <div className="text-muted-foreground">Currently Live</div>
      </div>
      <div className="space-y-2">
        <div className="text-4xl font-bold text-accent">
          {isLoading ? '...' : viewers}
        </div>
        <div className="text-muted-foreground">Live Viewers</div>
      </div>
    </div>
  );
}
export function StreamerStats() {
  return (
    <QueryClientProvider client={queryClient}>
      <StreamerStatsClient />
    </QueryClientProvider>
  );
}
