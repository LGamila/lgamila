export const API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://lgamila-api.stormix.dev';

export const CHROME_EXTENSION_URL =
  'https://chromewebstore.google.com/detail/amhjldbacojfmlcbhjlpnnnjokcfakjp/';

export const FIREFOX_EXTENSION_URL =
  'https://addons.mozilla.org/en-US/firefox/addon/lgamila-live/';
