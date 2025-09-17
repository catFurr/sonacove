import React, { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import Button from '../../../components/Button';

interface DateRangePickerProps {
  onApply: (range: DateRange | undefined) => void;
  onClose: () => void;
  initialRange?: DateRange;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onApply,
  onClose,
  initialRange,
}) => {
  const [activeTab, setActiveTab] = useState('Calendar');
  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  const handleApply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onApply(range);
    onClose();
  };

  const footerContent =
    range?.from && range.to ? (
      <span className='text-md text-gray-600'>
        Range:{' '}
        <span className='text-gray-900 font-medium pl-2'>
          {format(range.from, 'MMMM dd, yyyy')} -{' '}
          {format(range.to, 'MMMM dd, yyyy')}
        </span>
      </span>
    ) : (
      <span className='text-md text-gray-600'>Please select a date range.</span>
    );

  return (
    <div className='bg-white rounded-xl shadow-2xl p-4 border border-gray-200 w-auto'>
      {/* Tabs */}
      <div className='flex border-b mb-4'>
        {['Calendar', 'Permanent'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-md font-semibold transition-colors ${
              activeTab === tab
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Calendar Component */}
      <DayPicker
        mode='range'
        numberOfMonths={2}
        selected={range}
        onSelect={setRange}
        showOutsideDays
        classNames={{
          root: 'p-0',
          months:
            'flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4',
          month: 'space-y-4 bg-gray-50 p-4 rounded-lg',
          caption: 'flex justify-center items-center relative h-8',
          caption_label: 'text-sm font-semibold',
          nav: 'space-x-1 flex items-center',
          table: 'w-full border-collapse space-y-1',
          head_row: 'flex',
          head_cell:
            'text-gray-500 rounded-md w-9 font-semibold text-xs uppercase',
          row: 'flex w-full mt-2',
          cell: 'h-9 w-9 text-center text-sm p-0 m-1 relative [&:has([aria-selected])]:bg-orange-100 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20',
          day: 'text-center h-9 w-9 p-2 font-normal transition-colors',
          day_selected:
            'bg-orange-500 text-white focus:bg-orange-600 rounded-full',
          day_today: 'font-bold text-orange-500',
          day_range_middle:
            'aria-selected:bg-orange-100 aria-selected:text-black',
          day_hidden: 'invisible',
          day_outside: 'text-gray-400 opacity-50',
          weekdays: 'text-black/40 font-medium',
          range_middle: 'text-primary-600 bg-primary-500/40',
          range_start: 'rounded-md text-white bg-primary-600',
          range_end: 'rounded-md text-white bg-primary-600',
        }}
      />

      {/* Footer */}
      <div className='flex items-center justify-between pt-4 border-t mt-4'>
        <span className='text-md text-gray-600 pl-3'>{footerContent}</span>
        <div className='flex gap-2'>
          <Button variant='tertiary' onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='primary'
            className='!bg-orange-500 hover:!bg-orange-600'
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
