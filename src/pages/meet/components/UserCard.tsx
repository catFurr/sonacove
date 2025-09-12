import React from 'react';
import Tabs from './Tabs';
import type { User } from './types';


const UserCard: React.FC<User> = ({
  user,
  meetingsList,
  recordings,
  notes,
}) => {
  return (
    <div className='bg-white rounded-3xl p-6 border border-gray-200 shadow-sm lg:col-span-3'>
      <div className='flex flex-col sm:flex-row sm:items-start gap-6 mb-8'>
        {/* Avatar */}
        <img
          src={user.avatarUrl || '/default-avatar.png'}
          alt='User Avatar'
          className='user-avatar w-20 h-20 rounded-full object-cover mx-auto sm:mx-0'
        />

        {/* User Info */}
        <div className='flex-1 text-center sm:text-left flex flex-col justify-center'>
          <h3 className='text-3xl font-bold text-black'>{user.name}</h3>
          <p className='text-gray-500 text-lg'>{user.email}</p>
          <p className='text-gray-500 text-lg mt-2'>
            Plan: <span className='font-bold text-black'>{user.plan}</span>
          </p>
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
      <Tabs
        meetingsList={meetingsList}
        recordings={recordings}
        notes={notes}
      />
    </div>
  );
};

export default UserCard;
