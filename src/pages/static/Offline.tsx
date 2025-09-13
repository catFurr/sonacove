import React from 'react';
import Header from '../../components/Header';
import { TriangleAlert } from 'lucide-react';

export default function OfflinePage() {
  return (
    <>
      <Header pageType='landing' />
      <div className='flex flex-col w-full items-center justify-center px-4 py-[12.5vh]'>
        <div className='rounded-xl p-10 max-w-sm w-full flex flex-col items-center text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400'>
            <TriangleAlert size={30} strokeWidth={2} />
          </div>

          {/* Title */}
          <h1 className='text-2xl font-semibold my-6 text-black-700'>
            Connection error
          </h1>

          {/* Message */}
          <p className='text-black-600'>
            Your device may be offline or our servers may be experiencing
            problems.
          </p>
        </div>
      </div>
    </>
  );
}
