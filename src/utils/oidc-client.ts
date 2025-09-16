import {
  UserManager,
  WebStorageStateStore,
  type UserManagerSettings,
} from 'oidc-client-ts';

let userManager: UserManager | null = null;

/**
 * A singleton getter for the UserManager.
 * This function ensures that UserManager and its settings are only created on the client-side.
 */
export function getUserManager(): UserManager {
  // If we are on the server, return a mock object to prevent crashes.
  if (typeof window === 'undefined') {
    return null as any;
  }

  // If the instance already exists, return it.
  if (userManager) {
    return userManager;
  }

  // We are in the browser and the instance hasn't been created yet.
  // Define the settings object here, where `window` is available.
  const settings: UserManagerSettings = {
    authority: 'https://staj.sonacove.com/auth/realms/jitsi',
    client_id: 'jitsi-web',
    redirect_uri: window.location.origin + '/meet',
    post_logout_redirect_uri: window.location.origin + '/meet',
    silent_redirect_uri: window.location.origin + '/silent-renew',
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  };

  // Create the instance.
  userManager = new UserManager(settings);

  return userManager;
}
