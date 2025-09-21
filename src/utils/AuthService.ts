import { User } from 'oidc-client-ts';
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


type AuthState = {
  user: User | null;
  isLoggedIn: boolean;
};

type AuthStateListener = (state: AuthState) => void;

class authService {
  private userManager = getUserManager();
  private state: AuthState = { user: null, isLoggedIn: false };
  private listeners: Set<AuthStateListener> = new Set();

  constructor() {
    // The constructor should only kick off the process.
    // getUserManager() will be null on the server, so we must guard it.
    if (this.userManager) {
      this.initialize();
    }
  }

  /**
   * Initializes the service, loads the user, and sets up event listeners.
   */
  private async initialize(): Promise<void> {
    // Load the user from storage on startup
    const user = await this.userManager.getUser();
    this.updateState(user);

    // Register events from the oidc-client library
    this.userManager.events.addUserLoaded((user) => {
      console.log('AuthService: User loaded');
      this.updateState(user);
    });

    this.userManager.events.addUserUnloaded(() => {
      console.log('AuthService: User unloaded');
      this.updateState(null);
    });

    this.userManager.events.addSilentRenewError((error) => {
      console.error('AuthService: Silent renew error', error);
      this.updateState(null);
    });
  }

  /**
   * A private helper to update the internal state and notify subscribers.
   */
  private updateState(user: User | null): void {
    this.state = {
      user: user,
      isLoggedIn: !!user && !user.expired,
    };
    // Notify all listeners of the state change
    this.listeners.forEach((listener) => listener(this.state));
  }

  // --- Public API ---

  /**
   * Subscribes to authentication state changes.
   * @param listener The callback function to execute on change.
   * @returns An unsubscribe function.
   */
  public subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    // Immediately notify the new listener with the current state
    listener(this.state);
    // Return a function to allow unsubscribing
    return () => this.listeners.delete(listener);
  }

  /**
   * Kicks off the login process by redirecting to the login page.
   */
  public login(): Promise<void> {
    return this.userManager.signinRedirect();
  }

  /**
   * Redirects the user to the Keycloak registration page.
   */
  public signup(): void {
    const settings = this.userManager.settings;
    const registrationUrl =
      `${settings.authority}/protocol/openid-connect/registrations` +
      `?client_id=${settings.client_id}` +
      `&response_type=${settings.response_type}` +
      `&scope=${encodeURIComponent(settings.scope ?? '')}` +
      `&redirect_uri=${encodeURIComponent(settings.redirect_uri)}`;

    window.location.href = registrationUrl;
  }

  /**
   * Handles the authentication callback after the user is redirected back from the login page.
   * @returns The user object.
   */
  public handleLoginCallback(): Promise<User | null> {
    return this.userManager.signinRedirectCallback();
  }

  /**
   * Kicks off the logout process.
   */
  public logout(): Promise<void> {
    return this.userManager.signoutRedirect();
  }

  /**
   * Gets the current user object.
   */
  public getUser(): User | null {
    return this.state.user;
  }

  /**
   * Gets the user's access token for API calls.
   * @returns The access token or null if not logged in.
   */
  public getAccessToken(): string | null {
    return this.state.user?.access_token ?? null;
  }

  /**
   * A simple boolean to check if the user is currently logged in.
   */
  public isLoggedIn(): boolean {
    return this.state.isLoggedIn;
  }
}

// --- Singleton Getter ---
let authServiceInstance: authService | null = null;

/**
 * A singleton getter for the AuthService.
 * Ensures the service is only instantiated on the client.
 */
export function getAuthService(): authService {
  // On the server, return a mock object.
  if (typeof window === 'undefined') {
    return null as any;
  }

  if (!authServiceInstance) {
    authServiceInstance = new authService();
  }

  return authServiceInstance;
}
