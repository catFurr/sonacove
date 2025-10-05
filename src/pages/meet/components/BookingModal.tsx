import React, { useState, useEffect } from 'react';
import { type DateRange } from 'react-day-picker';
import { addYears, format } from 'date-fns';
import { X, Calendar, Loader2, AlertCircle } from 'lucide-react';

import Button from '../../../components/Button';
import DateRangePicker from './DateRangePicker';
import { useAuth } from '../../../hooks/useAuth';
import { bookMeeting } from '../../../utils/api';
import { showPopup } from '../../../utils/popupService';
import { isRoomNameValid } from '../../../utils/placeholder';

interface BookingModalProps {
  roomName?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ roomName : _roomName, isOpen, onClose, onBookingSuccess }) => {
  const { getAccessToken } = useAuth();

  // --- Form State ---
  const [roomName, setRoomName] = useState(_roomName || '');
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [isPermanent, setIsPermanent] = useState(false);
  const [isRoomNameInvalid, setIsRoomNameInvalid] = useState(false);

  // --- UI State ---
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoomName(_roomName || '');

      setSelectedRange(undefined);
      setDatePickerOpen(false);
      setIsPermanent(false); // Reset permanent state on open
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClearRoomName = () => setRoomName('');

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();

    if (isRoomNameInvalid) {
      showPopup('Room name contains invalid characters.', 'error', 2500);
      return
    }

    if (!roomName.trim() || (!selectedRange && !isPermanent) || !token) {
      showPopup('Please fill in all required fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (isPermanent){
        const currentDate = new Date()
        const futureDate = addYears(currentDate, 1) // 1 Year from the current date

        result = await bookMeeting(roomName.trim(), futureDate, token)
      }else{
        const endDate = isPermanent ? null : selectedRange?.to ?? null;

        result = await bookMeeting(roomName.trim(), endDate, token);
      }

      console.log('Success!', result);
      onBookingSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      showPopup(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
  

  const dateDisplayValue = isPermanent
    ?  'Permanent (No End Date)'
    : selectedRange?.from && selectedRange.to
    ? `${format(selectedRange.from, 'MM/dd/yyyy')} - ${format(
        selectedRange.to,
        'MM/dd/yyyy',
      )}`
    : 'Select...';

  const handleDateApply = (range: DateRange | undefined | null) => {
    if (range === null) {
      setIsPermanent(true);
      setSelectedRange(undefined);
    } else {
      setIsPermanent(false);
      setSelectedRange(range);
    }
    setDatePickerOpen(false); // Close the picker
  };

  return (
    <div
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm'
    >
      {isDatePickerOpen ? (
        <div
          className='w-full flex justify-center'
          onClick={(e) => e.stopPropagation()}
        >
          <DateRangePicker
            initialRange={selectedRange}
            onApply={handleDateApply}
            onClose={() => setDatePickerOpen(false)}
          />
        </div>
      ) : (
        <div
          onClick={(e) => e.stopPropagation()}
          className='relative bg-white rounded-xl shadow-lg p-8 w-full max-w-md sm:max-w-xl mx-4'
        >
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-3xl font-bold tracking-wide'>Book a meeting</h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-800 transition-colors'
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleBooking} className='space-y-4 text-center'>
            <div className='relative w-full'>
              <input
                className='w-full rounded-lg border border-gray-300 p-3 text-md text-black font-semibold placeholder-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors pr-10'
                placeholder='Room name'
                onChange={handleRoomNameChange}
                value={roomName}
                required
              />
              {roomName && (
                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer'>
                  <X
                    size={16}
                    className='cursor-pointer text-gray-600'
                    onClick={handleClearRoomName}
                  />
                </span>
              )}
            </div>

            {isRoomNameInvalid && (
              <div className='mt-1 mb-1 flex items-center gap-2 text-sm text-red-600'>
                <AlertCircle size={14} />
                <p>Room name cannot contain special characters.</p>
              </div>
            )}

            <div className='relative'>
              <button
                type='button'
                onClick={() => setDatePickerOpen(true)}
                className='w-full rounded-lg border border-gray-300 p-3 mb-16 text-md text-left flex justify-between items-center'
              >
                <span
                  className={
                    selectedRange || isPermanent
                      ? 'text-black font-semibold'
                      : 'text-gray-400'
                  }
                >
                  {dateDisplayValue}
                </span>
                <Calendar size={16} className='text-gray-600' />
              </button>
            </div>

            <div className=''>
              <Button
                type='submit'
                variant='primary'
                disabled={isLoading}
                className='px-16 w-full sm:w-auto tracking-widest !bg-orange-600 hover:!bg-orange-600'
              >
                {isLoading ? (
                  <Loader2 className='mx-auto animate-spin' />
                ) : (
                  'Book'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookingModal;
