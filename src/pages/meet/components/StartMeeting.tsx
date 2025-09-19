import React, { useState, useEffect, useRef } from 'react';
import { animatePlaceholder, generatePlaceholderWords } from './utils.ts';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import BookingModal from './BookingModal';

interface Props {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const StartMeeting: React.FC<Props> = ({ onSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholderWords = generatePlaceholderWords(10); // generate random room names

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleBookMeetingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setIsModalOpen(true);
  };

  return (
    <>
      <div>
        <PageHeader
          title='Secure and high quality meetings'
          className='text-left'
        >
            The only online meeting platform that adapts to your teaching style,
            not the other way around.
        </PageHeader>

        <form id='room-form' className='max-w-lg' onSubmit={onSubmit}>
          <div className='relative w-full'>
            <input
              ref={inputRef}
              id='room-input'
              type='text'
              placeholder='Enter meeting name'
              className='w-full bg-transparent border-0 border-b border-gray-300 py-3 pl-3 text-2xl sm:text-3xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary-500 transition-colors'
            />
          </div>

          <p className='mt-3 mb-8 text-sm text-gray-500'>
            Enter subject or Meeting ID to get started
          </p>

          <div className='flex max-[450px]:flex-col items-center gap-4'>
            <Button
              type='submit'
              variant='primary'
              className='w-full max-[445px]:w-full shadow-sm transition-transform hover:scale-105 will-change-transform'
            >
              Join meeting
            </Button>

            <Button
              onClick={handleBookMeetingClick}
              variant='secondary'
              className='w-full max-[445px]:w-full shadow-sm transition-transform hover:scale-105 will-change-transform'
            >
              Book meeting
            </Button>
          </div>
        </form>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default StartMeeting;
