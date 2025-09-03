import { Eye, EyeOff } from "lucide-react";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { FiTwitch } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";
import { RiKickLine } from "react-icons/ri";
import type { Streamer, Platform } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { platform } from "os";

const streamerDescription = (streamer: Streamer) => {
  if (streamer.category) {
    return `${streamer.category} with ${streamer.viewerCount} viewers`;
  }
  if (streamer.viewerCount) {
    return `${streamer.viewerCount} viewers`;
  }

  return "";
};

export function StreamerCard({
  streamer,
  isFavorite,
  isBlocked,
  onFavorite,
  onBlock,
}: {
  streamer: Streamer;
  isFavorite: boolean;
  isBlocked: boolean;
  onFavorite: (streamer: Streamer) => void;
  onBlock: (streamer: Streamer) => void;
}) {
  const StarIcon = isFavorite ? FaStar : FaRegStar;
  const BlockIcon = isBlocked ? EyeOff : Eye;

  const openStreamer = (selectedPlatform?: Platform) => {
    const twitchUrl = streamer.twitchUsername
      ? `https://www.twitch.tv/${streamer.twitchUsername}`
      : null;
    const kickUrl = streamer.kickUsername
      ? `https://kick.com/${streamer.kickUsername}`
      : null;

    if (!(twitchUrl || kickUrl)) {
      return;
    }

    if (streamer.isLive) {
      if (streamer.livePlatforms?.length > 1) {
        const url =
          selectedPlatform === "twitch"
            ? twitchUrl ?? kickUrl
            : selectedPlatform === "kick"
              ? kickUrl ?? twitchUrl
              : twitchUrl ?? kickUrl;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      } else {
        const active =
          streamer.livePlatforms?.[0] ?? streamer.livePlatform ?? null;
        const url =
          active === "twitch" ? twitchUrl ?? kickUrl : kickUrl ?? twitchUrl;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    } else {
      const url = twitchUrl ?? kickUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    }
  };
  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center transition-opacity duration-300",
        {
          "opacity-30": !streamer.isLive,
        }
      )}
    >
      <div className="flex flex-col gap-1 items-center">
        <Tooltip>
          <TooltipTrigger>
            <div
              className="px-2 cursor-pointer text-primary"
              onClick={() => onFavorite(streamer)}
            >
              <StarIcon size={16} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <div
              className="px-2 cursor-pointer text-muted-foreground hover:text-primary"
              onClick={() => onBlock(streamer)}
            >
              <BlockIcon size={16} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isBlocked ? "Show streamer" : "Hide streamer"}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-row gap-2 justify-start items-center flex-grow">
        <Tooltip>
          <TooltipTrigger>
            <div
              className="flex flex-row gap-2 justify-start items-center"
              onClick={() => openStreamer()}
            >
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
      <div className={cn("flex flex-row gap-1 items-center px-4 w-fit")}>
        {!streamer.livePlatforms && streamer.livePlatform && (
          <Button
            icon={
              streamer.livePlatform === "twitch" ? <FiTwitch /> : <RiKickLine />
            }
            onClick={() => openStreamer()}
            variant={streamer.isLive ? "outline" : "ghost"}
          >
            <span className="text-xs">{streamer.livePlatform}</span>
          </Button>
        )}
        {streamer.livePlatforms?.map((platform: Platform) => (
          <Button
            icon={platform === "twitch" ? <FiTwitch /> : <RiKickLine />}
            key={platform}
            onClick={() => openStreamer(platform)}
            variant={streamer.isLive ? "outline" : "ghost"}
          >
            {streamer.livePlatforms.length === 1 && (
              <span className="text-xs">{platform}</span>
            )}
          </Button>
        ))}
        {!streamer.isLive && (
          <Button onClick={() => openStreamer()} variant="ghost">
            <span className="text-xs">Offline</span>
          </Button>
        )}
      </div>
    </div>
  );
}
