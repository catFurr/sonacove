import { useState, useEffect } from 'react';
import { getAuthService } from '../utils/AuthService';

const authService = getAuthService();

export function useAuth() {
  const [authState, setAuthState] = useState(
    () => authService?.isLoggedIn() ?? false,
  );

  useEffect(() => {
    if (!authService) return;

    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state.isLoggedIn);
    });

    return unsubscribe;
  }, []);

  return {
    isLoggedIn: authState,
    user: authService?.getUser() ?? null,
    login: () => authService?.login(),
    logout: () => authService?.logout(),
    getAccessToken: () => authService?.getAccessToken() ?? null,
  };
}
