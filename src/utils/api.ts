import type { DbUser } from '../pages/meet/components/types';

const API_BASE_URL = 'api';


async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData: unknown = await response.json();
      if (
        typeof errorData === 'object' &&
        errorData !== null &&
        'error' in errorData &&
        typeof (errorData as { error: unknown }).error === 'string'
      ) {
        errorMessage += ` - ${(errorData as { error: string }).error}`;
      }
    } catch {
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}

/**
 * Fetches the database user information for the authenticated user.
 * @param {string} token The user's JWT access token.
 * @returns The user data from the database.
 */
export const fetchDbUser = async (token: string): Promise<DbUser> => {
  const response = await fetch(`${API_BASE_URL}/db-user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleApiResponse(response) as Promise<DbUser>;
};

/**
 * Books a new meeting.
 * @param {string} roomName  The name of the room to book.
 * @param {string} endDate The end date of the booking (or null for permanent).
 * @param {string} token The user's JWT access token.
 * @returns The result from the API.
 */
export const bookMeeting = async (
  roomName: string,
  endDate: Date | null,
  token: string,
) => {
  if (!roomName.trim()) {
    throw new Error('Room name is required.');
  }

  const response = await fetch(`${API_BASE_URL}/manage-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      roomName,
      password: '',
      lobby: false,
      maxOccupants: 100,
      endDate: endDate ? endDate.toISOString() : null, // Ensure date is in ISO format
    }),
  });
  return handleApiResponse(response);
};

/**
 * Deletes a booked meeting.
 * @param {string} roomName The name of the room to delete.
 * @param {string} token The user's JWT access token.
 * @returns A success indicator from the API.
 */
export const deleteBooking = async (roomName: string, token: string) => {
  if (!roomName.trim()) {
    throw new Error('A valid room name is required.');
  }

  const response = await fetch(`${API_BASE_URL}/manage-booking`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      roomName: roomName.trim(),
    }),
  });
  return handleApiResponse(response);
};
