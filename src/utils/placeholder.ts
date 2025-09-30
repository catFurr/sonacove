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
