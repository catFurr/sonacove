import React from 'react';
import {
  CircleCheck,
  History,
  Loader2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type { Meeting } from './types';

/**
 * Props for the MeetingListItem component.
 */
interface MeetingListItemProps {
  /** The meeting object containing all data to display. */
  meeting: Meeting;

  /** A boolean to indicate if this specific item is currently being deleted. */
  isDeleting: boolean;

  /** Callback function to be invoked when the delete button is clicked. */
  onDelete: (meeting: Meeting) => void;
}

const MeetingListItem: React.FC<MeetingListItemProps> = ({
  meeting,
  isDeleting,
  onDelete,
}) => {
  const isUpcoming = meeting.status === 'Upcoming';
  const isExpired = meeting.status === 'Expired';

  /**
   * Handles the click on the delete button.
   * Prevents the parent link from being triggered.
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(meeting);
  };

  return (
    <a href={`/meet/${meeting.title}`}>
      <div
        className={`relative flex flex-col sm:flex-row sm:items-start sm:gap-24 p-4 border-b border-gray-100 last:border-b-0 rounded-md transition-opacity hover:bg-gray-100 cursor-pointer ${
          isDeleting ? 'opacity-50' : ''
        }`}
      >
        <div className='text-left text-gray-500 text-lg mb-3 sm:mb-0 sm:w-48 sm:flex-shrink-0'>
          <p className='font-semibold'>{meeting.date}</p>
          <p className='text-sm text-gray-400'>
            {isUpcoming ? 'Expires' : isExpired ? 'Expired' : 'Joined'} at{' '}
            {meeting.time}
          </p>
        </div>

        <div className='text-left min-w-0'>
          <p
            className='truncate text-2xl font-bold text-black mb-2'
            title={meeting.title} // Shows full title on hover
          >
            {meeting.title}
          </p>
          <span
            className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
              isUpcoming
                ? 'bg-green-100 text-green-800' // Style for Upcoming
                : isExpired
                ? 'bg-yellow-100 text-yellow-800' // Style for Expired
                : 'bg-gray-100 text-gray-700' // Style for Past
            }`}
          >
            {isUpcoming ? (
              <CircleCheck strokeWidth={3} className='w-4 h-4' />
            ) : isExpired ? (
              <AlertTriangle strokeWidth={3} className='w-4 h-4' />
            ) : (
              <History strokeWidth={3} className='w-4 h-4' />
            )}
            {meeting.status}
          </span>
        </div>

        <button
          onClick={handleDeleteClick}
          className='absolute top-4 right-0 sm:relative sm:top-auto sm:right-auto sm:ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          aria-label={`Delete meeting ${meeting.title}`}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 size={18} className='animate-spin' />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </div>
    </a>
  );
};

export default MeetingListItem;
