import { getGravatarUrl } from './gravatar';
import { oidcConfig } from './oidc-client';
import { UserManager, User } from 'oidc-client-ts';

/**
 * Capitalize the first letter of a word.
 */
function capitalize(word: string): string {
  return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '';
}

/**
 * Show elements by removing a CSS class.
 */
function showElements(
  elements: NodeListOf<HTMLElement>,
  className = 'hidden',
): void {
  elements.forEach((el) => el.classList.remove(className));
}

/**
 * Hide elements by adding a CSS class.
 */
function hideElements(
  elements: NodeListOf<HTMLElement>,
  className = 'hidden',
): void {
  elements.forEach((el) => el.classList.add(className));
}

/**
 * Updates UI visibility and content depending on login state.
 */
export async function updateLoginUI(): Promise<void> {
  const userManager = new UserManager(oidcConfig);

  // Handle OIDC callback if present in URL
  const url = new URL(window.location.href);
  if (url.searchParams.has('code') && url.searchParams.has('state')) {
    try {
      await userManager.signinRedirectCallback();
      window.history.replaceState({}, document.title, url.pathname);
    } catch (err) {
      console.error('OIDC callback error:', err);
    }
  }

  const user: User | null = await userManager.getUser();

  const loggedInEls = document.querySelectorAll<HTMLElement>('.logged-in-ui');
  const loggedOutEls = document.querySelectorAll<HTMLElement>('.logged-out-ui');

  if (!user) {
    // Not logged in
    showElements(loggedOutEls);
    hideElements(loggedInEls);
    return;
  }

  // Logged in
  hideElements(loggedOutEls);
  showElements(loggedInEls);

  const { name, email, context } = user.profile ?? {};
  const usernameEl = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  const userPlan = document.getElementById('user-plan');
  const avatarEls = document.querySelectorAll<HTMLImageElement>('.user-avatar');
  const avatarUrl = user.profile.picture || getGravatarUrl(email || '', 200);

  if (usernameEl) usernameEl.textContent = name ?? 'User';
  if (userEmail) userEmail.textContent = email ?? '';
  if (userPlan) {
    const plan = context?.user?.subscription_status ?? 'free';
    userPlan.textContent = capitalize(plan);
  }

  if (avatarEls) {
    avatarEls.forEach((img) => {
      img.src = avatarUrl;
      img.alt = name || 'User';
    });
  }
}
