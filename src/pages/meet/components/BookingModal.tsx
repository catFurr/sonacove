import React, { useState, useEffect } from 'react';
import { type DateRange } from 'react-day-picker';
import { addYears, format } from 'date-fns';
import { X, Calendar, Loader2 } from 'lucide-react';

import Button from '../../../components/Button';
import DateRangePicker from './DateRangePicker';
import { useAuth } from '../../../hooks/useAuth';
import { bookMeeting } from '../../../utils/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onBookingSuccess }) => {
  const { getAccessToken } = useAuth();

  // --- Form State ---
  const [roomName, setRoomName] = useState('');
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [isPermanent, setIsPermanent] = useState(false);

  // --- UI State ---
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRoomName('');
      setSelectedRange(undefined);
      setDatePickerOpen(false);
      setIsPermanent(false); // Reset permanent state on open
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClearRoomName = () => setRoomName('');

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = getAccessToken();

    if (!roomName.trim() || (!selectedRange && !isPermanent) || !token) {
      setError('Please fill in all required fields.');
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
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
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
        <div onClick={(e) => e.stopPropagation()}>
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
                onChange={(e) => setRoomName(e.target.value)}
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

            <div className='pt-2'>
              {error && <p className='text-red-500 text-sm mb-2'>{error}</p>}
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
