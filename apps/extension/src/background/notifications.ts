import { type ServerToClient, serverToClient } from '@lgamila/shared';
import { Storage } from '@plasmohq/storage';
import { logger } from '@/lib/logger';
import type { Settings, Streamer } from '@/lib/types';

logger.info('Notifications background script loaded');

const storage = new Storage();
const liveNotifications = new Map<string, string>();

const platformUrl = (platform: string, username: string) => {
  switch (platform) {
    case 'twitch':
      return `https://www.twitch.tv/${username}`;
    case 'kick':
      return `https://kick.com/${username}`;
    default:
      return '';
  }
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const showNotification = (parsed: ServerToClient) => {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, parsed);
    });
  } catch (error) {
    logger.error('Error showing notification', error);
  }
};

chrome.runtime.onMessage.addListener(async (message) => {
  logger.info('Received message', JSON.stringify(message));
  const parsed = serverToClient.safeParse(message);

  if (!parsed.success) {
    return;
  }

  switch (parsed.data.type) {
    case 'streamer-live': {
      if (!(parsed.data.data.platform && parsed.data.data.name)) {
        return;
      }

      // Check settings before creating notifications
      const settings = await storage.get<Settings>('settings');
      const favorites =
        (await storage.get<Streamer['id'][]>('favorites')) || [];
      const blockedStreamers =
        (await storage.get<Streamer['id'][]>('blocked')) || [];

      // Skip if notifications are disabled
      if (settings?.notifyWhenStreamerIsLive === false) {
        logger.info('Notifications disabled, skipping browser notification');
        return;
      }

      // Skip if streamer is blocked
      if (blockedStreamers.includes(parsed.data.data.id)) {
        logger.info('Streamer is blocked, skipping browser notification');
        return;
      }

      // Skip if only favorites should be notified and this streamer is not a favorite
      if (
        settings?.onlyNotifyWhenFavoriteStreamerIsLive &&
        !favorites.includes(parsed.data.data.id)
      ) {
        logger.info(
          'Only favorite notifications enabled and streamer is not a favorite, skipping browser notification'
        );
        return;
      }

      logger.info('Creating notification', JSON.stringify(parsed.data.data));
      chrome.notifications.create(
        {
          type: 'basic',
          iconUrl: chrome.runtime.getURL(
            chrome.runtime.getManifest().icons['128']
          ),
          title: `${capitalize(parsed.data.data.name)} is live!`,
          message: `${capitalize(parsed.data.data.name)} is live on ${capitalize(
            parsed.data.data.platform
          )}`,
          isClickable: true,
        },
        (notificationId) => {
          liveNotifications.set(
            notificationId,
            // @ts-expect-error - TODO: fix this
            platformUrl(parsed.data.data.platform, parsed.data.data.name)
          );
        }
      );

      showNotification(parsed.data);
      break;
    }
    case 'ping': {
      logger.info('Ping received', JSON.stringify(parsed.data.data));
      break;
    }
    default:
      return;
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  logger.info('Notification clicked', notificationId);
  const url = liveNotifications.get(notificationId);
  if (url) {
    chrome.tabs.create({ url });
  }
  chrome.notifications.clear(notificationId);
});
