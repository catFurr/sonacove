import { UserManager } from 'oidc-client-ts';
// @ts-expect-error
import { generateRoomWithoutSeparator } from '@jitsi/js-utils/random';

/**
 * OIDC configuration for the Jitsi web client.
 */
export const getOidcConfig = () => ({
  authority: 'https://staj.sonacove.com/auth/realms/jitsi',
  client_id: 'jitsi-web',
  redirect_uri: window.location.origin + '/meet',
  post_logout_redirect_uri: window.location.origin + '/meet',
  response_type: 'code',
  scope: 'openid profile email',
});

/**
 * UserManager instance for OIDC auth.
 */
export const getUserManager = () => new UserManager(getOidcConfig());

export function login() {
  getUserManager().signinRedirect();
}

export function signup() {
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
  getUserManager().signoutRedirect();
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
  words: string[], // pass array of words now
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

