import * as Sentry from '@sentry/bun';
import { serve } from 'bun';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import api from './api';
import { env, isDev } from './lib/env';
import { logger } from './lib/logger';
import type { ApiContext } from './types/api';
import './lib/queues';

process.setMaxListeners(100);

Sentry.init({
  dsn: isDev ? undefined : '',
  tracesSampleRate: 0.1,
});

export const app = new Hono<ApiContext>()
  .use('*', honoLogger())
  .use(
    '*',
    cors({
      origin(origin) {
        return origin;
      },
      credentials: true,
    })
  )
  .get('/health', (c) => {
    return c.json({ status: 'ok' });
  })
  .route('/api', api);

const main = async () => {
  const server = serve({
    port: env.PORT,
    fetch: app.fetch,
    development: env.NODE_ENV !== 'production',
  });

  return server;
};

if (require.main === module) {
  process.on('SIGINT', () => {
    logger.info('Received SIGINT');
    process.exit(0);
  });

  process.on('exit', (code) => {
    logger.info(`Process exited with code ${code}`);
    process.exit(0);
  });

  main()
    .then((server) => {
      logger.info(`🚀 Server running at ${server.url}`);
    })
    .catch((err) => {
      logger.withError(err).error('Error starting server');
      process.exit(1);
    });
}
