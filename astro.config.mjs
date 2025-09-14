// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import vue from '@astrojs/vue';
import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue(), react()],
  output: 'static',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  experimental: {
    fonts: [
      {
        name: "Crimson Pro",
        cssVariable: "--font-crimson-pro",
        provider: fontProviders.google()
      },
      {
        name: "Lora",
        cssVariable: "--font-lora",
        provider: fontProviders.google()
      }
    ]
  },
  server: {
    allowedHosts: ["martina-unmounted-weakheartedly.ngrok-free.app"]
  }
});
