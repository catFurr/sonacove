import React, { useState, useEffect, useRef } from 'react';
import { animatePlaceholder, generatePlaceholderWords } from './utils.ts';
import { Lock } from 'lucide-react';
import { getAuthService } from '../../../utils/AuthService';

import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import BookingModal from './BookingModal';

interface Props {
  isLoggedIn: boolean;
}

const StartMeeting: React.FC<Props> = ({ isLoggedIn }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [placeholder, setPlaceholder] = useState('');

  const placeholderWords = generatePlaceholderWords(10); // generate random room names


  useEffect(() => {
    setPlaceholder(placeholderWords[0]);
    if (!inputRef.current) return;

    const cleanup = animatePlaceholder(
      inputRef.current,
      placeholderWords, // array of words to animate
      100, // typing speed
      50, // erasing speed
      1500, // pause after typing
      setPlaceholder
    );

    return cleanup;
  }, []);

  const handleBookMeetingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isLoggedIn) {
      setIsModalOpen(true);
    } else {
      const authService = getAuthService();
      if (authService) {
        authService.login();
      } else {
        alert(
          'Authentication service is currently unavailable. Please try again later.',
        );
      }
    }
  };

  const finalRoomName = roomName.trim() || placeholder;

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

        <form id='room-form' className='max-w-lg'>
          <div className='relative w-full'>
            <input
              ref={inputRef}
              id='room-input'
              type='text'
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder='Enter meeting name'
              className='w-full bg-transparent border-0 border-b border-gray-300 py-3 pl-3 text-2xl sm:text-3xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary-500 transition-colors'
            />
          </div>

          <p className='mt-3 mb-8 text-sm text-gray-500'>
            Enter subject or Meeting ID to get started
          </p>

          <div className='flex max-[450px]:flex-col items-center gap-4'>
            <a href={`/meet/${finalRoomName}`} className='w-full'>
              <Button
                type='button'
                variant='primary'
                className='w-full max-[445px]:w-full shadow-sm transition-transform hover:scale-105 will-change-transform'
              >
                Join meeting
              </Button>
            </a>

            <Button
              onClick={handleBookMeetingClick}
              variant='secondary'
              className='w-full max-[445px]:w-full shadow-sm transition-transform hover:scale-105 will-change-transform'
            >
              Book meeting
            </Button>
          </div>

          {!isLoggedIn && (
            <div className='mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 p-2 rounded-lg'>
              <Lock size={14} className='text-gray-500 text-bold' />
              <span>Login required to book a meeting.</span>
            </div>
          )}
        </form>
      </div>

      {isLoggedIn && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default StartMeeting;
