
# Quick Guide
```bash
cp example.env .dev.vars
# Replace with correct values

npm i

# For frontend
npm run dev

# For functions
npm run dev:wrangler
```

# Adding Env Variables
1. Add them to [astro env schema](./astro-env-schema.ts)
2. For public values add to [wrangler.jsonc](wrangler.jsonc)
3. For secrets, update in [Github Environments](https://github.com/catFurr/sonacove/settings/environments).
4. Update [.dev.vars](./.dev.vars) file locally with *secrets*
5. Build Astro types: `bun run build`
6. Update Cloudflare types: `bun run gen:types`
7. Use them in source code like:
```ts
import { GRAFANA_API_KEY } from "astro:env/server"; // only on server side
import { PUBLIC_CF_ENV } from "astro:env/client"; // both client or server side
```

Make sure to update for both preview and production. Prefix PUBLIC_* for client side values.
