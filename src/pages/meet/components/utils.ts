import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
// @ts-expect-error
import { generateRoomWithoutSeparator } from '@jitsi/js-utils/random';

let userManager: UserManager | null = null;

export function getUserManager() {
  if (!userManager) {
    if (typeof window === 'undefined') {
      throw new Error('UserManager requested on the server side');
    }

    const config = {
      authority: 'https://staj.sonacove.com/auth/realms/jitsi',
      client_id: 'jitsi-web',
      redirect_uri: window.location.origin + '/meet',
      post_logout_redirect_uri: window.location.origin + '/meet',
      response_type: 'code',
      scope: 'openid profile email',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      silent_redirect_uri: window.location.origin + '/silent-renew.html',
      query_status: true,
    };

    userManager = new UserManager(config);

    // attach events
    userManager.events.addUserLoaded(() => console.log('User loaded'));
    userManager.events.addUserUnloaded(() =>
      console.log('User unloaded / session ended'),
    );
    userManager.events.addAccessTokenExpired(() =>
      console.log('Token expired, silent renew will start.'),
    );
    userManager.events.addSilentRenewError((err) =>
      console.error('Silent renew error', err),
    );
    userManager.events.addAccessTokenExpiring(() =>
      console.log('Access token is expiring…'),
    );
    userManager.events.addUserLoaded(() =>
      console.log('Silent renew success, new user loaded'),
    );
  }
  return userManager;
}

// --- AUTH FUNCTIONS ---
export function login() {
  return getUserManager().signinRedirect();
}

export function signup() {
  if (typeof window === 'undefined') return;
  const registrationUrl =
    'https://staj.sonacove.com/auth/realms/jitsi/protocol/openid-connect/registrations' +
    '?client_id=jitsi-web' +
    '&response_type=code' +
    '&scope=openid%20profile%20email' +
    '&redirect_uri=' +
    encodeURIComponent(window.location.origin + '/meet');

  window.location.href = registrationUrl;
}

export function logout() {
  return getUserManager().signoutRedirect();
}

/**
 * Generates an array of random room names.
 */
export function generatePlaceholderWords(count: number = 10): string[] {
  return Array.from({ length: count }, () => generateRoomWithoutSeparator());
}

/**
 * Animates typing and erasing of multiple placeholder words in an input.
 */
export function animatePlaceholder(
  input: HTMLInputElement,
  words: string[],
  typingSpeed: number = 100,
  erasingSpeed: number = 50,
  pauseDuration: number = 1500,
  onChange?: (currentWord: string) => void,
) {
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeoutId: NodeJS.Timeout;

  const loop = () => {
    const currentWord = words[wordIndex];

    if (!isDeleting) {
      // Typing
      charIndex++;
      input.placeholder = currentWord.slice(0, charIndex);

      if (charIndex === currentWord.length) {
        // Finished typing, pause before deleting
        if (onChange) onChange(currentWord);
        timeoutId = setTimeout(() => {
          isDeleting = true;
          loop();
        }, pauseDuration);
      } else {
        timeoutId = setTimeout(loop, typingSpeed);
      }
    } else {
      // Deleting
      charIndex--;
      input.placeholder = currentWord.slice(0, charIndex);

      if (charIndex === 0) {
        // Move to next random word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        timeoutId = setTimeout(loop, typingSpeed);
      } else {
        timeoutId = setTimeout(loop, erasingSpeed);
      }
    }
  };

  loop();

  return () => clearTimeout(timeoutId);
}
