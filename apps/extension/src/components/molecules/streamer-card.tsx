import { FaRegStar, FaStar } from 'react-icons/fa6';
import { FiTwitch } from 'react-icons/fi';
import { GoDotFill } from 'react-icons/go';
import { RiKickLine } from 'react-icons/ri';
import type { Streamer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const streamerDescription = (streamer: Streamer) => {
  if (streamer.category) {
    return `${streamer.category} with ${streamer.viewerCount} viewers`;
  }
  if (streamer.viewerCount) {
    return `${streamer.viewerCount} viewers`;
  }

  return '';
};

export function StreamerCard({
  streamer,
  isFavorite,
  onFavorite,
}: {
  streamer: Streamer;
  isFavorite: boolean;
  onFavorite: (streamer: Streamer) => void;
}) {
  const StarIcon = isFavorite ? FaStar : FaRegStar;
  return (
    <div
      className={cn(
        'flex flex-row gap-2 items-center transition-opacity duration-300',
        {
          'opacity-30': !streamer.isLive,
        }
      )}
    >
      <div className="flex flex-row gap-2 items-center">
        <div
          className="px-2 cursor-pointer text-primary"
          onClick={() => onFavorite(streamer)}
        >
          <StarIcon size={16} />
        </div>
      </div>

      <div className="flex flex-row gap-2 justify-start items-center flex-grow">
        <Tooltip>
          <TooltipTrigger>
            <div className="flex flex-row gap-2 justify-start items-center">
              <Avatar>
                <AvatarImage src={streamer.avatarUrl} />
                <AvatarFallback>{streamer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="text-sm font-medium flex flex-row items-center gap-1">
                  {streamer.name}
                  {streamer.isLive && (
                    <div className="flex overflow-hidden">
                      <GoDotFill className="animate-pulse text-destructive h-5 w-5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-start">
                  {streamerDescription(streamer)}
                </p>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>{streamer.title ?? streamer.name}</TooltipContent>
        </Tooltip>
      </div>
      <div className={cn('flex flex-row gap-1 items-center px-4 w-fit')}>
        <Button
          disabled={!streamer.isLive}
          icon={
            streamer.isLive ? (
              streamer.livePlatform === 'twitch' ? (
                <FiTwitch />
              ) : (
                <RiKickLine />
              )
            ) : null
          }
          onClick={() => {
            if (streamer.isLive) {
              window.open(
                streamer.livePlatform === 'twitch'
                  ? `https://www.twitch.tv/${streamer.twitchUsername}`
                  : `https://kick.com/${streamer.kickUsername}`,
                '_blank'
              );
            }
          }}
          variant={streamer.isLive ? 'outline' : 'ghost'}
        >
          <span className="text-xs">
            {streamer.isLive ? 'Live' : 'Offline'}
          </span>
        </Button>
      </div>
    </div>
  );
}
