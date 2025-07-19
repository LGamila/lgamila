import type { SandboxedJob } from 'bullmq';
import { eq } from 'drizzle-orm';
import cache from '@/lib/cache/default';
import { db } from '@/lib/db';
import { streamer } from '@/lib/db/schema';
import type { Streamer } from '@/lib/db/types';
import { logger } from '@/lib/logger';
import { KickService } from '@/lib/services/kick';
import { TwitchService } from '@/lib/services/twitch';
import type { StreamCheckJob } from '@/types/queues';
import { StreamPlatform } from '@/types/server';

interface StreamStatus {
  isLive: boolean;
  platform: StreamPlatform | null;
  viewerCount: number;
  category: string | null;
  title: string | null;
}

export default async function (job: SandboxedJob<StreamCheckJob>) {
  try {
    const streamerId = job.data.streamerId;
    const streamerDB = await db.query.streamer.findFirst({
      where: eq(streamer.id, streamerId),
    });

    if (!streamerDB) {
      logger
        .withMetadata({
          jobId: job.id,
        })
        .error('Streamer not found');
      return;
    }

    logger
      .withMetadata({
        jobId: job.id,
      })
      .info(`Checking if ${streamerDB.name} is live`);

    // Check both platforms and determine overall status
    const streamStatus = await checkStreamStatus(streamerDB, job.id);

    // Only update if status has changed
    const hasStatusChanged = hasStreamStatusChanged(streamerDB, streamStatus);

    if (hasStatusChanged) {
      // Clear the streamers cache
      logger.info('Clearing streamers cache');
      await cache.del('streamers');

      // Update the streamer status
      await updateStreamerStatus(streamerId, streamStatus);

      logger
        .withMetadata({
          jobId: job.id,
        })
        .info(
          `Updated ${streamerDB.name} live status: ${streamStatus.isLive} on ${streamStatus.platform}`
        );
    }
  } catch (error) {
    logger
      .withError(error)
      .withMetadata({
        jobId: job.id,
      })
      .error('Failed to check if streamer is live');
    throw error;
  }
}

function hasStreamStatusChanged(
  streamerDB: Streamer,
  streamStatus: StreamStatus
): boolean {
  return (
    streamStatus.isLive !== (streamerDB.isLive ?? false) ||
    streamStatus.platform !== streamerDB.livePlatform ||
    streamStatus.category !== streamerDB.category ||
    streamStatus.viewerCount !== streamerDB.viewerCount ||
    streamStatus.title !== streamerDB.title
  );
}

async function updateStreamerStatus(
  streamerId: string,
  streamStatus: StreamStatus
): Promise<void> {
  await db
    .update(streamer)
    .set({
      isLive: streamStatus.isLive,
      livePlatform: streamStatus.platform,
      viewerCount: streamStatus.viewerCount,
      category: streamStatus.category,
      title: streamStatus.title,
    })
    .where(eq(streamer.id, streamerId));
}

async function checkStreamStatus(
  streamerDB: Streamer,
  jobId: string | undefined
): Promise<StreamStatus> {
  const twitchStatus = await checkTwitchStatus(streamerDB, jobId);
  const kickStatus = await checkKickStatus(streamerDB, jobId);

  // Determine overall status - prioritize the platform they're currently live on
  // If live on multiple platforms, prioritize Twitch (can be changed based on business logic)
  if (twitchStatus?.isLive) {
    return twitchStatus;
  }

  if (kickStatus?.isLive) {
    return kickStatus;
  }

  // If not live on any platform, return offline status
  return {
    isLive: false,
    platform: null,
    viewerCount: 0,
    category: null,
    title: null,
  };
}

async function checkTwitchStatus(
  streamerDB: Streamer,
  jobId: string | undefined
): Promise<StreamStatus | null> {
  if (!streamerDB.twitchUsername) {
    return null;
  }

  const result = await TwitchService.instance.isStreamerLive(
    streamerDB.twitchUsername
  );

  if (result.isErr()) {
    logger
      .withError(result.error)
      .withMetadata({ jobId })
      .error('Failed to check if streamer is live on Twitch');
    return null;
  }

  const { isLive, stream } = result.value;
  return {
    isLive,
    platform: isLive ? StreamPlatform.Twitch : null,
    viewerCount: stream?.viewerCount ?? 0,
    category: stream?.game ?? null,
    title: stream?.title ?? null,
  };
}

async function checkKickStatus(
  streamerDB: Streamer,
  jobId: string | undefined
): Promise<StreamStatus | null> {
  if (!streamerDB.kickUsername) {
    return null;
  }

  const result = await KickService.instance.isStreamerLive(
    streamerDB.kickUsername
  );

  if (result.isErr()) {
    logger
      .withError(result.error)
      .withMetadata({ jobId })
      .error('Failed to check if streamer is live on Kick');
    return null;
  }

  const { isLive, stream } = result.value;
  return {
    isLive: isLive ?? false,
    platform: isLive ? StreamPlatform.Kick : null,
    viewerCount: stream?.viewerCount ?? 0,
    category: stream?.game ?? null,
    title: stream?.title ?? null,
  };
}
