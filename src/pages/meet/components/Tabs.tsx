import React, { useEffect, useState } from 'react';
import { Calendar, CirclePlay, FilePenLine } from 'lucide-react';
import ToggleSwitch from '../../../components/ToggleSwitch';
import BookingModal from './BookingModal';
import MeetingList from './MeetingList';

import type { LocalStorageMeeting, Meeting, Note, Recording } from './types';

import { format } from 'date-fns';
import { deleteBooking } from '../../../utils/api';

interface Props {
  meetingsList: Meeting[];
  recordings: Recording[];
  notes: Note[];
  token: string | undefined;
  onMeetingDeleted: () => void;
  onMeetingBooked: () => void;
}

const Tabs: React.FC<Props> = ({
  meetingsList,
  recordings,
  notes,
  token,
  onMeetingDeleted,
  onMeetingBooked,
}) => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'recordings' | 'notes'>('meetings');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [recordingsSort, setRecordingsSort] = useState<'newest' | 'oldest'>('newest');
  const [notesSort, setNotesSort] = useState<'newest' | 'oldest'>('newest');
  
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);

  useEffect(() => {
    let pastMeetings: Meeting[] = [];
    try {
      const recentListJson = localStorage.getItem('features/recent-list');
      if (recentListJson) {
        const localData: LocalStorageMeeting[] = JSON.parse(recentListJson);
        pastMeetings = localData.map((item) => {
          const urlParts = item.conference.split('/');
          const title = urlParts[urlParts.length - 1] || 'Untitled Meeting';
          const meetingDate = new Date(item.date);
          return {
            title,
            date: format(meetingDate, 'MMMM dd, yyyy'),
            time: format(meetingDate, 'p'),
            status: 'Past',
          };
        });
      }
    } catch (error) {
      console.error(
        'Failed to parse recent meetings from localStorage:',
        error,
      );
      pastMeetings = [];
    }

    const upcomingTitles = new Set(meetingsList.map((m) => m.title));
    const uniquePastMeetings = pastMeetings.filter(
      (m) => !upcomingTitles.has(m.title),
    );
    const combined = [...meetingsList, ...uniquePastMeetings].sort((a, b) => {
      if (a.status === 'Upcoming' && b.status !== 'Upcoming') return -1;
      if (b.status === 'Upcoming' && a.status !== 'Upcoming') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setAllMeetings(combined);
  }, [meetingsList]);

  const sortedRecordings = [...recordings].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return recordingsSort === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const sortedNotes = [...notes].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return notesSort === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const handleDeleteMeeting = async (meetingToDelete: Meeting) => {
    setDeletingMeetingId(meetingToDelete.title); // Set loading state for this specific item
    try {
      if (meetingToDelete.status === 'Upcoming' || meetingToDelete.status === 'Expired') {
        if (meetingToDelete.title.trim() && token) {
          await deleteBooking(meetingToDelete.title, token);
          onMeetingDeleted();
          console.log(
            `Meeting "${meetingToDelete.title}" deleted successfully`,
          );
        }
      } else if (meetingToDelete.status === 'Past') {
        const recentListJson = localStorage.getItem('features/recent-list');
        if (!recentListJson) return;

        const localData: LocalStorageMeeting[] = JSON.parse(recentListJson);
        const updatedLocalData = localData.filter((item) => {
          const urlParts = item.conference.split('/');
          const title = urlParts[urlParts.length - 1];
          return title !== meetingToDelete.title;
        });

        localStorage.setItem(
          'features/recent-list',
          JSON.stringify(updatedLocalData),
        );
        setAllMeetings((prevMeetings) =>
          prevMeetings.filter((m) => m.title !== meetingToDelete.title),
        );
        console.log(
          `Past meeting "${meetingToDelete.title}" deleted from history.`,
        );
      }
    } catch (error) {
      console.error(`Failed to delete meeting:`, error);
    } finally {
      setDeletingMeetingId(null);
    }
  };

  const handleBookMeetingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <div>
        {/* --- Tab Buttons --- */}
        <div className='flex justify-around sm:justify-start sm:gap-8 mb-6 border-b border-gray-200'>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`tab-button flex flex-col items-center gap-1 pb-3 text-lg font-semibold flex-1 ${
              activeTab === 'meetings'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-primary-500'
            }`}
          >
            {/* Mobile Icon */}
            {/* <Calendar className='w-6 h-6 sm:hidden' /> */}
            <span className='sm:inline'>My Meetings</span>
          </button>

          {/* <button
          onClick={() => setActiveTab('recordings')}
          className={`tab-button flex flex-col items-center gap-1 pb-3 text-lg font-semibold flex-1 ${
            activeTab === 'recordings'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-400 hover:text-primary-500'
          }`}
        >
          <CirclePlay className='w-6 h-6 sm:hidden' />
          <span className='hidden sm:inline'>Recordings</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`tab-button flex flex-col items-center gap-1 pb-3 text-lg font-semibold flex-1 ${
            activeTab === 'notes'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-400 hover:text-primary-500'
          }`}
        >
          <FilePenLine className='w-6 h-6 sm:hidden' />
          <span className='hidden sm:inline'>Notes</span>
        </button> */}
        </div>

        {/* --- Tab Panels --- */}
        <div>
          {activeTab === 'meetings' && (
            <MeetingList
              meetings={allMeetings}
              deletingMeetingId={deletingMeetingId}
              onDeleteMeeting={handleDeleteMeeting}
              onBookMeeting={handleBookMeetingClick}
            />
          )}

          {/* Recordings Panel
        {activeTab === 'recordings' && (
          <div>
            {recordings.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-xl text-gray-500'>
                  Recordings from your past meetings will appear here.
                </p>
              </div>
            ) : (
              <div>
                <ToggleSwitch
                  options={['Newest', 'Oldest']}
                  activeOption={
                    recordingsSort === 'newest' ? 'Newest' : 'Oldest'
                  }
                  onOptionChange={(option) =>
                    setRecordingsSort(
                      option.toLowerCase() as 'newest' | 'oldest',
                    )
                  }
                  className='rounded-full mb-8'
                />
                <div className='sortable-list space-y-6'>
                  {sortedRecordings.map((rec, i) => (
                    <div
                      key={i}
                      className='sortable-item flex items-start justify-between pb-4 border-b border-gray-100 last:border-b-0'
                    >
                      <div className='text-left text-gray-600 text-lg'>
                        <p>{rec.date}</p>
                        <p className='text-sm'>Duration: {rec.duration}</p>
                      </div>
                      <p className='text-2xl font-bold text-black text-right'>
                        {rec.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )} */}

          {/* Notes Panel */}
          {/* {activeTab === 'notes' && (
          <div>
            {notes.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-xl text-gray-500'>
                  You don't have any notes yet.
                </p>
                <button className='mt-4 px-6 py-3 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-600'>
                  Create a Note
                </button>
              </div>
            ) : (
              <div>
                <ToggleSwitch
                  options={['Newest', 'Oldest']}
                  activeOption={notesSort === 'newest' ? 'Newest' : 'Oldest'}
                  onOptionChange={(option) =>
                    setNotesSort(option.toLowerCase() as 'newest' | 'oldest')
                  }
                  className='rounded-full mb-8'
                />
                <div className='sortable-list space-y-4'>
                  {sortedNotes.map((note, i) => (
                    <div
                      key={i}
                      className='sortable-item flex items-start justify-between gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex-grow'>
                        <p className='text-sm text-gray-500'>{note.date}</p>
                        <h4 className='text-xl font-bold text-black mt-1'>
                          {note.title}
                        </h4>
                        <p className='text-gray-600 mt-2 text-md leading-relaxed'>
                          {note.content.substring(0, 120)}...
                        </p>
                      </div>
                      <div className='flex flex-col gap-2 flex-shrink-0'>
                        <button className='px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'>
                          View
                        </button>
                        <button className='px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100'>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )} */}
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingSuccess={onMeetingBooked}
      />
    </>
  );
};

export default Tabs;
