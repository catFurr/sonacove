import React from 'react';
import Tabs from './Tabs';
import type { User } from './types';

interface UserCardProps extends User {
  minutesUsed?: number;
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str; 
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  meetingsList,
  recordings,
  notes,
  minutesUsed, 
}) => {
  const totalMinutes = 1000;
  const progressPercentage = minutesUsed
    ? Math.min((minutesUsed / totalMinutes) * 100, 100)
    : 0;

  return (
    <div className='bg-white rounded-3xl p-6 border border-gray-200 shadow-sm lg:col-span-3'>
      <div className='flex flex-col sm:flex-row sm:items-start gap-6 mb-8'>
        {/* Avatar */}
        <img
          src={user.avatarUrl}
          alt='User Avatar'
          className='user-avatar w-20 h-20 rounded-full object-cover mx-auto sm:mx-0'
        />

        {/* User Info */}
        <div className='flex-1 text-center sm:text-left flex flex-col justify-center'>
          <h3 className='text-3xl font-bold text-black'>{user.name}</h3>
          <p className='text-gray-500 text-lg'>{user.email}</p>
          <p className='text-gray-500 text-lg mt-2 flex flex-row gap-3'>
            Plan:{' '}
            <span className='font-bold text-black'>
              {capitalizeFirstLetter(user.plan)}
            </span>
          </p>

          {user.plan === 'trialing' && typeof minutesUsed === 'number' && (
            <div className='mt-4'>
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
          <button className='px-7 py-3 border border-primary-500 text-primary-500 text-sm font-semibold rounded-full hover:bg-primary-50 w-full'>
            Manage Account
          </button>
          <button className='px-7 py-3 border border-black text-black text-sm font-semibold rounded-full hover:bg-gray-100 w-full'>
            Manage Plan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs meetingsList={meetingsList} recordings={recordings} notes={notes} />
    </div>
  );
};

export default UserCard;
