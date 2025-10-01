import React, { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import Button from '../../../components/Button';

interface OnboardingErrorViewProps {
  userFriendlyError: string;
  detailedErrorMessage: string | null;
  onTryAgain: () => void;
}

const OnboardingErrorView: React.FC<OnboardingErrorViewProps> = ({
  userFriendlyError,
  detailedErrorMessage,
  onTryAgain,
}) => {
  const [showDetailedError, setShowDetailedError] = useState(false);

  return (
    <div className='text-center'>
      <CircleAlert className='w-16 h-16 mx-auto text-red-500' />
      <h1 className='text-4xl font-bold text-gray-900 mt-6 mb-2'>
        Something went wrong
      </h1>
      <p className='text-lg text-gray-600 mb-6'>{userFriendlyError}</p>

      {detailedErrorMessage && (
        <div className='mb-6 text-sm text-left bg-red-50 p-4 rounded-lg border border-red-200'>
          <button
            onClick={() => setShowDetailedError(!showDetailedError)}
            className='font-semibold text-primary-600 hover:underline mb-2'
          >
            {showDetailedError
              ? 'Hide Technical Details'
              : 'Show Technical Details'}
          </button>
          {showDetailedError && (
            <pre className='mt-2 text-xs text-gray-600 whitespace-pre-wrap bg-white p-2 rounded'>
              {detailedErrorMessage}
            </pre>
          )}
        </div>
      )}

      <div className='mt-8 space-y-4'>
        <Button onClick={onTryAgain} variant='primary' className='w-full'>
          Try Again
        </Button>
        <a
          href='mailto:support@sonacove.com'
          className='block text-center text-primary-600 font-medium hover:underline'
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default OnboardingErrorView;
