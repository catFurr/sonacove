import React, { useState, useEffect, useRef } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

import Button from '../../../components/Button';
import Header from '../../../components/Header';
import { CircleAlert, CircleCheck } from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';
import { getAuthService } from '../../../utils/AuthService';

import { PUBLIC_PADDLE_CLIENT_TOKEN } from 'astro:env/client';
import { PUBLIC_PADDLE_PRICE_ID } from 'astro:env/client';

const OnboardingFlow: React.FC = () => {
  const authService = getAuthService()
  const { isLoggedIn, user, login } = useAuth();

  const [currentView, setCurrentView] = useState<'initial' | 'success' | 'error'>('initial');
  const [discountCode, setDiscountCode] = useState('');

  const [userFriendlyError, setUserFriendlyError] = useState('We encountered an unexpected issue.');
  const [detailedErrorMessage, setDetailedErrorMessage] = useState<string | null>(null);
  const [showDetailedError, setShowDetailedError] = useState(false);

  const paddle = useRef<Paddle | undefined>(undefined);
  const env = import.meta.env;

  // --- METHODS ---
  const handleError = (userMessage: string, errorObj: any = null) => {
    console.error('User-facing error triggered:', userMessage, errorObj || '');
    setUserFriendlyError(userMessage || 'An unexpected error occurred.');
    if (errorObj) {
      if (errorObj instanceof Error)
        setDetailedErrorMessage(`${errorObj.name}: ${errorObj.message}`);
      else if (typeof errorObj === 'string') setDetailedErrorMessage(errorObj);
      else if (errorObj.message) setDetailedErrorMessage(errorObj.message);
      else
        setDetailedErrorMessage(
          'Additional error information has been logged to the console.',
        );
    } else {
      setDetailedErrorMessage(null);
    }
    setShowDetailedError(false);
    setCurrentView('error');
  };

  const setupPaddleCheckout = async () => {
    try {
      if (!paddle.current) {
        const environment =
          (env.PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production') ||
          'sandbox';
        const clientToken = PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!clientToken)
          throw new Error('Paddle client token is not configured');

        paddle.current = await initializePaddle({
          environment,
          token: clientToken,
          eventCallback: (data) => {
            if (data.name === 'checkout.completed') {
              window.location.href = '/meet?subscription=success';
            } else if (data.name === 'checkout.error') {
              handleError(
                'There was a problem with the payment process.',
                data.error,
              );
            }
          },
        });
      }
    } catch (error) {
      console.error('Error setting up Paddle checkout:', error);
      throw error;
    }
  };

  const openPaddleCheckout = async () => {
    try {
      if (!paddle.current) {
        await setupPaddleCheckout();
      }
      await paddle.current?.Checkout.open({
        items: [{ priceId: PUBLIC_PADDLE_PRICE_ID, quantity: 1 }],
        ...(discountCode && { discountCode }),
        settings: { displayMode: 'overlay' },
        ...(user?.profile.email && { customer: { email: user.profile.email } }),
      });
    } catch (error) {
      handleError('The subscription service is currently unavailable.', error);
    }
  };

  // --- LIFECYCLE ---

  // Effect to handle view changes based on authentication state
  useEffect(() => {
    if (isLoggedIn) {
      setCurrentView('success');
      setupPaddleCheckout().catch((error) => {
        handleError('Could not initialize the subscription service.', error);
      });
    } else {
      setCurrentView('initial');
    }
  }, [isLoggedIn]);

  // Effect to grab discount code from URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const discountFromQuery = urlParams.get('discount');
    if (discountFromQuery) {
      setDiscountCode(discountFromQuery);
    }
  }, []);

  const isTrialing =
    user?.profile.context?.user?.subscription_status !== 'active';
  const firstName = user?.profile.name?.split(' ')[0] ?? 'there';

  return (
    <>
      <Header pageType='landing' />

      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12'>
          {/* --- Initial View --- */}
          {currentView === 'initial' && (
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-gray-900 mb-4'>
                Get Started
              </h1>
              <p className='text-lg text-gray-600 mb-8'>
                Create an account or log in to continue.
              </p>
              <div className='space-y-4'>
                <Button
                  onClick={() => authService.signup()}
                  variant='primary'
                  className='w-full'
                >
                  Create a New Account
                </Button>
                <Button
                  onClick={() => login()}
                  variant='secondary'
                  className='w-full'
                >
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
          )}

          {/* --- Success View --- */}
          {currentView === 'success' && user && (
            <div className='text-center'>
              <CircleCheck className='w-16 h-16 mx-auto text-green-500' />
              <h1 className='text-4xl font-bold text-gray-900 mt-6 mb-2'>
                Welcome aboard, {firstName}!
              </h1>

              {isTrialing ? (
                <>
                  <p className='text-lg text-gray-600'>
                    You're now on our unlimited free trial.
                  </p>
                  <div className='bg-gray-50 rounded-xl p-6 my-8 text-left space-y-2 border'>
                    <p className='font-semibold text-gray-800'>Your Account:</p>
                    <p className='text-gray-600'>
                      <strong>Email:</strong> {user.profile.email}
                    </p>
                    <p className='text-gray-600'>
                      <strong>Status:</strong> Free Trial
                    </p>
                  </div>
                  <div className='space-y-4 flex flex-col'>
                    <Button
                      onClick={openPaddleCheckout}
                      variant='primary'
                      className='w-full'
                    >
                      Subscribe Now for Full Access
                    </Button>
                    <a href='/meet'>
                      <Button variant='secondary' className='w-full'>
                        Continue with Trial
                      </Button>
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p className='text-lg text-gray-600'>
                    Your account is fully activated.
                  </p>
                  <div className='bg-gray-50 rounded-xl p-6 my-8 text-left space-y-2 border'>
                    <p className='font-semibold text-gray-800'>Your Account:</p>
                    <p className='text-gray-600'>
                      <strong>Email:</strong> {user.profile.email}
                    </p>
                    <p className='text-gray-600'>
                      <strong>Status:</strong> Active
                    </p>
                  </div>
                  <a href='/meet'>
                    <Button variant='primary' className='w-full'>
                      Go to Sonacove Meets
                    </Button>
                  </a>
                </>
              )}
            </div>
          )}

          {/* --- Error View --- */}
          {currentView === 'error' && (
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
                  <Button
                    onClick={() => authService.signup()}
                    variant='primary'
                    className='w-full'
                  >
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
          )}
        </div>
      </div>
    </>
  );
};

export default OnboardingFlow;
