import { useQuery } from 'react-query';
import { API_URL } from '@/lib/constants';
import type { Streamer } from '@/lib/types';

export const useStreamers = () => {
  return useQuery({
    queryKey: ['streamers'],
    queryFn: () =>
      (async () => {
        const response = await fetch(`${API_URL}/api/streamers`);
        const data = await response.json();
        return data as {
          streamers: Streamer[];
        };
      })(),
    refetchInterval: 1000 * 60 * 5, // TODO fine tune
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    onSuccess: (data) => {
      const streamers = data.streamers;
      const liveStreamers = streamers.filter((streamer) => streamer.isLive);
      const badgeCount = liveStreamers.length;
      /*if (chrome) {
        chrome.action.setBadgeText({ text: badgeCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#C11919' });
      }*/
      if (typeof chrome !== 'undefined' && chrome.action) {
        chrome.action.setBadgeText({ text: badgeCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#C11919' });
      } else if (typeof browser !== 'undefined' && browser.browserAction) {
        browser.browserAction.setBadgeText({ text: badgeCount.toString() });
        browser.browserAction.setBadgeBackgroundColor({ color: '#C11919' });
      }
    },
  });
};
