// @ts-check

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import favicons from 'astro-favicons';
import {
  CHROME_EXTENSION_URL,
  FIREFOX_EXTENSION_URL,
} from './src/lib/constants';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), favicons()],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel(),
  redirects: {
    '/brave': {
      status: 308,
      destination: CHROME_EXTENSION_URL,
    },
    '/opera': {
      status: 308,
      destination: CHROME_EXTENSION_URL,
    },
    '/edge': {
      status: 308,
      destination: CHROME_EXTENSION_URL,
    },
    '/chrome': {
      status: 308,
      destination: CHROME_EXTENSION_URL,
    },
    '/firefox': {
      status: 308,
      destination: FIREFOX_EXTENSION_URL,
    },
  },
});
