import { UserManager } from 'oidc-client-ts';

export const oidcConfig = {
  authority: 'https://staj.sonacove.com/auth/realms/jitsi',
  client_id: 'jitsi-web',
  redirect_uri: window.location.origin + '/meet',
  post_logout_redirect_uri: window.location.origin + '/meet',
  response_type: 'code',
  scope: 'openid profile email',
};

export const userManager = new UserManager(oidcConfig);
