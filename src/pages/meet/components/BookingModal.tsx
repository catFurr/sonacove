import React, { useState, useRef, useEffect, type FormEvent } from 'react';
import Button from '../../../components/Button';
import DateRangePicker from './DateRangePicker';
import { X, Calendar, User, ChevronDown } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [roomName, setRoomName] = useState('');

  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  const modalRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && isDatePickerOpen && modalRef.current) {
    const modalRect = modalRef.current.getBoundingClientRect();
    setPickerPosition({
        top: modalRect.top,
        left: modalRect.right + 16, // Position to the right of the modal with a 1rem gap
    });
  }
 }, [isOpen, isDatePickerOpen]);
  

  // Close date picker when clicking outside
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
      }
    }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRoomNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const handleClearRoomName = () => {
      setRoomName('');
  };

  const dateDisplayValue =
    selectedRange?.from && selectedRange.to
      ? `${format(selectedRange.from, 'MM/dd/yyyy')} - ${format(
          selectedRange.to,
          'MM/dd/yyyy',
        )}`
      : 'Select...';

  return (
    <div
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm'
    >
      <div
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

        <form className='space-y-4 text-center'>
          <div className='relative w-full'>
            <input
              className='w-full rounded-lg border border-gray-300 p-3 text-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors pr-10'
              placeholder='Room name'
              onChange={handleRoomNameInput}
              value={roomName}
              required
            />
            <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer'>
              <X
                size={16}
                className='cursor-pointer text-gray-600'
                onClick={handleClearRoomName}
              />
            </span>
          </div>

          {/* Date Picker Input */}
          <div className='relative' ref={datePickerRef}>
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

          {/* Dropdown Select */}
          <div className='relative bg-white'>
            <User
              size={16}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />
            <select required className='w-full bg-white appearance-none rounded-lg border border-gray-300 p-3 pl-10 text-md focus:outline-none focus:ring-2 focus:ring-primary-500'>
              <option>Enter</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
            <ChevronDown
              size={16}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none'
            />
          </div>

          <Button
            type='submit'
            variant='primary'
            className='px-20 w-full sm:w-auto tracking-wide !bg-primary-600 hover:!bg-primary-600 mt-6'
          >
            Book
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
