import React, { useState, useEffect} from 'react';
import Tabs from './Tabs';
import type { User } from './types';
import Avatar from '../../../components/Avatar';

interface UserCardProps extends User {
  minutesUsed?: number;
  token?: string;
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str; 
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const UserCard: React.FC<UserCardProps> = ({ user, meetingsList, recordings, notes, minutesUsed, token }) => {
  const [subscriptionUrl, setSubscriptionUrl] = useState('');

  // The token's validity is now determined entirely by the parent.
  // If we receive a token, we assume it's valid. If not, it's expired.
  const isExpired = !token;

  const authDomain =
    window.location.hostname === 'sonacove.com'
      ? 'auth.sonacove.com'
      : 'staj.sonacove.com/auth';
  const manageAccountUrl = `https://${authDomain}/realms/jitsi/account`;

  useEffect(() => {
    const defaultUrl = `${window.location.origin}/onboarding#access_token=${token}`;
    setSubscriptionUrl(defaultUrl);

    if (user.plan === 'active') {
      fetch(`${window.location.origin}/api/paddle-customer-portal`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.url) {
            setSubscriptionUrl(data.url);
          }
        })
        .catch((error) =>
          console.error('Error fetching subscription URL:', error),
        );
    }
  }, [user.plan, token]);

  const handleSubscriptionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isExpired) {
      e.preventDefault();
      alert(
        'Your session has expired. Please log in again to manage your plan.',
      );
    }
  };

  const totalMinutes = 1000;
  const progressPercentage = minutesUsed
    ? Math.min((minutesUsed / totalMinutes) * 100, 100)
    : 0;

  return (
    <div className='bg-white rounded-3xl p-6 border border-gray-200 shadow-sm lg:col-span-3'>
      <div className='flex flex-col sm:flex-row sm:items-start gap-6 mb-8'>
        {/* Avatar */}
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          className='user-avatar w-20 h-20 rounded-full object-cover mx-auto sm:mx-0'
        />

        {/* User Info */}
        <div className='flex-1 text-center sm:text-left flex flex-col justify-center'>
          <h3 className='text-3xl font-bold text-black'>{user.name}</h3>
          <p className='text-gray-500 text-lg'>{user.email}</p>
          <p className='text-gray-500 text-lg mt-2 flex flex-row gap-2 justify-center sm:justify-normal'>
            Plan:{' '}
            <span className='font-bold text-black'>
              {capitalizeFirstLetter(user.plan)}
            </span>
          </p>

          {user.plan === 'trialing' && typeof minutesUsed === 'number' && (
            <div className='mt-4 px-4'>
              <div className='flex justify-between text-sm font-medium text-gray-600 mb-1'>
                <span>Free Minutes Used</span>
                <span>
                  {minutesUsed} / {totalMinutes}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2.5'>
                <div
                  className='bg-primary-500 h-2.5 rounded-full'
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className='flex flex-col gap-2 mt-4 sm:mt-0 sm:ml-4 items-center sm:items-end'>
          <a
            href={manageAccountUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='px-7 py-3 border border-primary-500 text-primary-500 text-sm font-semibold rounded-full hover:bg-primary-50 w-full text-center'
          >
            Manage Account
          </a>
          <a
            href={subscriptionUrl}
            target='_blank'
            rel='noopener noreferrer'
            onClick={handleSubscriptionClick}
            className={`px-7 py-3 border border-black text-black text-sm font-semibold rounded-full w-full text-center transition-opacity ${
              isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
          >
            Manage Plan
          </a>
        </div>
      </div>

      {/* Tabs */}
      <Tabs meetingsList={meetingsList} recordings={recordings} notes={notes} />
    </div>
  );
};

export default UserCard;
