import React from 'react';
import Header from '../../components/Header';

const NotFound: React.FC = () => {
  return (
    <>
    <Header pageType='landing'/>
      <div className='flex flex-col items-center justify-center px-4 py-[17.5vh]'>
        <div className='rounded-xl p-10 max-w-lg w-full text-center'>
          <h1 className='text-4xl font-bold mb-4 text-gray-700'>
            404 Not Found
          </h1>
          <p className='text-lg text-gray-700 mb-6 font-bold'>
            You can create a new conversation{' '}
            <a
              className='text-blue-700 hover:text-blue-800 transition'
              href='/meet'
            >
              here
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
