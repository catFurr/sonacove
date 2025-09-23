import React, { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import BookingModal from './BookingModal';
import ToggleSwitch from '../../../components/ToggleSwitch';

import { Calendar, CirclePlay, FilePenLine, CircleCheck, Trash2, CalendarPlus, Loader2, History } from 'lucide-react';
import type { LocalStorageMeeting, Meeting, Note, Recording } from './types';

import { deleteBooking } from '../../../utils/api';
import { format } from 'date-fns';

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
  const [activeTab, setActiveTab] = useState<
    'meetings' | 'recordings' | 'notes'
  >('meetings');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [meetingsFilter, setMeetingsFilter] = useState('All');
  const [recordingsSort, setRecordingsSort] = useState<'newest' | 'oldest'>(
    'newest',
  );
  const [notesSort, setNotesSort] = useState<'newest' | 'oldest'>('newest');

  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(
    null,
  );

  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);

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

  const displayedMeetings = allMeetings.filter((meeting) => {
    if (meetingsFilter === 'All') return true;
    return meeting.status === meetingsFilter;
  });

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
      if (meetingToDelete.status === 'Upcoming') {
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
        <div className=''>
          {/* Meetings Panel */}
          {activeTab === 'meetings' && (
            <div>
              {allMeetings.length === 0 ? (
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
                      onClick={handleBookMeetingClick}
                      className='tracking-wide text-lg mt-6'
                    >
                      Book a Meeting
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='text-center sm:text-left h-[400px] flex flex-col'>
                  <ToggleSwitch
                    options={['All', 'Upcoming', 'Past']}
                    activeOption={meetingsFilter}
                    onOptionChange={(option) => setMeetingsFilter(option)}
                    className='rounded-full mb-8 flex-shrink-0 w-fit'
                  />

                  <div className='space-y-6 overflow-y-auto pr-4'>
                    {displayedMeetings.map((meeting, i) => {
                      const isDeleting = deletingMeetingId === meeting.title;
                      const isUpcoming = meeting.status === 'Upcoming';
                      return (
                        <div
                          key={`${meeting.title}-${i}`}
                          className={`relative flex flex-col sm:flex-row sm:items-start sm:gap-24 pb-4 border-b border-gray-100 last:border-b-0 transition-opacity ${
                            isDeleting ? 'opacity-50' : ''
                          }`}
                        >
                          <div className='text-left text-gray-500 text-lg mb-3 sm:mb-0 sm:w-48 sm:flex-shrink-0'>
                            <p className='font-semibold'>{meeting.date}</p>
                            <p>{meeting.time}</p>
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
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {isUpcoming ? (
                                <CircleCheck
                                  strokeWidth={3}
                                  className='w-4 h-4'
                                />
                              ) : (
                                <History strokeWidth={3} className='w-4 h-4' />
                              )}
                              {meeting.status}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteMeeting(meeting)}
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
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
