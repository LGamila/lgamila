export interface Streamer {
  /** Unique identifier for the streamer */
  id: string;

  /** Display name of the streamer */
  name: string;

  /** URL to the streamer's profile/avatar image */
  avatarUrl: string;

  /** Twitch username, if they stream on Twitch */
  twitchUsername: string;

  /** Kick username, if they stream on Kick */
  kickUsername: string | null;

  /** Whether the streamer is currently live */
  isLive: boolean;

  /** Platform the streamer is currently live on, if any */
  livePlatform: string | null;

  /** Current viewer count if live, 0 if offline */
  viewerCount: number;

  /** Current stream category/game if live */
  category: string | null;

  /** Current stream title if live */
  title: string | null;
}
