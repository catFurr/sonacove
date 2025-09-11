# Quick Guide

Dependencies:
- [Git](https://git-scm.com/downloads)
- [Bun](https://bun.sh/)

```bash
git clone https://github.com/catFurr/sonacove.git
cd sonacove

# Copy example.env to .env and
# Update with correct values

bun install
bun run dev
```

# Adding Env Variables
1. Add them to [astro env schema](./astro-env-schema.ts)
2. Update [.env](./.env) file
3. Build Astro types: `bun run build` (automatic if dev server is running)
4. Use them in source code like:
```ts
import { GRAFANA_API_KEY } from "astro:env/server"; // only on server side
import { PUBLIC_CF_ENV } from "astro:env/client"; // both client or server side
```
5. Update [example.env](./example.env) file
6. update in [Github Environments](https://github.com/catFurr/sonacove/settings/environments).

Make sure to update for both preview and production. Prefix PUBLIC_* for client side values.
