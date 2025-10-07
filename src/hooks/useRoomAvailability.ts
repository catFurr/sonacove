import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useDebounce } from './useDebounce';
import { checkRoomAvailability } from '../utils/api';

/**
 * Represents the state of the room availability check.
 */
interface RoomAvailabilityState {
  /** Indicates if the availability check is currently in progress. */
  isChecking: boolean;
  /** `true` if the room is available, `false` if booked, or `null` if not yet checked. */
  isAvailable: boolean | null;
  /** An error message if the check failed, otherwise `null`. */
  error: string | null;
}

/**
 * A custom hook that checks if a meeting room name is available.
 * It automatically debounces the input to prevent excessive API calls
 * and manages the loading, success, and error states of the check.
 *
 * @param {string} roomName - The room name to check for availability.
 * @param {boolean} isInvalid - A flag to indicate if the room name has invalid characters, preventing the check.
 * @returns {RoomAvailabilityState} An object containing the current state of the availability check.
 */
export const useRoomAvailability = (
  roomName: string,
  isInvalid: boolean,
): RoomAvailabilityState => {
  const { getAccessToken, isLoggedIn } = useAuth();

  /** State to hold the complete availability status. */
  const [availability, setAvailability] = useState<RoomAvailabilityState>({
    isChecking: false,
    isAvailable: null,
    error: null,
  });

  const debouncedRoomName = useDebounce(roomName, 500);

  useEffect(() => {
    const shouldCheck =
      isLoggedIn && debouncedRoomName.trim() && !isInvalid;

    if (!shouldCheck) {
      setAvailability({ isChecking: false, isAvailable: null, error: null });
      return;
    }

    const check = async () => {
      const token = getAccessToken();
      if (!token) return;

      setAvailability({ isChecking: true, isAvailable: null, error: null });
      try {
        const result = await checkRoomAvailability(debouncedRoomName, token);
        setAvailability({
          isChecking: false,
          isAvailable: result.available,
          error: null,
        });
      } catch (err) {
        setAvailability({
          isChecking: false,
          isAvailable: null,
          error:
            err instanceof Error
              ? err.message
              : 'Could not check availability.',
        });
      }
    };

    check();
  }, [debouncedRoomName, isInvalid, isLoggedIn]);

  return availability;
};
