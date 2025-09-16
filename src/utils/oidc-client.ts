import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

export const oidcConfig = {
  authority: 'https://staj.sonacove.com/auth/realms/jitsi',
  client_id: 'jitsi-web',
  redirect_uri: window.location.origin + '/meet',
  post_logout_redirect_uri: window.location.origin + '/meet',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  silent_redirect_uri: window.location.origin + '/silent-renew',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  clockSkew: 300,
};

export const userManager = new UserManager(oidcConfig);
