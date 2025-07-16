
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
1. Add them to [example.env](example.env)
2. For public values add to [wrangler.jsonc](wrangler.jsonc)
3. For secrets, update in [Github Environments](https://github.com/catFurr/sonacove/settings/environments).

Make sure to update for both preview and production.
