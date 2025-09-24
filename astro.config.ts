import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react"
import vue from "@astrojs/vue";

import customSchema from './astro-env-schema';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue(), react()],
  output: 'static',

  env: {
    schema: customSchema,
    validateSecrets: true,
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  experimental: {
    fonts: [
      {
        name: 'Crimson Pro',
        cssVariable: '--font-crimson-pro',
        provider: fontProviders.google(),
      },
      {
        name: 'Lora',
        cssVariable: '--font-lora',
        provider: fontProviders.google(),
      },
    ],
  },

  security: {
    checkOrigin: false,
  },

  adapter: cloudflare({
    imageService: 'compile',
  }),
  vite: {
    build: {
      minify: false, // Let cloudflare handle this.
    },
    ssr: {
      external: ['node:buffer', 'node:stream', 'node:events'],
    },
  },
});
