import { useState, useEffect } from "react";

/**
 * A custom hook that delays updating a value until a specified delay has passed
 * Useful for search inputs to prevent excessive API calls
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {any} - The debounced value
 */
interface UseDebounceProps<T> {
  value: T;
  delay: number;
}

export function useDebounce<T>({ value, delay }: UseDebounceProps<T>): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timeout if the value changes before the delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
