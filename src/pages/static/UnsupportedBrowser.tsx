import React from 'react';
import Header from '../../components/Header';
import { ShieldX, Download } from 'lucide-react';

const recommendedBrowsers = [
  {
    name: 'Google Chrome',
    href: 'https://www.google.com/chrome/',
  },
  {
    name: 'Mozilla Firefox',
    href: 'https://www.mozilla.org/firefox/new/',
  },
  {
    name: 'Microsoft Edge',
    href: 'https://www.microsoft.com/edge',
  },
];

const UnsupportedBrowser: React.FC = () => {
  return (
    <div className='bg-gray-50 min-h-screen'>
      <Header pageType='landing' />

      <div className='flex flex-grow flex-col items-center justify-center px-4 py-16 text-center'>
        {/* The main content card */}
        <div className='bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-2xl w-full'>
          {/* Icon/Illustration */}
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
            <ShieldX className='w-12 h-12 text-red-600' strokeWidth={1.5} />
          </div>

          {/* Main Text Content */}
          <h1 className='text-2xl sm:text-3xl font-bold tracking-wide text-gray-900'>
            Your Browser Isn't Fully Supported
          </h1>
          <p className='mt-3 text-base text-gray-500 max-w-lg mx-auto'>
            To ensure the best performance, security, and access to all of
            Sonacove's features, we recommend using a modern browser.
          </p>

          {/* Recommended Browsers Section */}
          <div className='mt-8'>
            <h3 className='font-semibold text-gray-700'>
              We recommend one of these free browsers:
            </h3>
            <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {recommendedBrowsers.map((browser) => (
                <a
                  key={browser.name}
                  href={browser.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-4 text-left transition-all hover:bg-gray-50 hover:shadow-sm'
                >
                  <span className='font-semibold text-gray-800'>
                    {browser.name}
                  </span>
                  <Download className='h-5 w-5 text-gray-400' />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsupportedBrowser;
