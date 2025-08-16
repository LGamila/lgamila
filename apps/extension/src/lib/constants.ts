export const APP_NAME = "LGamila Live";
export const APP_VERSION = "1.2.1";
export const APP_DESCRIPTION =
  "This extension shows you a real-time list of all Moroccan Twitch and Kick streamers who are currently live.";
export const APP_AUTHOR = "Stormix <hello@s.dev>";

export const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://lgamila-api.stormix.dev";

export const WS_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:3000/ws"
    : "wss://lgamila-api.stormix.dev/ws";
export const NOTIFICATION_DURATION = 5000;
