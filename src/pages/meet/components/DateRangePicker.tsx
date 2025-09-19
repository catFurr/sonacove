import React, { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import Button from '../../../components/Button';
import { InfinityIcon } from 'lucide-react';

interface DateRangePickerProps {
  onApply: (range: DateRange | undefined | null) => void;
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

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Permanent') {
      setRange(undefined);
    }
  };

  const handleApply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onApply(activeTab === 'Permanent' ? null : range);
    onClose();
  };

  const footerContent =
    activeTab === 'Permanent' ? (
      <span className='text-md text-gray-900 font-medium'>
        This booking will not expire.
      </span>
    ) : range?.from && range.to ? (
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
    <div className='bg-white rounded-xl shadow-2xl p-4 border border-gray-200 w-[620px]'>
      {/* Tabs */}
      <div className='flex border-b mb-4'>
        {['Calendar', 'Permanent'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            // 4. Use `flex-1` to ensure both tabs take up equal width
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

      <div className='min-h-[350px]'>
        {' '}
        {activeTab === 'Calendar' ? (
      <DayPicker
      hideNavigation
        mode='range'
        numberOfMonths={2}
        selected={range}
        onSelect={setRange}
        showOutsideDays
        className='inset-shadow-sm'
        classNames={{
          root: 'p-0',
          months: 'flex flex-col sm:flex-row',
          month: `space-y-4 w-full sm:w-1/2 border-y border-gray-200 p-4 border-2
            sm:first-of-type:border-l sm:first-of-type:rounded-tl-xl first-of-type:border-r
            sm:last-of-type:border-r sm:last-of-type:rounded-tr-xl first-of-type:border-l`,
          month_caption: 'bg-gray-100 p-1 text-center tracking-wide rounded-md',
          caption: 'flex justify-center items-center relative h-8',
          caption_label: 'text-sm font-semibold',
          nav: 'flex items-center',
          table: 'w-full border-collapse space-y-1',
          head_row: 'flex',
          head_cell:
            'text-gray-500 rounded-md w-9 font-semibold text-xs uppercase',
          row: 'flex w-full mt-2',
          cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-orange-100 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20',
          today: 'text-bold',
          day: 'text-center h-9 w-9 p-2 font-normal transition-colors',
          day_selected:
            'bg-orange-500 text-white focus:bg-orange-600 rounded-full',
          day_today: 'font-bold text-orange-500',
          day_range_middle:
            'aria-selected:bg-orange-100 aria-selected:text-black',
          day_hidden: 'invisible',
          day_outside: 'text-gray-400 opacity-50',
          weekdays: 'text-black/40 font-medium',
          range_middle: 'text-primary-800 bg-primary-500/40',
          range_start: 'rounded-md text-white bg-primary-600',
          range_end: 'rounded-md text-white bg-primary-600',
        }}
      />
        ) : (
          <div className='flex flex-col items-center justify-center text-center h-full p-8 pt-16'>
            <div className='flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 mb-4'>
              <InfinityIcon className='h-10 w-10 text-primary-600' />
            </div>
            <h3 className='text-xl font-semibold text-gray-800'>
              Permanent Booking
            </h3>
            <p className='mt-2 text-gray-500 max-w-xs'>
              This meeting will be permanently booked and will not have an
              expiration date.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between py-4 p-3 border-t'>
        <span className='text-md text-gray-600 pl-3'>{footerContent}</span>
        <div className='flex gap-2'>
          <Button variant='tertiary' onClick={onClose} className='px-10'>
            Cancel
          </Button>
          <Button
            variant='primary'
            className='!bg-orange-500 hover:!bg-orange-600 px-10'
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
