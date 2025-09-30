import React from 'react';
import Avatar from '../../../components/Avatar';

interface UserInfoProps {
  user: {
    name: string;
    email: string;
    plan: string;
    avatarUrl?: string;
  };
}

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

const UserInfo: React.FC<UserInfoProps> = ({ user }) => (
  <div className='flex flex-col sm:flex-row sm:items-start gap-6 mb-8'>
    <Avatar
      src={user.avatarUrl}
      alt={user.name}
      editable={true}
      className='user-avatar w-20 h-20 rounded-full object-cover mx-auto sm:mx-0'
    />
    <div className='flex-1 text-center sm:text-left flex flex-col justify-center'>
      <h3 className='text-3xl font-bold text-black'>{user.name}</h3>
      <p className='text-gray-500 text-lg'>{user.email}</p>
      <p className='text-gray-500 text-lg mt-2 flex flex-row gap-2 justify-center sm:justify-normal'>
        Plan:{' '}
        <span className='font-bold text-black'>
          {capitalizeFirstLetter(user.plan)}
        </span>
      </p>
    </div>
  </div>
);

export default UserInfo;
