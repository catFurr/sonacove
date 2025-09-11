
# Quick Guide
```bash
touch .dev.vars
# Replace with correct values
cp .dev.vars .env

npm i
npm run dev
```

# Adding Env Variables
1. Add them to [astro env schema](./astro-env-schema.ts)
2. update in [Github Environments](https://github.com/catFurr/sonacove/settings/environments).
3. Update [.dev.vars](./.dev.vars) file locally
4. Copy .dev.vars file to [.env](./.env)
4. Build Astro types: `bun run build`
5. Update Cloudflare types: `bun run gen:types`
6. Use them in source code like:
```ts
import { GRAFANA_API_KEY } from "astro:env/server"; // only on server side
import { PUBLIC_CF_ENV } from "astro:env/client"; // both client or server side
```

Make sure to update for both preview and production. Prefix PUBLIC_* for client side values.
