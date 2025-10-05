import { CalendarClock, CalendarPlus, History } from "lucide-react";
import Button from "../../../components/Button";

/**
 * Defines the possible types for the EmptyMeetingList component.
 */
export type EmptyMeetingListType = 'none' | 'upcoming' | 'past';

/**
 * Props for the refactored EmptyMeetingList component.
 */
interface EmptyStateProps {
  /** The type of empty state to display, which determines the content. */
  type: EmptyMeetingListType;

  /** Optional callback for the 'Book a Meeting' button. */
  onButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const EmptyMeetingList: React.FC<EmptyStateProps> = ({ type, onButtonClick }) => {
  // A configuration object to hold the content for each empty state type.
  const contentConfig = {
    none: {
      icon: <CalendarPlus className='w-8 h-8 text-primary-600' />,
      title: 'You have no meetings',
      message: 'Your scheduled and past meetings will appear here.',
      showButton: true,
    },
    upcoming: {
      icon: <CalendarClock className='w-8 h-8 text-primary-600' />,
      title: 'No upcoming meetings',
      message: 'Your scheduled meetings will appear here once you book them.',
      showButton: true,
    },
    past: {
      icon: <History className='w-8 h-8 text-primary-600' />,
      title: 'No meeting history',
      message: 'Meetings you have joined in the past will appear here.',
      showButton: false,
    },
  };

  const { icon, title, message, showButton } = contentConfig[type];

  return (
    <div className='flex flex-col items-center justify-center max-w-lg mx-auto p-12 rounded-xl'>
      <div className='flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-6'>
        {icon}
      </div>
      <h3 className='text-xl font-semibold text-gray-800'>{title}</h3>
      <p className='mt-2 text-gray-500'>{message}</p>
      {/* {showButton && onButtonClick && (
        <Button
          variant='primary'
          onClick={onButtonClick}
          className='tracking-wide text-lg mt-6'
        >
          Book a Meeting
        </Button>
      )} */}
    </div>
  );
};

export default EmptyMeetingList