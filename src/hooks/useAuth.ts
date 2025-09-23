import { useState, useEffect, useCallback } from 'react';
import { getAuthService } from '../utils/AuthService';
import { format } from 'date-fns';
import type { DbUser } from '../pages/meet/components/types';
import type { User as OidcUser } from 'oidc-client-ts';
import { fetchDbUser } from '../utils/api';

export interface Meeting {
  title: string;
  date: string;
  time: string;
  status: string;
}

const authService = getAuthService();

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => authService?.isLoggedIn() ?? false,
  );
  const [oidcUser, setOidcUser] = useState<OidcUser | null>(
    () => authService?.getUser() ?? null,
  );
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Effect to keep the hook's state in sync with the AuthService
  useEffect(() => {
    if (!authService) return;
    const unsubscribe = authService.subscribe((state) => {
      setIsLoggedIn(state.isLoggedIn);
      setOidcUser(state.user);
    });
    return unsubscribe;
  }, []);

  const refetchMeetings = useCallback(async () => {
    const token = authService?.getAccessToken();
    if (!token) {
      console.error('Refetch failed: No user is logged in.');
      return;
    }

    console.log('Refetching meetings data...');
    try {
      const data = await fetchDbUser(token);
      setDbUser(data);
    } catch (error) {
      console.error('Failed to refetch user from DB:', error);
      setDbUser(null); // Clear data on a failed refetch
    }
  }, []);

  useEffect(() => {
    const getUserData = async (token: string) => {
      try {
        const data = await fetchDbUser(token);
        setDbUser(data);
      } catch (error) {
        console.error('Failed to fetch user from DB:', error);
        setDbUser(null);
      }
    };

    if (isLoggedIn && oidcUser?.access_token) {
      getUserData(oidcUser.access_token);
    } else {
      setDbUser(null);
    }
  }, [oidcUser?.profile.sub]);

  useEffect(() => {
    if (dbUser && dbUser.bookedRooms) {
      const currentDate = new Date();

      const transformedMeetings = dbUser.bookedRooms.map((room) => {
        const endDate = new Date(room.endDate);
        const createdAt = new Date(room.createdAt);

        return {
          title: room.roomName,
          date: format(endDate, 'MMMM dd, yyyy'), // Format the end date for display
          time: format(createdAt, 'p'), // Format the creation time for display (e.g., 8:34 PM)
          status: endDate > currentDate ? 'Upcoming' : 'Expired', // Determine status based on end date
        };
      });

      setMeetings(transformedMeetings);
    } else {
      setMeetings([]);
    }
  }, [dbUser]);

  return {
    isLoggedIn,
    dbUser,
    user: oidcUser,
    meetings,
    refetchMeetings,
    login: () => authService?.login(),
    logout: () => authService?.logout(),
    getAccessToken: () => authService?.getAccessToken() ?? null,
  };
}
