import { clientToServer, serverToClient } from '@lgamila/shared';
import { WS_URL } from './lib/constants';
import { logger } from './lib/logger';

logger.info('Offscreen script loaded');

// Keep the offscreen document alive
setInterval(async () => {
  (await navigator.serviceWorker.ready).active.postMessage('keepAlive');
}, 10_000);

const ws = new WebSocket(WS_URL);

ws.onopen = () => {
  logger.info('WebSocket connected');
};

ws.onmessage = async (event) => {
  logger.info('WebSocket message received', event.data);

  const parsed = serverToClient.safeParse(JSON.parse(event.data));
  if (!parsed.success) {
    logger.error('Invalid message', parsed.error);
    return;
  }

  const payload = parsed.data.data;
  const type = parsed.data.type;

  switch (type) {
    case 'connected':
      logger.info('WebSocket connected', payload.id);
      break;
    case 'ping':
      logger.info('WebSocket ping received', payload.id);
      chrome.runtime.sendMessage({
        type: 'ping',
        data: { id: payload.id, timestamp: Date.now() },
      });

      ws.send(
        JSON.stringify(
          clientToServer.parse({
            id: payload.id,
            type: 'pong',
            data: { id: payload.id, timestamp: Date.now() },
          })
        )
      );
      break;
    case 'streamer-live': {
      logger.info('Streamer live', payload.id);

      chrome.runtime.sendMessage({
        type: 'streamer-live',
        data: payload,
      });
      break;
    }
    default:
      logger.error('Unknown message type', payload);
      break;
  }
};

ws.onerror = (event) => {
  logger.error('WebSocket error', event);
};

ws.onclose = () => {
  logger.info('WebSocket closed, attempting to reconnect...');
  setTimeout(() => {
    location.reload();
  }, 3000);
};
