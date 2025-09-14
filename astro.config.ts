import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";

import customSchema from './astro-env-schema';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue()],
  output: "server",

  env: {
    schema: customSchema,
    validateSecrets: true,
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },


  adapter: cloudflare({
    imageService: 'compile'
  }),
  vite: {
    build: {
      minify: false, // Let cloudflare handle this.
    },
    ssr: {
      external: [
        "node:buffer",
        "node:stream",
        "node:events",
      ],
    },
  },
});
