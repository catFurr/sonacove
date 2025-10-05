import { useEffect, useState } from 'react';

/**
 * A custom hook that delays updating a value until a specified amount of time
 * has passed without that value changing. This is useful for preventing
 * expensive operations (like API calls) from running on every keystroke.
 *
 * @template T - The type of the value to be debounced.
 * @param {T} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {T} The debounced value, which updates only after the delay has passed.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
