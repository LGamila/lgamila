import { Storage } from '@plasmohq/storage';
import type { PlasmoCSConfig } from 'plasmo';
import { API_URL } from './lib/constants';
import { logger } from './lib/logger';
import type { Streamer } from './lib/types';

export const config: PlasmoCSConfig = {
  matches: ['https://*.twitch.tv/*', 'https://*.kick.com/*'],
  all_frames: true,
};

interface Settings {
  autoRedirect: boolean;
}

const storage = new Storage();
const CHECK_INTERVAL = 10_000; // Check every minute

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

const TWITCH_URL_REGEX = /https:\/\/www\.twitch\.tv\/([a-zA-Z0-9_]+)/;
const KICK_URL_REGEX = /https:\/\/(www\.)?kick\.com\/([a-zA-Z0-9_]+)/;

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
    logger.error(`No streamer found for url: ${url}`);
    return;
  }
  const platform = determinePlatform(url);
  logger.info(`Streamer: ${currentStreamer}, Platform: ${platform}`);

  const streamerData = await getStreamer(currentStreamer, platform);
  logger.info(`Streamer data: ${JSON.stringify(streamerData)}`);

  const currentStreamerData = streamerData?.[0] ?? null;

  if (!currentStreamerData) {
    logger.error(`No streamer data found for ${currentStreamer}`);
    return;
  }

  logger.info(
    `Kick username: ${currentStreamerData.kickUsername}, Twitch username: ${currentStreamerData.twitchUsername}`
  );

  if (
    currentStreamerData.isLive &&
    currentStreamerData.livePlatform === platform
  ) {
    logger.info(
      `Streamer is live on ${currentStreamerData.livePlatform}, do nothing!`
    );
    return;
  }

  if (
    currentStreamerData.isLive &&
    currentStreamerData.livePlatform !== platform
  ) {
    logger.info(
      `Streamer is live on ${currentStreamerData.livePlatform}, switching to ${currentStreamerData.livePlatform}`
    );
    const username =
      currentStreamerData.livePlatform === 'twitch'
        ? currentStreamerData.twitchUsername
        : currentStreamerData.kickUsername;
    window.location.href = `https://www.${currentStreamerData.livePlatform}.com/${username}`;
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
