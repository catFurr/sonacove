import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { validateKeycloakToken, parseUserFromToken } from '../../../utils/auth';

import Header from '../../../components/Header';
import { CircleAlert, CircleCheck } from 'lucide-react';
import Button from '../../../components/Button';

interface UserInfo {
  name?: string;
  email?: string;
  context?: {
    user?: {
      subscription_status?: string;
    };
  };
}

// Storage key constants
const STORAGE_KEYS = {
  AUTH_TOKEN: 'sonacove_auth_token',
  USER_INFO: 'sonacove_user_info',
  SUBSCRIPTION_STATUS: 'sonacove_subscription_status',
};

const OnboardingFlow: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<
    'initial' | 'success' | 'error'
  >('initial');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [userFriendlyError, setUserFriendlyError] = useState(
    'We encountered an unexpected issue.',
  );
  const [detailedErrorMessage, setDetailedErrorMessage] = useState<
    string | null
  >(null);
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

  const showSuccessContent = (skipped = false) => {
    setCurrentView('success');
    if (userInfo) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.SUBSCRIPTION_STATUS,
          skipped ? 'trialing' : 'active',
        );
      } catch (e) {
        handleError("Couldn't save your subscription status locally.", e);
      }
    }
  };

  const setupPaddleCheckout = async () => {
    try {
      if (!paddle.current) {
        const environment =
          (env.PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production') ||
          'sandbox';
        const clientToken = env.PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!clientToken)
          throw new Error('Paddle client token is not configured');

        paddle.current = await initializePaddle({
          environment,
          token: clientToken,
          eventCallback: (data) => {
            if (data.name === 'checkout.completed') showSuccessContent(false);
            else if (data.name === 'checkout.error')
              handleError(
                'There was a problem with the payment process.',
                data.error,
              );
          },
        });
      }
    } catch (error) {
      console.error('Error setting up Paddle checkout:', error);
      throw error;
    }
  };

  const openPaddleCheckout = async () => {
    if (!paddle.current) {
      try {
        await setupPaddleCheckout();
      } catch (error) {
        handleError(
          'The subscription service is currently unavailable.',
          error,
        );
        return;
      }
    }
    try {
      await paddle.current?.Checkout.open({
        items: [{ priceId: env.PUBLIC_PADDLE_PRICE_ID, quantity: 1 }],
        ...(discountCode && { discountCode }),
        settings: { displayMode: 'overlay' },
        ...(userInfo?.email && { customer: { email: userInfo.email } }),
      });
    } catch (error) {
      handleError('Could not open the subscription window.', error);
    }
  };

  const updateRegistrationUrl = () => {
    const redirectUri = new URL('/onboarding', window.location.origin);
    if (discountCode) redirectUri.searchParams.set('discount', discountCode);
    const keycloakBaseUrl = `https://${env.PUBLIC_KC_HOSTNAME}/realms/jitsi/protocol/openid-connect`;
    return `${keycloakBaseUrl}/registrations?client_id=jitsi-web&redirect_uri=${encodeURIComponent(
      redirectUri.toString(),
    )}&response_type=token`;
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    const init = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const discountFromQuery = urlParams.get('discount');
        if (discountFromQuery) setDiscountCode(discountFromQuery);

        let tokenFromHash: string | null = null;
        if (window.location.hash) {
          const fragmentParams = new URLSearchParams(
            window.location.hash.substring(1),
          );
          tokenFromHash = fragmentParams.get('access_token');
          if (tokenFromHash) {
            setAccessToken(tokenFromHash);
            window.location.hash = '';
          }
        }

        const tokenToValidate =
          tokenFromHash || localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (tokenToValidate) {
          const isValid = await validateKeycloakToken(
            tokenToValidate,
            env.PUBLIC_KC_HOSTNAME,
          );
          if (isValid) {
            const parsedUser = parseUserFromToken(tokenToValidate);
            setUserInfo(parsedUser);
            setAccessToken(tokenToValidate);
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, tokenToValidate);
            localStorage.setItem(
              STORAGE_KEYS.USER_INFO,
              JSON.stringify(parsedUser),
            );

            const tokenSubStatus =
              parsedUser?.context?.user?.subscription_status;
            const existingLocalStatus = localStorage.getItem(
              STORAGE_KEYS.SUBSCRIPTION_STATUS,
            );
            if (
              tokenSubStatus === 'active' ||
              existingLocalStatus === 'active'
            ) {
              localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, 'active');
            } else {
              localStorage.setItem(
                STORAGE_KEYS.SUBSCRIPTION_STATUS,
                'trialing',
              );
            }
            setCurrentView('success');
            await setupPaddleCheckout();
          } else {
            localStorage.clear();
            handleError(
              'Your session appears to be invalid or has expired.',
              'TokenValidationFalse',
            );
          }
        } else {
          setCurrentView('initial');
        }
      } catch (error) {
        localStorage.clear();
        handleError(
          'We encountered a problem while setting up your session.',
          error,
        );
      }
    };
    init();
  }, []);

  const isTrialing = useMemo(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS) === 'trialing'
      );
    } catch (e) {
      return false;
    }
  }, [currentView]);

  const getMeetLink = () => {
    return `/meet/#access_token=${accessToken}`;
  }

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
                To begin, please create an account or log in.
              </p>
              <a
                href={updateRegistrationUrl()}
                className='block w-full px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-transform hover:scale-105 shadow-md'
              >
                Create a New Account
              </a>
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
          {currentView === 'success' && (
            <div className='text-center'>
              <CircleCheck className='w-16 h-16 mx-auto text-green-500' />
              <h1 className='text-4xl font-bold text-gray-900 mt-6 mb-2'>
                Welcome aboard,{' '}
                {userInfo?.name ? userInfo.name.split(' ')[0] : ''}!
              </h1>

              {isTrialing ? (
                <>
                  <p className='text-lg text-gray-600'>
                    You're now on our unlimited free trial.
                  </p>
                  <div className='bg-gray-50 rounded-xl p-6 my-8 text-left space-y-2 border'>
                    <p className='font-semibold text-gray-800'>Your Account:</p>
                    <p className='text-gray-600'>
                      <strong>Email:</strong> {userInfo?.email}
                    </p>
                    <p className='text-gray-600'>
                      <strong>Status:</strong> Free Trial (1000 minutes)
                    </p>
                  </div>
                  <div className='space-y-4'>
                    <Button
                      onClick={openPaddleCheckout}
                      variant='primary'
                      className='w-full mb-4'
                    >
                      Subscribe Now for Full Access
                    </Button>
                    <a href={getMeetLink()} className='w-full'>
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
                      <strong>Email:</strong> {userInfo?.email}
                    </p>
                    <p className='text-gray-600'>
                      <strong>Status:</strong> Active
                    </p>
                  </div>
                  <a href={getMeetLink()} className='w-full'>
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
                <a href={updateRegistrationUrl()} className='w-full'>
                  <Button
                    onClick={() => {}}
                    variant='primary'
                    className='w-full'
                  >
                    Try Again
                  </Button>
                </a>
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
