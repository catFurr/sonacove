import React from 'react';
import type { Testimonial } from '../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  index,
}) => {
  const { company, quote, text } = testimonial;

  const ReviewInfo = (
    <div className='p-8 flex flex-col flex-grow pb-20'>
      <div className='flex-grow'>
        <h4 className='text-2xl font-semibold text-gray-800 mb-4 font-serif leading-snug'>
          “{quote}”
        </h4>
        <p className='text-gray-600 leading-relaxed text-lg'>{text}</p>
      </div>
    </div>
  );

  // The user wants the company card on top for ODD numbers (index 1, 3, 5...)
  const isCompanyOnTop = index % 2 !== 0;

  return (
    <div className='bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col h-full break-inside-avoid'>
      {isCompanyOnTop ? (
        <>
          {company && <div className='border-t border-gray-100' />}
          {ReviewInfo}
        </>
      ) : (
        <>
          {ReviewInfo}
          {company && <div className='border-t border-gray-100' />}
          {}
        </>
      )}
    </div>
  );
};

export default TestimonialCard;
