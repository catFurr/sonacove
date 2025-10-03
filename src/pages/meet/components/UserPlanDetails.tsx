import React from 'react';

interface PlanUsageDetailsProps {
  plan: string;
  minutesUsed: number;
  usedBookings: number;
  maxBookings: number;
}

const UserPlanDetails: React.FC<PlanUsageDetailsProps> = ({
  plan,
  minutesUsed,
  usedBookings,
  maxBookings,
}) => {
  const totalMinutes = 1000;
  const progressPercentage = Math.min((minutesUsed / totalMinutes) * 100, 100);
  const bookingProgressPercentage =
    maxBookings > 0 ? (usedBookings / maxBookings) * 100 : 0;

  return (
    <>
      {plan === 'trialing' && (
        <div className='px-6 sm:px-0 sm:pr-20'>
          <div className='flex justify-between text-sm font-medium text-gray-600 mb-1 pt-3'>
            <span>Free Minutes Used</span>
            <span>
              {minutesUsed} / {totalMinutes}
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2.5'>
            <div
              className='bg-primary-500 h-2.5 rounded-full'
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {plan === 'active' && (
        <p className='text-sm text-gray-500 pt-3 sm:mx-0 mx-auto'>
          Total Minutes Hosted:{' '}
          <span className='font-semibold text-gray-800'>
            {minutesUsed.toLocaleString()}
          </span>
        </p>
      )}

      <div className='mt-4 mb-4 px-6 sm:px-0 sm:pr-20'>
        <div className='flex justify-between text-sm font-medium text-gray-600 mb-1'>
          <span>Bookings Used</span>
          <span>
            {usedBookings} / {maxBookings}
          </span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2.5'>
          <div
            className='bg-blue-500 h-2.5 rounded-full transition-all duration-500'
            style={{ width: `${bookingProgressPercentage}%` }}
          />
        </div>
      </div>
    </>
  );
};

export default UserPlanDetails;
