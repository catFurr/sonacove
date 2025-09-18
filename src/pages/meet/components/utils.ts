// @ts-expect-error
import { generateRoomWithoutSeparator } from '@jitsi/js-utils/random';

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

export const bookMeeting = async (
  roomName: string,
  endDate: any,
  token: string,
) => {
  if (!token) {
    console.error('Access token missing. Cannot book meeting.');
    throw new Error('Access token missing');
  }

  if (!roomName || !endDate) {
    console.error('Room name or end date is missing.');
    throw new Error('Room name or end date is missing.');
  }

  try {
    const response = await fetch('/api/manage-booking', {
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
        endDate,
      }),
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;

      try {
        const errorData: unknown = await response.json();

        // --- THIS IS THE TYPE GUARD ---
        // 1. Check if it's an object
        // 2. Check if it has a 'message' property
        // 3. Check if that property is a string
        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          'message' in errorData &&
          typeof (errorData as { message: unknown }).message === 'string'
        ) {
          errorMessage += ` - ${(errorData as { message: string }).message}`;
        }
      } catch {
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Meeting booked successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to book meeting:', error);
    throw error;
  }
};

export const deleteBooking = async (roomName: string, token: string) => {
  // 1. Validate the inputs to prevent unnecessary API calls
  if (!token?.trim()) {
    console.error('Access token missing. Cannot delete booking.');
    throw new Error('Access token is required.');
  }

  if (!roomName?.trim()) {
    console.error('Room name missing. Cannot delete booking.');
    throw new Error('A valid room name is required.');
  }

  try {
    const response = await fetch('/api/manage-booking', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roomName: roomName.trim(),
      }),
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;

      try {
        const errorData: unknown = await response.json();

        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          'message' in errorData &&
          typeof (errorData as { message: unknown }).message === 'string'
        ) {
          errorMessage += ` - ${(errorData as { message: string }).message}`;
        }
      } catch {
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      console.log('Booking deleted successfully (No Content).');
      return { success: true }; // Return a success indicator
    }

    const result = await response.json();
    console.log('Booking deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to delete booking:', error);
    throw error;
  }
};