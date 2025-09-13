import { userManager } from '../src/utils/oidc-client.ts';

userManager.signinSilentCallback().catch((err) => {
  console.error('Silent renew error:', err);
});
