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

export function setupAuthButtons() {
  // Login button
  document.getElementById('login-btn')?.addEventListener('click', () => {
    userManager.signinRedirect();
  });

  // Sign up button
  document.getElementById('signup-btn')?.addEventListener('click', () => {
    const registrationUrl =
      'https://staj.sonacove.com/auth/realms/jitsi/protocol/openid-connect/registrations' +
      '?client_id=jitsi-web' +
      '&response_type=code' +
      '&scope=openid%20profile%20email' +
      '&redirect_uri=' +
      encodeURIComponent(window.location.origin + '/meet');

    window.location.href = registrationUrl;
  });

  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    userManager.signoutRedirect();
  });
}
