import React, { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import type { Meeting } from './types';
import Button from '../../../components/Button';
import ToggleSwitch from '../../../components/ToggleSwitch';
import MeetingListItem from './MeetingListItem';

/**
 * Props for the MeetingList component.
 */
interface MeetingsPanelProps {
  /** The combined list of all meetings (upcoming and past). */
  meetings: Meeting[];

  /** The title of the meeting currently being deleted, or null. */
  deletingMeetingId: string | null;

  /** Callback function to handle the deletion of a meeting. */
  onDeleteMeeting: (meeting: Meeting) => void;

  /** Callback function to open the booking modal. */
  onBookMeeting: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MeetingList: React.FC<MeetingsPanelProps> = ({
  meetings,
  deletingMeetingId,
  onDeleteMeeting,
  onBookMeeting,
}) => {
  /** State to manage the active filter ('All', 'Upcoming', 'Past'). */
  const [meetingsFilter, setMeetingsFilter] = useState('All');

  /** Derived list of meetings to display based on the current filter. */
  const displayedMeetings = meetings.filter((meeting) => {
    if (meetingsFilter === 'All') return true;
    return meeting.status === meetingsFilter;
  });

  // Render the empty state if there are no meetings at all.
  if (meetings.length === 0) {
    return (
      <div className='flex flex-col justify-center text-center py-12 min-h-[400px]'>
        <div className='flex flex-col items-center justify-center max-w-lg mx-auto p-12 rounded-xl'>
          <div className='flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-6'>
            <CalendarPlus className='w-8 h-8 text-primary-600' />
          </div>
          <h3 className='text-xl font-semibold text-gray-800'>
            You have no meetings
          </h3>
          <p className='mt-2 text-gray-500'>
            Your scheduled and past meetings will appear here.
          </p>
          <Button
            variant='primary'
            onClick={onBookMeeting}
            className='tracking-wide text-lg mt-6'
          >
            Book a Meeting
          </Button>
        </div>
      </div>
    );
  }

  // Render the list view if there are meetings.
  return (
    <div className='text-center sm:text-left h-[400px] flex flex-col'>
      <ToggleSwitch
        options={['All', 'Upcoming', 'Past']}
        activeOption={meetingsFilter}
        onOptionChange={(option) => setMeetingsFilter(option)}
        className='rounded-full mb-8 flex-shrink-0 w-fit'
      />

      <div className='space-y-6 overflow-y-auto pr-4'>
        {displayedMeetings.map((meeting, i) => (
          <MeetingListItem
            key={`${meeting.title}-${i}`}
            meeting={meeting}
            isDeleting={deletingMeetingId === meeting.title}
            onDelete={onDeleteMeeting}
          />
        ))}
      </div>
    </div>
  );
};

export default MeetingList;
