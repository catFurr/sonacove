import React from 'react';
import Header from '../../components/Header';

const UnsupportedBrowser: React.FC = () => {
  return (
    <>
      <Header pageType='landing' />
      <div className='flex flex-col w-full items-center justify-center px-4 py-[25vh]'>
        <div className='rounded-xl p-10 max-w-2xl w-full text-center'>
          <h1 className='text-2xl w-full font-semibold text-gray-800 mb-4 md:whitespace-nowrap'>
            It looks like you're using a browser we don't fully support.
          </h1>

          <p className='text-gray-600 leading-relaxed md:whitespace-nowrap'>
            We recommend trying Sonacove with the latest version of{' '}
            <a
              className='font-medium hover:underline text-primary-700 hover:text-accent-600 transition'
              href='https://www.google.com/chrome/'
              target='_blank'
              rel='noopener noreferrer'
            >
              Chrome
            </a>{' '}
            or{' '}
            <a
              className='font-medium hover:underline text-primary-700 hover:text-accent-600 transition'
              href='https://www.chromium.org/'
              target='_blank'
              rel='noopener noreferrer'
            >
              Chromium
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
};

export default UnsupportedBrowser;
