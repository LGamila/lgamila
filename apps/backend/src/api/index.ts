import { zValidator } from '@hono/zod-validator';
import { desc, ilike, isNotNull, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import cache from '@/lib/cache/default';
import { db } from '@/lib/db';
import { streamer } from '@/lib/db/schema';
import type { Streamer } from '@/lib/db/types';
import { logger } from '@/lib/logger';
import type { ApiContext } from '../types/api';

const api = new Hono<ApiContext>()
  .get(
    '/streamers',
    zValidator(
      'query',
      z.object({
        search: z.string().optional(),
        platform: z.enum(['twitch', 'kick']).optional(),
      })
    ),
    async (c) => {
      const { search, platform } = c.req.valid('query');
      const cacheKey =
        `streamers:${search || ''}:${platform || ''}` +
        (Math.random() * 1_000_000).toString();
      logger.info(`Cache key: ${cacheKey}`);
      const cachedStreamers = await cache.get<string>(cacheKey);

      if (cachedStreamers) {
        logger.info(`Returning cached streamers: ${cacheKey}`);
        return c.json({
          streamers: JSON.parse(cachedStreamers) as Streamer[],
        });
      }

      const streamers = await db.query.streamer.findMany({
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
          twitchUsername: true,
          kickUsername: true,
          isLive: true,
          livePlatform: true,
          viewerCount: true,
          category: true,
          title: true,
        },
        where:
          search && platform
            ? platform === 'twitch'
              ? ilike(streamer.twitchUsername, `${search}`)
              : ilike(streamer.kickUsername, `${search}`)
            : search
              ? or(
                  ilike(streamer.name, `${search}`),
                  ilike(streamer.twitchUsername, `${search}`),
                  ilike(streamer.kickUsername, `${search}`)
                )
              : undefined,
        orderBy: [desc(streamer.isLive), desc(streamer.viewerCount)],
      });

      await cache.set(cacheKey, JSON.stringify(streamers));

      return c.json({
        streamers,
      });
    }
  )
  .get('/streamers/multi', async (c) => {
    const cachedStreamers = await cache.get<string>('streamers-multi');

    if (cachedStreamers) {
      logger.info('Returning cached streamers');
      return c.json({
        streamers: JSON.parse(cachedStreamers),
      });
    }

    // Return streamers that have both a twitch and kick username
    const streamers = await db.query.streamer.findMany({
      where: (streamer, { and }) =>
        and(
          isNotNull(streamer.twitchUsername),
          isNotNull(streamer.kickUsername)
        ),
    });

    await cache.set('streamers-multi', JSON.stringify(streamers));

    return c.json({
      streamers,
    });
  });

export default api;
