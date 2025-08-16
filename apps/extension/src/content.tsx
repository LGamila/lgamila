/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: allow it */
import styleText from 'data-text:./index.css';
import { serverToClient } from '@lgamila/shared';
import { Storage } from '@plasmohq/storage';
import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo';
import { useCallback, useEffect, useState } from 'react';
import { NotificationCard } from './components/molecules/notification-card';
import { playNotificationSound } from './lib/audio';
import { API_URL, NOTIFICATION_DURATION } from './lib/constants';
import { logger } from './lib/logger';
import type { Settings, Streamer } from './lib/types';

interface StreamerData {
  name: string;
  platform: string;
  avatar: string;
  link: string;
}

export const config: PlasmoCSConfig = {
  matches: ['https://*.twitch.tv/*', 'https://*.kick.com/*'],
  all_frames: true,
};

const storage = new Storage();
const CHECK_INTERVAL = 10_000;

const getStreamer = async (
  name: string,
  platform: 'twitch' | 'kick'
): Promise<Streamer[]> => {
  const response = await fetch(
    `${API_URL}/api/streamers?search=${name}&platform=${platform}`
  );
  const data = (await response.json()) as {
    streamers: Streamer[];
  };

  return data.streamers;
};

const determinePlatform = (url: string) => {
  if (url.includes('twitch.tv')) {
    return 'twitch' as const;
  }
  return 'kick' as const;
};

const TWITCH_URL_REGEX =
  /https:\/\/www\.twitch\.tv\/(?:popout\/)?([a-zA-Z0-9_]+)(?:\/chat)?/;
const KICK_URL_REGEX =
  /https:\/\/(www\.)?kick\.com\/(?:popout\/)?([a-zA-Z0-9_-]+)(?:\/chat)?/;

const getStreamerFromUrl = async (url: string) => {
  const twitchMatch = url.match(TWITCH_URL_REGEX);
  if (twitchMatch) {
    return twitchMatch[1];
  }
  const kickMatch = url.match(KICK_URL_REGEX);
  if (kickMatch) {
    return kickMatch[2];
  }
  return null;
};

const checkAndRedirect = async () => {
  const url = window.location.href;
  const currentStreamer = await getStreamerFromUrl(url);
  if (!currentStreamer) {
    logger.warn(`No streamer found for url: ${url}`);
    return;
  }
  const platform = determinePlatform(url);
  logger.info(`Streamer: ${currentStreamer}, Platform: ${platform}`);

  const streamerData = await getStreamer(currentStreamer, platform);
  logger.info(`Streamer data: ${JSON.stringify(streamerData)}`);

  const currentStreamerData = streamerData?.[0] ?? null;

  if (!currentStreamerData) {
    logger.warn(`No streamer data found for ${currentStreamer}`);
    return;
  }

  logger.info(
    `Kick username: ${currentStreamerData.kickUsername}, Twitch username: ${currentStreamerData.twitchUsername}`
  );

  if (
    currentStreamerData.isLive &&
    (currentStreamerData.livePlatform === platform ||
      currentStreamerData.livePlatforms?.includes(platform))
  ) {
    logger.info(
      `Streamer is live on ${currentStreamerData.livePlatform}, do nothing!`
    );
    return;
  }

  if (
    currentStreamerData.isLive &&
    currentStreamerData.livePlatform !== platform &&
    currentStreamerData.livePlatforms?.length === 1
  ) {
    logger.info(
      `Streamer is live on ${currentStreamerData.livePlatform}, switching to ${currentStreamerData.livePlatform}`
    );
    const platform =
      currentStreamerData.livePlatforms?.[0] ??
      currentStreamerData.livePlatform;
    const username =
      platform === 'twitch'
        ? currentStreamerData.twitchUsername
        : currentStreamerData.kickUsername;
    window.location.href = `https://www.${platform}.com/${username}`;
    return;
  }
};

let checkInterval: number | null = null;

const startChecking = () => {
  if (checkInterval) return;
  logger.info('Starting auto-redirect checks');
  checkAndRedirect(); // Initial check
  checkInterval = setInterval(
    checkAndRedirect,
    CHECK_INTERVAL
  ) as unknown as number;
};

const stopChecking = () => {
  if (!checkInterval) return;
  logger.info('Stopping auto-redirect checks');
  clearInterval(checkInterval);
  checkInterval = null;
};

// Watch for settings changes
storage.watch({
  settings: (change) => {
    const settings = change.newValue as Settings | undefined;
    logger.info(`Settings changed: ${JSON.stringify(settings)}`);

    if (settings?.autoRedirect) {
      startChecking();
    } else {
      stopChecking();
    }
  },
});

// Initial setup based on current settings
storage.get<Settings>('settings').then((settings) => {
  if (settings?.autoRedirect) {
    startChecking();
  }
});

// Notification Card
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styleText.replaceAll(':root', ':host(plasmo-csui)');
  return style;
};

export default function Root() {
  const [streamers, setStreamers] = useState<StreamerData[]>([]);

  const dismissNotification = useCallback((streamerName: string) => {
    setStreamers((prev) => prev.filter((s) => s.name !== streamerName));
  }, []);

  const showNotification = useCallback(
    ({ name, platform, avatar, link }: StreamerData) => {
      setStreamers((prev) => [...prev, { name, platform, avatar, link }]);
      setTimeout(() => {
        setStreamers((prev) => prev.filter((s) => s.name !== name));
      }, NOTIFICATION_DURATION);
    },
    []
  );

  useEffect(() => {
    chrome.runtime.onMessage.addListener(async (message) => {
      const parsed = serverToClient.safeParse(message);
      if (!parsed.success) {
        logger.warn('Invalid message', parsed.error);
        return;
      }
      if (parsed.data.type === 'streamer-live') {
        // Check settings before showing notification
        const settings = await storage.get<Settings>('settings');
        const favorites =
          (await storage.get<Streamer['id'][]>('favorites')) || [];
        const blockedStreamers =
          (await storage.get<Streamer['id'][]>('blocked')) || [];

        // Skip if notifications are disabled
        if (settings?.notifyWhenStreamerIsLive === false) {
          logger.info(
            'Notifications disabled, skipping content script notification'
          );
          return;
        }

        // Skip if streamer is blocked
        if (blockedStreamers.includes(parsed.data.data.id)) {
          logger.info(
            'Streamer is blocked, skipping content script notification'
          );
          return;
        }

        // Skip if only favorites should be notified and this streamer is not a favorite
        if (
          settings?.onlyNotifyWhenFavoriteStreamerIsLive &&
          !favorites.includes(parsed.data.data.id)
        ) {
          logger.info(
            'Only favorite notifications enabled and streamer is not a favorite, skipping content script notification'
          );
          return;
        }

        showNotification({
          name: parsed.data.data.name,
          platform: parsed.data.data.platform,
          avatar: parsed.data.data.avatar,
          link: `https://www.${parsed.data.data.platform}.com/${parsed.data.data.name}`,
        });

        if (settings?.playNotificationSound) {
          playNotificationSound();
        }
      }
      return true;
    });
  }, [showNotification]);

  return (
    <div className="top-0 right-0 flex flex-col gap-2">
      {streamers.map((streamer) => (
        <NotificationCard
          avatar={streamer.avatar}
          key={streamer.name}
          link={streamer.link}
          name={streamer.name}
          onDismiss={() => dismissNotification(streamer.name)}
          platform={streamer.platform}
        />
      ))}
    </div>
  );
}
