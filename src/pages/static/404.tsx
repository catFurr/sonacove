import React from 'react';
import Header from '../../components/Header';
import { SearchX, ArrowRight } from 'lucide-react';
import Button from '../../components/Button';

const NotFound: React.FC = () => {

  const handleClick = () => {
    window.location.href = '/meet'
  }

  return (
    <div className='min-h-screen'>
      <Header pageType='landing' />

      <div className='flex flex-grow flex-col items-center justify-center px-4 py-16 text-center'>
        {/* The main content card */}
        <div className='rounded-2xl p-8 sm:p-12 max-w-xl w-full'>
          {/* Icon/Illustration */}
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100'>
            <SearchX className='w-12 h-12 text-primary-600' strokeWidth={1.5} />
          </div>

          {/* Main Text Content */}
          <h1 className='text-6xl sm:text-7xl font-bold text-primary-600 tracking-tight'>
            404
          </h1>
          <h2 className='mt-4 text-2xl sm:text-3xl font-semibold text-gray-800'>
            Page Not Found
          </h2>
          <p className='mt-3 text-base text-gray-600 text-lg'>
            Oops! The page you are looking for might have been moved, deleted,
            or you may have typed the URL incorrectly.
          </p>

          {/* Call to Action Buttons */}
          <div className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-6'>
            <Button
              onClick={handleClick}
              variant='primary'
              className='w-full sm:w-auto'
            >
              Go to Homepage
            </Button>
            <a
              href='mailto:support@sonacove.com'
              className='inline-flex items-center gap-2 font-semibold text-gray-600 hover:text-gray-900 transition-colors'
            >
              Contact Support <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
