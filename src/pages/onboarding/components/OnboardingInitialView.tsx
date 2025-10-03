import React from 'react';
import Button from '../../../components/Button';

interface OnboardingInitialViewProps {
  onLogin: () => void;
  onSignup: () => void;
}

const OnboardingInitialView: React.FC<OnboardingInitialViewProps> = ({ onLogin, onSignup }) => {
  return (
    <div className='text-center'>
      <h1 className='text-4xl font-bold text-gray-900 mb-4'>Get Started</h1>
      <p className='text-lg text-gray-600 mb-8'>
        Create an account or log in to continue.
      </p>
      <div className='space-y-4'>
        <Button onClick={onSignup} variant='primary' className='w-full'>
          Create a New Account
        </Button>
        <Button onClick={onLogin} variant='secondary' className='w-full'>
          Log In
        </Button>
      </div>
      <p className='text-sm text-gray-500 mt-6'>
        Need help? Contact us at{' '}
        <a
          href='mailto:support@sonacove.com'
          className='font-medium text-primary-600 hover:underline'
        >
          support@sonacove.com
        </a>
      </p>
    </div>
  );
};

export default OnboardingInitialView;
