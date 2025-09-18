import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { X, Calendar, User, ChevronDown, Loader2 } from 'lucide-react';

import Button from '../../../components/Button';
import DateRangePicker from './DateRangePicker';
import { useAuth } from '../../../hooks/useAuth';
import { bookMeeting } from './utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const { getAccessToken } = useAuth();

  // --- Form State ---
  const [roomName, setRoomName] = useState('');
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  // --- UI State ---
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  // Effects for picker positioning and closing (no changes here)
  useEffect(() => {
    if (isOpen && isDatePickerOpen && modalRef.current) {
      const modalRect = modalRef.current.getBoundingClientRect();
      setPickerPosition({ top: modalRect.top, left: modalRect.right + 16 });
    }
  }, [isOpen, isDatePickerOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setDatePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [datePickerRef]);

  useEffect(() => {
    if (isOpen) {
      setRoomName('');
      setSelectedRange(undefined);
      setDatePickerOpen(false);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();
  const handleClearRoomName = () => setRoomName('');

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = getAccessToken();
    console.log(selectedRange)
    if (!roomName.trim() || !selectedRange?.to || !token) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await bookMeeting(
        roomName.trim(),
        selectedRange.to,
        token,
      );
      console.log('Success!', result);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const dateDisplayValue =
    selectedRange?.from && selectedRange.to
      ? `${format(selectedRange.from, 'MM/dd/yyyy')} - ${format(
          selectedRange.to,
          'MM/dd/yyyy',
        )}`
      : 'Select...';

  return createPortal(
    <div
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm'
    >
      <div
        ref={modalRef}
        onClick={handleModalContentClick}
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
          {/* 1. Restored full class string for the input */}
          <div className='relative w-full'>
            <input
              className='w-full rounded-lg border border-gray-300 p-3 text-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors pr-10'
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

          {/* 2. Restored full class string for the date picker button */}
          <div className='relative'>
            <button
              type='button'
              onClick={() => setDatePickerOpen(!isDatePickerOpen)}
              className='w-full rounded-lg border border-gray-300 p-3 text-md text-left flex justify-between items-center'
            >
              <span className={selectedRange ? 'text-black' : 'text-gray-400'}>
                {dateDisplayValue}
              </span>
              <Calendar size={16} className='text-gray-600' />
            </button>
            {isDatePickerOpen &&
              createPortal(
                <div
                  ref={datePickerRef}
                  style={{
                    position: 'fixed',
                    top: pickerPosition.top,
                    left: pickerPosition.left,
                    zIndex: 60,
                  }}
                >
                  <DateRangePicker
                    initialRange={selectedRange}
                    onApply={setSelectedRange}
                    onClose={() => setDatePickerOpen(false)}
                  />
                </div>,
                document.body,
              )}
          </div>

          {/* 3. Restored full class string for the select dropdown */}
          <div className='relative bg-white'>
            <User
              size={16}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />
            <select
              required
              className='w-full bg-white appearance-none rounded-lg border border-gray-300 p-3 pl-10 text-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            >
              <option>Enter</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
            <ChevronDown
              size={16}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none'
            />
          </div>

          {/* 4. Wrapped the error and button in a div to preserve layout */}
          <div className='pt-2'>
            {error && <p className='text-red-500 text-sm mb-2'>{error}</p>}
            <Button
              type='submit'
              variant='primary'
              disabled={isLoading}
              className='px-20 w-full sm:w-auto tracking-wide !bg-orange-600 hover:!bg-orange-600'
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
    </div>,
    document.body,
  );
};

export default BookingModal;
