import React, { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Header from '../../components/Header';
import { PartyPopper } from 'lucide-react';

const hints = [
  'You can pin participants by clicking on their thumbnails.',
  'You can tell others you have something to say by using the "Raise Hand" feature.',
  'You can learn about key shortcuts by pressing Shift+?',
  "You can learn more about the state of everyone's connection by hovering on the bars in their thumbnail.",
  'You can hide all thumbnails by using the button in the bottom right corner.',
];

const ClosePage: React.FC = () => {
  const [hint, setHint] = useState<string>('');

  useEffect(() => {
    const l = hints.length - 1;
    const n = Math.floor(Math.random() * (l + 1));
    setHint(hints[n]);
  }, []);

  const handleClick = () => {
    window.location.href = '/meet'
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <Header pageType='landing' />

      <div className='flex flex-grow flex-col items-center justify-center px-4 py-16 text-center'>
        <div className='bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-2xl w-full'>
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100'>
            <PartyPopper
              className='w-12 h-12 text-primary-600'
              strokeWidth={1.5}
            />
          </div>

          {/* Main Text Content */}
          <h1 className='text-3xl sm:text-4xl font-bold tracking-wide text-gray-900'>
            Thank you for using Sonacove Meets
          </h1>
          <p className='mt-3 text-base text-gray-500 max-w-md mx-auto'>
            Your meeting has ended.
          </p>

          {/* Hint Box */}
          <div className='mt-8 rounded-lg bg-gray-100 p-4 text-center'>
            <p className='font-semibold text-gray-800'>💡 Did you know?</p>
            <p id='hintMessage' className='mt-1 text-gray-600'>
              {hint}
            </p>
          </div>

          {/* Call to Action Button */}
          <div className='mt-10'>
            <Button
              onClick={handleClick}
              variant='primary'
              className='w-full sm:w-auto'
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosePage;
