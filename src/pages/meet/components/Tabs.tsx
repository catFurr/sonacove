import React, { useState } from 'react';

interface Meeting {
  date: string;
  time: string;
  title: string;
  status: string;
}

interface Recording {
  date: string;
  duration: string;
  title: string;
}

interface Note {
  date: string;
  title: string;
  content: string;
}

interface Props {
  meetingsList: Meeting[];
  recordings: Recording[];
  notes: Note[];
}

const Tabs: React.FC<Props> = ({
  meetingsList,
  recordings,
  notes,
}: Props) => {
  const [activeTab, setActiveTab] = useState<
    'meetings' | 'recordings' | 'notes'
  >('meetings');

  const [recordingsSort, setRecordingsSort] = useState<'newest' | 'oldest'>(
    'newest',
  );
  const [notesSort, setNotesSort] = useState<'newest' | 'oldest'>('newest');

  // Sort helpers
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

  return (
    <div>
      {/* --- Tab Buttons --- */}
      <div className='flex justify-around sm:justify-start sm:gap-8 mb-6 border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`tab-button flex flex-col items-center gap-1 pb-3 text-lg font-semibold flex-1 ${
            activeTab === 'meetings'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-400 hover:text-orange-500'
          }`}
        >
          {/* Mobile Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='w-6 h-6 sm:hidden'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18'
            />
          </svg>
          <span className='hidden sm:inline'>My Meetings</span>
        </button>

        <button
          onClick={() => setActiveTab('recordings')}
          className={`tab-button flex flex-col items-center gap-1 pb-3 text-lg font-semibold flex-1 ${
            activeTab === 'recordings'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-400 hover:text-orange-500'
          }`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='w-6 h-6 sm:hidden'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z'
            />
          </svg>
          <span className='hidden sm:inline'>Recordings</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`tab-button flex flex-col items-center gap-1 pb-3 text-lg font-semibold flex-1 ${
            activeTab === 'notes'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-400 hover:text-orange-500'
          }`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='w-6 h-6 sm:hidden'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
            />
          </svg>
          <span className='hidden sm:inline'>Notes</span>
        </button>
      </div>

      {/* --- Tab Panels --- */}
      <div>
        {/* Meetings Panel */}
        {activeTab === 'meetings' && (
          <div>
            {meetingsList.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-xl text-gray-500'>
                  You have no scheduled meetings.
                </p>
                <button className='mt-4 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600'>
                  Book a Meeting
                </button>
              </div>
            ) : (
              <>
                <div className='inline-flex bg-gray-100 rounded-full p-1 space-x-1 mb-8'>
                  <button className='px-6 py-2 bg-white text-black font-semibold rounded-full shadow-sm text-sm transition-colors'>
                    All
                  </button>
                  <button className='px-6 py-2 text-gray-500 font-semibold hover:text-black rounded-full text-sm transition-colors'>
                    Upcoming
                  </button>
                  <button className='px-6 py-2 text-gray-500 font-semibold hover:text-black rounded-full text-sm transition-colors'>
                    Past
                  </button>
                </div>
                <div className='space-y-6'>
                  {meetingsList.map((meeting, i) => (
                    <div
                      key={i}
                      className='flex flex-col sm:flex-row sm:items-start sm:gap-24 pb-4 border-b border-gray-100 last:border-b-0'
                    >
                      <div className='text-left text-gray-500 text-lg mb-3 sm:mb-0'>
                        <p className='font-semibold'>{meeting.date}</p>
                        <p>{meeting.time}</p>
                      </div>
                      <div className='text-left'>
                        <p className='text-2xl font-bold text-black mb-2'>
                          {meeting.title}
                        </p>
                        <span className='inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full'>
                          <svg
                            className='w-4 h-4'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              clipRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            />
                          </svg>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Recordings Panel */}
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
                <div className='inline-flex bg-gray-100 rounded-full p-1 space-x-1 mb-8'>
                  <button
                    onClick={() => setRecordingsSort('newest')}
                    className={`sort-button px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
                      recordingsSort === 'newest'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setRecordingsSort('oldest')}
                    className={`sort-button px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
                      recordingsSort === 'oldest'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    Oldest
                  </button>
                </div>
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
        )}

        {/* Notes Panel */}
        {activeTab === 'notes' && (
          <div>
            {notes.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-xl text-gray-500'>
                  You don't have any notes yet.
                </p>
                <button className='mt-4 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600'>
                  Create a Note
                </button>
              </div>
            ) : (
              <div>
                <div className='inline-flex bg-gray-100 rounded-full p-1 space-x-1 mb-8'>
                  <button
                    onClick={() => setNotesSort('newest')}
                    className={`sort-button px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
                      notesSort === 'newest'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setNotesSort('oldest')}
                    className={`sort-button px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
                      notesSort === 'oldest'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    Oldest
                  </button>
                </div>
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
        )}
      </div>
    </div>
  );
};

export default Tabs;
