import React from 'react';
import type { Testimonial } from './types';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const LoooLogo = () => (
  <svg
    width='71'
    height='17'
    viewBox='0 0 71 17'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g clipPath='url(#clip0_165704_3795)'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6 11.493C5.46957 11.493 4.96086 11.2823 4.58579 10.9072C4.21071 10.5321 4 10.0234 4 9.49297V0.292969H0V9.49297C0 12.8066 2.6864 15.493 6 15.493H10.4V11.493H6ZM18 4.29297C17.5272 4.29297 17.0591 4.38609 16.6223 4.567C16.1856 4.74792 15.7887 5.01309 15.4544 5.34738C15.1201 5.68168 14.8549 6.07854 14.674 6.51531C14.4931 6.95208 14.4 7.42021 14.4 7.89297C14.4 8.36573 14.4931 8.83386 14.674 9.27063C14.8549 9.7074 15.1201 10.1043 15.4544 10.4386C15.7887 10.7728 16.1856 11.038 16.6223 11.2189C17.0591 11.3999 17.5272 11.493 18 11.493C18.9548 11.493 19.8705 11.1137 20.5456 10.4386C21.2207 9.76342 21.6 8.84775 21.6 7.89297C21.6 6.93819 21.2207 6.02252 20.5456 5.34738C19.8705 4.67225 18.9548 4.29297 18 4.29297ZM10.4 7.89297C10.4 3.69577 13.8028 0.292969 18 0.292969C22.1972 0.292969 25.6 3.69577 25.6 7.89297C25.6 12.0902 22.1972 15.493 18 15.493C13.8028 15.493 10.4 12.0902 10.4 7.89297ZM61.2 4.29297C60.2452 4.29297 59.3295 4.67225 58.6544 5.34738C57.9793 6.02252 57.6 6.93819 57.6 7.89297C57.6 8.84775 57.9793 9.76342 58.6544 10.4386C59.3295 11.1137 60.2452 11.493 61.2 11.493C62.1548 11.493 63.0705 11.1137 63.7456 10.4386C64.4207 9.76342 64.8 8.84775 64.8 7.89297C64.8 6.93819 64.4207 6.02252 63.7456 5.34738C63.0705 4.67225 62.1548 4.29297 61.2 4.29297ZM53.6 7.89297C53.6 3.69577 57.0028 0.292969 61.2 0.292969C65.3972 0.292969 68.8 3.69577 68.8 7.89297C68.8 12.0902 65.3972 15.493 61.2 15.493C57.0028 15.493 53.6 12.0902 53.6 7.89297ZM34 0.292969C29.8028 0.292969 26.4 3.69577 26.4 7.89297C26.4 12.0902 29.8028 15.493 34 15.493H45.2C45.9876 15.493 46.7472 15.373 47.4616 15.1506L49.6 16.293L51.9072 11.9714C52.4933 10.8712 52.7999 9.64388 52.8 8.39737V7.89297C52.8 3.69577 49.3972 0.292969 45.2 0.292969H34ZM48.8 7.89297C48.8 6.93819 48.4207 6.02252 47.7456 5.34738C47.0704 4.67225 46.1548 4.29297 45.2 4.29297H34C33.5272 4.29297 33.0591 4.38609 32.6223 4.567C32.1856 4.74792 31.7887 5.01309 31.4544 5.34738C31.1201 5.68168 30.8549 6.07854 30.674 6.51531C30.4931 6.95208 30.4 7.42021 30.4 7.89297C30.4 8.36573 30.4931 8.83386 30.674 9.27063C30.8549 9.7074 31.1201 10.1043 31.4544 10.4386C31.7887 10.7728 32.1856 11.038 32.6223 11.2189C33.0591 11.3999 33.5272 11.493 34 11.493H45.2C46.1499 11.493 47.0614 11.1176 47.7357 10.4485C48.4101 9.77938 48.7926 8.87089 48.8 7.92097V7.89297Z'
        fill='#051738'
      />
      <path
        d='M70.4004 1.29297C70.4004 1.55819 70.295 1.81254 70.1075 2.00008C69.92 2.18761 69.6656 2.29297 69.4004 2.29297C69.1352 2.29297 68.8808 2.18761 68.6933 2.00008C68.5057 1.81254 68.4004 1.55819 68.4004 1.29297C68.4004 1.02775 68.5057 0.773398 68.6933 0.585862C68.8808 0.398326 69.1352 0.292969 69.4004 0.292969C69.6656 0.292969 69.92 0.398326 70.1075 0.585862C70.295 0.773398 70.4004 1.02775 70.4004 1.29297Z'
        fill='#051738'
      />
    </g>
    <defs>
      <clipPath id='clip0_165704_3795'>
        <rect
          width='70.4'
          height='16'
          fill='white'
          transform='translate(0 0.292969)'
        />
      </clipPath>
    </defs>
  </svg>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  index,
}) => {
  const { company, quote, text, author } = testimonial;

  // For cleanliness, we can define the two main parts as JSX constants
  const CompanyInfo = company ? (
    <div className='p-6 flex items-center justify-between'>
      <LoooLogo />
      <div className='flex items-center gap-2 font-semibold text-gray-800'>
        <span>{company.rating.toFixed(1)}</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='w-5 h-5 text-yellow-400'
        >
          <path
            fillRule='evenodd'
            d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z'
            clipRule='evenodd'
          />
        </svg>
      </div>
    </div>
  ) : null;

  const ReviewInfo = (
    <div className='p-8 flex flex-col flex-grow'>
      <div className='flex-grow'>
        <h4 className='text-2xl font-semibold text-gray-800 mb-4 font-serif leading-snug'>
          “{quote}”
        </h4>
        <p className='text-gray-600 leading-relaxed text-lg'>{text}</p>
      </div>
      <div className='flex items-center gap-4 mt-8 pt-6 border-t border-gray-100'>
        <img
          src={author.avatar}
          alt={author.name}
          className='w-12 h-12 rounded-full object-cover'
        />
        <div>
          <p className='font-semibold text-gray-900'>{author.name}</p>
          <p className='text-sm text-gray-500'>{author.title}</p>
        </div>
      </div>
    </div>
  );

  // The user wants the company card on top for ODD numbers (index 1, 3, 5...)
  const isCompanyOnTop = index % 2 !== 0;

  return (
    <div className='bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col h-full break-inside-avoid'>
      {isCompanyOnTop ? (
        <>
          {CompanyInfo}
          {company && <div className='border-t border-gray-100' />}
          {ReviewInfo}
        </>
      ) : (
        <>
          {ReviewInfo}
          {company && <div className='border-t border-gray-100' />}
          {CompanyInfo}
        </>
      )}
    </div>
  );
};

export default TestimonialCard;
