import React from 'react';
import Header from '../../components/Header';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {

  return (
    <div className='bg-gray-50 min-h-screen'>
      <Header pageType='landing' />

      <div className='flex flex-grow flex-col items-center justify-center px-4 py-[15vh] text-center'>
        {/* The main content card */}
        <div className='rounded-2xl p-8 sm:p-12 max-w-lg w-full'>
          {/* Icon/Illustration */}
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
            <WifiOff className='w-12 h-12 text-red-600' strokeWidth={2} />
          </div>

          {/* Main Text Content */}
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900'>
            You're Currently Offline
          </h1>
          <p className='mt-3 text-base text-md text-gray-500 max-w-md mx-auto'>
            It looks like your device has lost its connection to the internet.
            Please check your network connection and try again.
          </p>
        </div>
      </div>
    </div>
  );
}
