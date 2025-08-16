import logo from 'data-base64:~assets/logo.svg';
import { FiTwitch, FiX } from 'react-icons/fi';
import { RiKickLine } from 'react-icons/ri';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

interface NotificationCardProps {
  name: string;
  platform: string;
  avatar: string;
  link: string;
  onDismiss?: () => void;
}

export function NotificationCard({
  name,
  platform,
  avatar,
  link,
  onDismiss,
}: NotificationCardProps) {
  return (
    <div className="bg-background py-2 px-4 rounded-lg items-center justify-center shadow-lg w-[250px] gap-2 mx-auto flex flex-col text-foreground animate-in slide-in-from-right-full fade-in duration-500 ease-out relative">
      <div className="flex flex-row gap-2 justify-start items-start w-full py-1">
        <img alt="logo" className="size-4" src={logo} />
        <p className="text-muted-foreground text-xs">LGamila Live</p>
        {onDismiss && (
          <button
            aria-label="Dismiss notification"
            className="ml-auto p-1 rounded-sm opacity-70 hover:opacity-100 focus:opacity-100 transition-opacity"
            onClick={onDismiss}
            type="button"
          >
            <FiX className="size-3" />
          </button>
        )}
      </div>
      <div className="flex flex-row gap-4 items-center">
        <Avatar className="size-16">
          <AvatarImage src={avatar} />
        </Avatar>
        <div className="flex flex-col gap-0 flex-grow">
          <h3 className="font-medium">{name}</h3>
          <p className="text-muted-foreground">
            {name} is live on {platform}
          </p>
        </div>
        <Button
          icon={platform === 'twitch' ? <FiTwitch /> : <RiKickLine />}
          onClick={() => window.open(link, '_blank')}
          size="sm"
        >
          Watch Now
        </Button>
      </div>
    </div>
  );
}
