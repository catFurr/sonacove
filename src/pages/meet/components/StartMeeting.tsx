import React, { useState, useEffect, useRef } from 'react';
import { animatePlaceholder, generatePlaceholderWords, isRoomNameValid } from '../../../utils/placeholder.ts';
import { getAuthService } from '../../../utils/AuthService';
import { showPopup } from '../../../utils/popupService.ts';

import BookingModal from './BookingModal';
import Button from '../../../components/Button';
import PageHeader from '../../../components/PageHeader';
import { AlertCircle, Info, Lock } from 'lucide-react';

interface Props {
  isLoggedIn: boolean;
  onMeetingBooked: () => void;
  isBookingLimitReached: boolean;
}

const StartMeeting: React.FC<Props> = ({ isLoggedIn, onMeetingBooked, isBookingLimitReached }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isRoomNameInvalid, setIsRoomNameInvalid] = useState(false);

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
      setPlaceholder,
    );

    return cleanup;
  }, []);

  /**
   * Handles changes to the room name input and validates its content.
   */
  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRoomName = e.target.value;
    setRoomName(newRoomName);

    // Check if room name has invalid characters
    const hasInvalidChars = isRoomNameValid(newRoomName);

    setIsRoomNameInvalid(hasInvalidChars);
  };

  /**
   * Navigates the user to the meeting room if the room name is valid.
   */
  const handleJoinClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isRoomNameInvalid) {
      e.preventDefault(); // Stop the link from navigating
      showPopup('Room name contains invalid characters.', 'error', 2500);
    }
  };

  const handleBookMeetingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isLoggedIn) {
      // Prevent opening the modal if the limit is reached
      if (isBookingLimitReached) return;

      setIsModalOpen(true);
    } else {
      const authService = getAuthService();
      if (authService) {
        showPopup('Please log in to book a meeting.', 'error', 2500);
      } else {
        alert(
          'Authentication service is currently unavailable. Please try again later.',
        );
      }
    }
  };

  const finalRoomName = roomName.trim() || placeholder;

  const isButtonDisabled = isLoggedIn && isBookingLimitReached;

  /**
   * Renders a contextual message below the action buttons based on auth state.
   */
  const renderBookingStatusMessage = () => {
    if (isLoggedIn && isBookingLimitReached) {
      return (
        <div className='mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 p-2 rounded-lg'>
          <Info size={14} />
          <span>Booking limit reached.</span>
        </div>
      );
    }

    if (!isLoggedIn) {
      return (
        <div className='mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 p-2 rounded-lg'>
          <Lock size={14} className='text-gray-500 text-bold' />
          <span>Login required to book a meeting.</span>
        </div>
      );
    }

    return null;
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

        <form id='room-form' className='max-w-lg'>
          <div className='relative w-full'>
            <input
              ref={inputRef}
              id='room-input'
              type='text'
              value={roomName}
              onChange={handleRoomNameChange}
              placeholder='Enter meeting name'
              className='w-full bg-transparent border-0 border-b border-gray-300 py-3 pl-3 text-2xl sm:text-3xl font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-primary-500 transition-colors'
            />
          </div>

          {/* Display validation error message */}
          {isRoomNameInvalid && (
            <div className='mt-3 mb-8 flex items-center gap-2 text-sm text-red-600'>
              <AlertCircle size={14} />
              <p>Room name cannot contain special characters.</p>
            </div>
          )}

          {!isRoomNameInvalid && (
            <p className='mt-3 mb-8 text-sm text-gray-500'>
              Enter subject or Meeting ID to get started
            </p>
          )}

          <div className='flex max-[450px]:flex-col items-center gap-4'>
            <a
              href={`/meet/${finalRoomName}`}
              className='w-full'
              onClick={handleJoinClick}
              role='button'
            >
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
              className='w-full max-[445px]:w-full shadow-sm transition-transform hover:scale-105 will-change-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'
              disabled={isButtonDisabled}
            >
              Book meeting
            </Button>
          </div>

          {renderBookingStatusMessage()}
        </form>
      </div>

      {isLoggedIn && (
        <BookingModal
          roomName={finalRoomName}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBookingSuccess={onMeetingBooked}
        />
      )}
    </>
  );
};

export default StartMeeting;
