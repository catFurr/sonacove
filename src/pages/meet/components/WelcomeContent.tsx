import React, { useEffect, useRef } from 'react';
import { animatePlaceholder, generatePlaceholderWords } from './utils';
import Button from '../../../components/Button';

interface Props {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const WelcomeContent: React.FC<Props> = ({ onSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholderWords = generatePlaceholderWords(10); // generate random room names

  useEffect(() => {
    if (!inputRef.current) return;

    const cleanup = animatePlaceholder(
      inputRef.current,
      placeholderWords, // array of words to animate
      100, // typing speed
      50, // erasing speed
      1500, // pause after typing
    );

    return cleanup;
  }, []);

  return (
    <div>
      <h1 className='text-4xl sm:text-5xl lg:text-6xl font-semibold text-black mb-6 leading-tight'>
        Secure and high quality meetings
      </h1>
      <p className='text-lg sm:text-xl text-gray-600 mb-12 lg:mb-20'>
        The only online meeting platform that adapts to your teaching style, not
        the other way around.
      </p>

      <form id='room-form' className='max-w-lg' onSubmit={onSubmit}>
        <div className='relative w-full'>
          <input
            ref={inputRef}
            id='room-input'
            type='text'
            placeholder='Enter meeting name'
            className='w-full bg-transparent border-0 border-b border-gray-300 py-3 pl-3 text-2xl sm:text-3xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500 transition-colors'
          />
        </div>

        <p className='mt-3 mb-8 text-sm text-gray-500'>
          Enter subject or Meeting ID to get started
        </p>

        <div className='flex max-[450px]:flex-col items-center gap-4'>
          <Button
            type='submit'
            variant='primary'
            className='w-full max-[445px]:w-full shadow-sm transition-transform hover:scale-105'
          >
            Join meeting
          </Button>

          <Button
            type='button'
            variant='secondary'
            className='w-full max-[445px]:w-full shadow-sm transition-transform hover:scale-105'
          >
            Book meeting
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WelcomeContent;
